import { Observable } from 'rxjs/Rx';

import {
  GraphQLSchema,
  DocumentNode,
  GraphQLObjectType,
  GraphQLFieldResolver,
  GraphQLError,
  GraphQLType,
  GraphQLField,
  GraphQLList,
  GraphQLNonNull,
  OperationDefinitionNode,
  FragmentDefinitionNode,
  ResponsePath,
  FieldNode,
  GraphQLResolveInfo,
  isLeafType,
} from 'graphql';

import {
  getArgumentValues,
} from 'graphql/execution/values';

import {
  buildExecutionContext,
  collectFields,
  getFieldDef,
  buildResolveInfo,
  ExecutionContext,
  addPath,
  responsePathAsArray,
} from 'graphql/execution/execute';

export type ExecutionResultType = 'init' | 'data' | 'error' | 'complete';
export type ExecutionResultPath = Array<string | number>;

export interface InitExecution {
  kind: 'init';
  path: ExecutionResultPath;
}

export interface PartialResult {
  kind: 'data';
  path: ExecutionResultPath;
  value: any;
}

export interface ExecutionError {
  kind: 'error';
  path: ExecutionResultPath;
  errors: Array<GraphQLError>;
}

export interface CompleteExecution {
  kind: 'complete';
  path: ExecutionResultPath;
}

export type ExecutionResult =
  InitExecution | PartialResult | ExecutionError | CompleteExecution;

export function execute(
  schema: GraphQLSchema,
  document: DocumentNode,
  rootValue?: any,
  contextValue?: any,
  variableValues?: {[key: string]: any},
  operationName?: string,
  fieldResolver?: GraphQLFieldResolver<any, any>,
): Observable<ExecutionResult> {

  const context = buildExecutionContext(
    schema,
    document,
    rootValue,
    contextValue,
    variableValues,
    operationName,
    fieldResolver,
  );

  return executeOperation(
    context,
    context.operation,
    rootValue,
  );

}

function executeOperation(
  context: ExecutionContext,
  operation: OperationDefinitionNode,
  rootValue: any,
): Observable<ExecutionResult> {
  // TODO mutations: execute serially
  const type = context.schema.getQueryType();
  const fields = collectFields(
    context,
    type,
    operation.selectionSet,
    {},
    {},
  );

  const path = undefined;

  return executeFieldsInParallel(context, type, rootValue, path, fields);
}

function executeFieldsInParallel(
  context: ExecutionContext,
  parentType: GraphQLObjectType,
  sourceValue: any,
  path: ResponsePath,
  fields: {[key: string]: Array<FieldNode>},
): Observable<ExecutionResult> {
  return Object.keys(fields).reduce(
    (results, responseName) => {
      const fieldNodes = fields[responseName];
      const fieldPath = addPath(path, responseName);
      const result = executeField(
        context,
        parentType,
        sourceValue,
        fieldNodes,
        fieldPath,
      );
      return results.merge(result);
    },
    Observable.empty(),
  );
}

function executeField(
  context: ExecutionContext,
  parentType: GraphQLObjectType,
  source: any,
  fieldNodes: Array<FieldNode>,
  path: ResponsePath,
): Observable<ExecutionResult> {
  const fieldNode = fieldNodes[0];
  const fieldName = fieldNode.name.value;

  const fieldDef = getFieldDef(context.schema, parentType, fieldName);
  if (!fieldDef) {
    // TODO avoid execution of not existing fields
    return Observable.empty();
  }
  const resolveFn = fieldDef.resolve || context.fieldResolver;

  const info = buildResolveInfo(
    context,
    fieldDef,
    fieldNodes,
    parentType,
    path,
  );

  const args = getArgumentValues(
    fieldDef,
    fieldNode,
    context.variableValues,
  );
  const result = resolveFn(source, args, context.contextValue, info);

  return Observable.of({
    kind: 'init', path: responsePathAsArray(path),
  }).concat(
    deferExecution(
      context,
      fieldNode,
      fieldDef.type,
      info,
      path,
      result,
    ).concat(
      Observable.of({
        kind: 'complete', path: responsePathAsArray(path),
      }),
    ),
  );

}

function deferExecution(
  context: ExecutionContext,
  fieldNode: FieldNode,
  returnType: GraphQLType,
  info: GraphQLResolveInfo,
  path: ResponsePath,
  result: any,
): Observable<ExecutionResult> {

  return Observable.fromPromise(
    assurePromise(result).then( (value) => {
      if (value instanceof Error) {
        return executeError(result, path);
      }
      if (returnType instanceof GraphQLList) {
        return executeList(
          context,
          fieldNode,
          returnType,
          info,
          path,
          value,
        );
      }
      if (returnType instanceof GraphQLNonNull) {
        return executeNonNull(
          context,
          fieldNode,
          returnType,
          info,
          path,
          value,
        );
      }
      if (returnType instanceof GraphQLObjectType) {
        return executeObject(
          context,
          fieldNode,
          returnType,
          info,
          path,
          value,
        );
      }

      if (isLeafType(returnType)) {
        return executeLeaf(returnType, value, path);
      }

      // Not reachable
      return executeError(new Error(`Cannot complete value of unexpected type ${returnType.toString()}.`), path);
    }),
  ).concatAll();

}

function executeLeaf(
  runtimeType: GraphQLType,
  value: any,
  path: ResponsePath,
): Observable<PartialResult> {
  return Observable.of({
    kind: 'data',
    path: responsePathAsArray(path),
    value,
  });
}

function executeError(
  error: Error,
  path: ResponsePath,
): Observable<ExecutionError> {
  return Observable.of({
    kind: 'error',
    path: responsePathAsArray(path),
    errors: [error],
  });
}

function executeList(
  context: ExecutionContext,
  fieldNode: FieldNode,
  parentType: GraphQLList<any>,
  info: GraphQLResolveInfo,
  path: ResponsePath,
  result: Array<any>,
): Observable<ExecutionResult> {
  return result.reduce(
    (results, item, index) => {
      const fieldPath = addPath(path, index);
      const deferred = deferExecution(
        context,
        fieldNode,
        parentType.ofType,
        info,
        fieldPath,
        item,
      );
      return results.merge(deferred);
    },
    Observable.empty(),
  );
}

function executeObject(
  context: ExecutionContext,
  fieldNode: FieldNode,
  returnType: GraphQLObjectType,
  info: GraphQLResolveInfo,
  path: ResponsePath,
  result: any,
): Observable<ExecutionResult> {
  const subfields = collectFields(
    context,
    returnType,
    fieldNode.selectionSet!,
    {},
    {},
  );
  return executeFieldsInParallel(context, returnType, result, path, subfields);
}

function executeNonNull(
  context: ExecutionContext,
  fieldNode: FieldNode,
  parentType: GraphQLNonNull<any>,
  info: GraphQLResolveInfo,
  path: ResponsePath,
  result: any,
): Observable<ExecutionResult> {
  if ( result === null ) {
    return executeError(new Error('NonNull'), path);
  } else {
    return deferExecution(
      context,
      fieldNode,
      parentType.ofType,
      info,
      path,
      result,
    );
  }
}

function isPromise<T>(value: any): value is Promise<T> {
  return (value as Promise<T>).then !== undefined;
}

function assurePromise<T>(value: Promise<T> | T): Promise<T> {
  return isPromise(value) ? value : Promise.resolve(value);
}

declare module 'graphql/execution/values' {

  import {
    GraphQLField,
    GraphQLDirective,
    FieldNode,
    DirectiveNode
  } from 'graphql';

  function getArgumentValues(
    def: GraphQLField<any, any> | GraphQLDirective,
    node: FieldNode | DirectiveNode,
    variableValues?: { [key: string]: any }
  ): { [key: string]: any };

}

declare module 'graphql/execution/execute' {

  import {
    GraphQLSchema,
    DocumentNode,
    GraphQLFieldResolver,
    FragmentDefinitionNode,
    OperationDefinitionNode,
    GraphQLError,
    GraphQLObjectType,
    SelectionSetNode,
    FieldNode,
    GraphQLField,
    ResponsePath,
    GraphQLResolveInfo,
  } from 'graphql';

  interface ExecutionContext {
    schema: GraphQLSchema;
    fragments: {[key: string]: FragmentDefinitionNode};
    rootValue: any;
    contextValue: any;
    operation: OperationDefinitionNode;
    variableValues: {[key: string]: any};
    fieldResolver: GraphQLFieldResolver<any, any>;
    errors: Array<GraphQLError>;
  }

  function buildExecutionContext(
    schema: GraphQLSchema,
    document: DocumentNode,
    rootValue?: any,
    contextValue?: any,
    rawVariableValues?: {[key: string]: any},
    operationName?: string,
    fieldResolver?: GraphQLFieldResolver<any, any>
  ): ExecutionContext;

  function collectFields(
    exeContext: ExecutionContext,
    runtimeType: GraphQLObjectType,
    selectionSet: SelectionSetNode,
    fields: {[key: string]: Array<FieldNode>},
    visitedFragmentNames: {[key: string]: boolean}
  ): {[key: string]: Array<FieldNode>};

  function getFieldDef(
    schema: GraphQLSchema,
    parentType: GraphQLObjectType,
    fieldName: string
  ): GraphQLField<any, any>;

  function buildResolveInfo(
    exeContext: ExecutionContext,
    fieldDef: GraphQLField<any, any>,
    fieldNodes: Array<FieldNode>,
    parentType: GraphQLObjectType,
    path: ResponsePath,
  ): GraphQLResolveInfo;

  function addPath(prev: ResponsePath, key: string | number): ResponsePath;

  function responsePathAsArray(
    path: ResponsePath
  ): Array<string | number>;

}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Rx_1 = require("rxjs/Rx");
var graphql_1 = require("graphql");
var values_1 = require("graphql/execution/values");
var execute_1 = require("graphql/execution/execute");
function execute(schema, document, rootValue, contextValue, variableValues, operationName, fieldResolver) {
    var context = execute_1.buildExecutionContext(schema, document, rootValue, contextValue, variableValues, operationName, fieldResolver);
    return executeOperation(context, context.operation, rootValue);
}
exports.execute = execute;
function executeOperation(context, operation, rootValue) {
    var type = context.schema.getQueryType();
    var fields = execute_1.collectFields(context, type, operation.selectionSet, {}, {});
    var path = undefined;
    return executeFieldsInParallel(context, type, rootValue, path, fields);
}
function executeFieldsInParallel(context, parentType, sourceValue, path, fields) {
    return Object.keys(fields).reduce(function (results, responseName) {
        var fieldNodes = fields[responseName];
        var fieldPath = execute_1.addPath(path, responseName);
        var result = executeField(context, parentType, sourceValue, fieldNodes, fieldPath);
        return results.merge(result);
    }, Rx_1.Observable.empty());
}
function executeField(context, parentType, source, fieldNodes, path) {
    var fieldNode = fieldNodes[0];
    var fieldName = fieldNode.name.value;
    var fieldDef = execute_1.getFieldDef(context.schema, parentType, fieldName);
    if (!fieldDef) {
        return Rx_1.Observable.empty();
    }
    var resolveFn = fieldDef.resolve || context.fieldResolver;
    var info = execute_1.buildResolveInfo(context, fieldDef, fieldNodes, parentType, path);
    var args = values_1.getArgumentValues(fieldDef, fieldNode, context.variableValues);
    var result = resolveFn(source, args, context.contextValue, info);
    return Rx_1.Observable.of({
        kind: 'init', path: execute_1.responsePathAsArray(path),
    }).concat(deferExecution(context, fieldNode, fieldDef.type, info, path, result).concat(Rx_1.Observable.of({
        kind: 'complete', path: execute_1.responsePathAsArray(path),
    })));
}
function deferExecution(context, fieldNode, returnType, info, path, result) {
    return Rx_1.Observable.fromPromise(assurePromise(result).then(function (value) {
        if (value instanceof Error) {
            return executeError(result, path);
        }
        if (returnType instanceof graphql_1.GraphQLList) {
            return executeList(context, fieldNode, returnType, info, path, value);
        }
        if (returnType instanceof graphql_1.GraphQLNonNull) {
            return executeNonNull(context, fieldNode, returnType, info, path, value);
        }
        if (returnType instanceof graphql_1.GraphQLObjectType) {
            return executeObject(context, fieldNode, returnType, info, path, value);
        }
        if (graphql_1.isLeafType(returnType)) {
            return executeLeaf(returnType, value, path);
        }
        return executeError(new Error("Cannot complete value of unexpected type " + returnType.toString() + "."), path);
    })).concatAll();
}
function executeLeaf(runtimeType, value, path) {
    return Rx_1.Observable.of({
        kind: 'data',
        path: execute_1.responsePathAsArray(path),
        value: value,
    });
}
function executeError(error, path) {
    return Rx_1.Observable.of({
        kind: 'error',
        path: execute_1.responsePathAsArray(path),
        errors: [error],
    });
}
function executeList(context, fieldNode, parentType, info, path, result) {
    return result.reduce(function (results, item, index) {
        var fieldPath = execute_1.addPath(path, index);
        var deferred = deferExecution(context, fieldNode, parentType.ofType, info, fieldPath, item);
        return results.merge(deferred);
    }, Rx_1.Observable.empty());
}
function executeObject(context, fieldNode, returnType, info, path, result) {
    var subfields = execute_1.collectFields(context, returnType, fieldNode.selectionSet, {}, {});
    return executeFieldsInParallel(context, returnType, result, path, subfields);
}
function executeNonNull(context, fieldNode, parentType, info, path, result) {
    if (result === null) {
        return executeError(new Error('NonNull'), path);
    }
    else {
        return deferExecution(context, fieldNode, parentType.ofType, info, path, result);
    }
}
function isPromise(value) {
    return value.then !== undefined;
}
function assurePromise(value) {
    return isPromise(value) ? value : Promise.resolve(value);
}
//# sourceMappingURL=execute.js.map
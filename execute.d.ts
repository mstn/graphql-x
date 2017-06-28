import { Observable } from 'rxjs/Rx';
import { GraphQLSchema, DocumentNode, GraphQLFieldResolver, GraphQLError } from 'graphql';
export declare type ExecutionResultType = 'init' | 'data' | 'error' | 'complete';
export declare type ExecutionResultPath = Array<string | number>;
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
export declare type ExecutionResult = InitExecution | PartialResult | ExecutionError | CompleteExecution;
export declare function execute(schema: GraphQLSchema, document: DocumentNode, rootValue?: any, contextValue?: any, variableValues?: {
    [key: string]: any;
}, operationName?: string, fieldResolver?: GraphQLFieldResolver<any, any>): Observable<ExecutionResult>;

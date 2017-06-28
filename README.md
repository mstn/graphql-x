Partial execution of GraphQL queries (WIP/experiment)

## Why partial execution

GraphQL `execute` function evaluates queries asynchronously, but in a single (big) computational step. Only complete results are returned.

However, we do not want to get stuck in the call of a particular resolver while other parts of the query can be computed and returned to the client.

In other words, `execute` should return an `Observable` instead of a `Promise`. In this way the evaluation of a query is an asynchronous stream of partial results.

```js
  execute(schema, query).subscribe(
    function (partial) {
      // ... got a partial result
    },
    function (error) {
      // ... ops, got an error!
    },
    function () {
      // ... done: the query has been fully evaluated
    }
  );
```

## Implementation

Here, we present some preliminary work for partial evaluation of GraphQL queries.

Summary
* Partial first. We assume that partial evaluation is the default mode.
* Partial results are patches over tree-like data structures.
* Partial failures do not imply global failure.
* We reuse the building blocks of the original executor.
* Every schema that works with this implementation should work also with the original one. In particular, resolvers still return promises and the core executor is not changed. See [discussion](https://github.com/graphql/graphql-js/pull/502).

Current limitations
* Partial first is not always the best policy. Resolvers are often simple projections on an already computed value. In these cases we want to return a single "complete" patch and reduce the number of roundtrips.
* Apparently the package already works for quite complex schemas and queries, but some cases are missing.
* Mutations are not considered at the moment.
* Dependency on rxjs.
* ...

## Credits

* Sashko Stubailo, [New features in GraphQL: Batch, defer, stream, live, and subscribe](https://dev-blog.apollodata.com/new-features-in-graphql-batch-defer-stream-live-and-subscribe-7585d0c28b07), 2016
* The case of `execute` returning an observable instead of a promise is discussed in several places. For example, [here](https://github.com/DxCx/graphql-rxjs), [here](https://github.com/apollographql/apollo-client/issues/1152) [here](https://github.com/graphql/graphql-js/issues/501) and [here](https://github.com/graphql/graphql-js/issues/647).

// the schema comes from
// https://github.com/graphql/graphql-js/blob/master/src/execution/__tests__/schema-test.js

import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID,
} from 'graphql';

const BlogImage = new GraphQLObjectType({
  name: 'Image',
  fields: {
    url: { type: GraphQLString },
    width: { type: GraphQLInt },
    height: { type: GraphQLInt },
  }
});

const BlogAuthor: GraphQLObjectType = new GraphQLObjectType({
  name: 'Author',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    pic: {
      args: { width: { type: GraphQLInt }, height: { type: GraphQLInt } },
      type: BlogImage,
      resolve: (obj, { width, height }) => obj.pic(width, height)
    },
    recentArticle: { type: BlogArticle }
  })
});

const BlogArticle = new GraphQLObjectType({
  name: 'Article',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    isPublished: { type: GraphQLBoolean },
    author: { type: BlogAuthor },
    title: { type: GraphQLString },
    body: { type: GraphQLString },
    keywords: { type: new GraphQLList(GraphQLString) }
  }
});

const BlogQuery = new GraphQLObjectType({
  name: 'Query',
  fields: {
    article: {
      type: BlogArticle,
      args: { id: { type: GraphQLID } },
      resolve: (_, { id }) => article(id)
    },
    feed: {
      type: new GraphQLList(BlogArticle),
      resolve: () => [
        article(1),
        article(2),
        article(3),
        article(4),
        article(5),
        article(6),
        article(7),
        article(8),
        article(9),
        article(10)
      ]
    }
  }
});

const BlogSchema = new GraphQLSchema({
  query: BlogQuery
});

interface Article {
  id: number;
  isPublished: boolean;
  author: Author;
  title: string;
  body: string;
  hidden: string;
  keywords: [string];
}

interface Author {
  id: number;
  name: string;
  pic: any;
  recentArticle: Article;
}

function article(id: number): Article {
  return {
    id,
    isPublished: true,
    author: johnSmith,
    title: 'My Article ' + id,
    body: 'This is a post',
    hidden: 'This data is not exposed in the schema',
    keywords: [ 'foo', 'bar' ]
  };
}

const johnSmith = {
  id: 123,
  name: 'John Smith',
  pic: (width: number, height: number) => getPic(123, width, height),
  recentArticle: article(1)
};

function getPic(uid: number, width: number, height: number) {
  return {
    url: `cdn://${uid}`,
    width: `${width}`,
    height: `${height}`
  };
}

export default BlogSchema;

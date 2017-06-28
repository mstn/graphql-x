import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const { assert, expect } = chai;

import gql from 'graphql-tag';

import BlogSchema from './fixtures/schema';
import { execute, ExecutionResult } from '../src/execute';

describe('Execute: Handles execution with a complex schema', () => {

  const request = gql`
    {
      feed {
        id,
        title
      },
      article(id: "1") {
        ...articleFields,
        author {
          id,
          name,
          pic(width: 640, height: 480) {
            url,
            width,
            height
          },
          recentArticle {
            ...articleFields,
            keywords
          }
        }
      }
    }
    fragment articleFields on Article {
      id,
      isPublished,
      title,
      body,
      hidden,
      notdefined
    }
  `;

  const expectedPartialResults: Array<ExecutionResult> = [
    { kind: 'init', path: [ 'feed' ] },
    { kind: 'init', path: [ 'article' ] },
    { kind: 'init', path: [ 'article', 'id' ] },
    { kind: 'init', path: [ 'article', 'isPublished' ] },
    { kind: 'init', path: [ 'article', 'title' ] },
    { kind: 'init', path: [ 'article', 'body' ] },
    { kind: 'init', path: [ 'article', 'author' ] },
    { kind: 'init', path: [ 'feed', 0, 'id' ] },
    { kind: 'init', path: [ 'feed', 0, 'title' ] },
    { kind: 'init', path: [ 'feed', 1, 'id' ] },
    { kind: 'init', path: [ 'feed', 1, 'title' ] },
    { kind: 'init', path: [ 'feed', 2, 'id' ] },
    { kind: 'init', path: [ 'feed', 2, 'title' ] },
    { kind: 'init', path: [ 'feed', 3, 'id' ] },
    { kind: 'init', path: [ 'feed', 3, 'title' ] },
    { kind: 'init', path: [ 'feed', 4, 'id' ] },
    { kind: 'init', path: [ 'feed', 4, 'title' ] },
    { kind: 'init', path: [ 'feed', 5, 'id' ] },
    { kind: 'init', path: [ 'feed', 5, 'title' ] },
    { kind: 'init', path: [ 'feed', 6, 'id' ] },
    { kind: 'init', path: [ 'feed', 6, 'title' ] },
    { kind: 'init', path: [ 'feed', 7, 'id' ] },
    { kind: 'init', path: [ 'feed', 7, 'title' ] },
    { kind: 'init', path: [ 'feed', 8, 'id' ] },
    { kind: 'init', path: [ 'feed', 8, 'title' ] },
    { kind: 'init', path: [ 'feed', 9, 'id' ] },
    { kind: 'init', path: [ 'feed', 9, 'title' ] },
    { kind: 'data', path: [ 'article', 'isPublished' ], value: true },
    { kind: 'complete', path: [ 'article', 'isPublished' ] },
    { kind: 'data',
      path: [ 'article', 'title' ],
      value: 'My Article 1' },
    { kind: 'complete', path: [ 'article', 'title' ] },
    { kind: 'data',
      path: [ 'article', 'body' ],
      value: 'This is a post' },
    { kind: 'complete', path: [ 'article', 'body' ] },
    { kind: 'init', path: [ 'article', 'author', 'id' ] },
    { kind: 'init', path: [ 'article', 'author', 'name' ] },
    { kind: 'init', path: [ 'article', 'author', 'pic' ] },
    { kind: 'init', path: [ 'article', 'author', 'recentArticle' ] },
    { kind: 'data',
      path: [ 'feed', 0, 'title' ],
      value: 'My Article 1' },
    { kind: 'complete', path: [ 'feed', 0, 'title' ] },
    { kind: 'data',
      path: [ 'feed', 1, 'title' ],
      value: 'My Article 2' },
    { kind: 'complete', path: [ 'feed', 1, 'title' ] },
    { kind: 'data',
      path: [ 'feed', 2, 'title' ],
      value: 'My Article 3' },
    { kind: 'complete', path: [ 'feed', 2, 'title' ] },
    { kind: 'data',
      path: [ 'feed', 3, 'title' ],
      value: 'My Article 4' },
    { kind: 'complete', path: [ 'feed', 3, 'title' ] },
    { kind: 'data',
      path: [ 'feed', 4, 'title' ],
      value: 'My Article 5' },
    { kind: 'complete', path: [ 'feed', 4, 'title' ] },
    { kind: 'data',
      path: [ 'feed', 5, 'title' ],
      value: 'My Article 6' },
    { kind: 'complete', path: [ 'feed', 5, 'title' ] },
    { kind: 'data',
      path: [ 'feed', 6, 'title' ],
      value: 'My Article 7' },
    { kind: 'complete', path: [ 'feed', 6, 'title' ] },
    { kind: 'data',
      path: [ 'feed', 7, 'title' ],
      value: 'My Article 8' },
    { kind: 'complete', path: [ 'feed', 7, 'title' ] },
    { kind: 'data',
      path: [ 'feed', 8, 'title' ],
      value: 'My Article 9' },
    { kind: 'complete', path: [ 'feed', 8, 'title' ] },
    { kind: 'data',
      path: [ 'feed', 9, 'title' ],
      value: 'My Article 10' },
    { kind: 'complete', path: [ 'feed', 9, 'title' ] },
    { kind: 'data', path: [ 'article', 'id' ], value: '1' },
    { kind: 'complete', path: [ 'article', 'id' ] },
    { kind: 'data', path: [ 'article', 'author', 'id' ], value: 123 },
    { kind: 'complete', path: [ 'article', 'author', 'id' ] },
    { kind: 'data',
      path: [ 'article', 'author', 'name' ],
      value: 'John Smith' },
    { kind: 'complete', path: [ 'article', 'author', 'name' ] },
    { kind: 'init', path: [ 'article', 'author', 'pic', 'url' ] },
    { kind: 'init', path: [ 'article', 'author', 'pic', 'width' ] },
    { kind: 'init', path: [ 'article', 'author', 'pic', 'height' ] },
    { kind: 'init',
      path: [ 'article', 'author', 'recentArticle', 'id' ] },
    { kind: 'init',
      path: [ 'article', 'author', 'recentArticle', 'isPublished' ] },
    { kind: 'init',
      path: [ 'article', 'author', 'recentArticle', 'title' ] },
    { kind: 'init',
      path: [ 'article', 'author', 'recentArticle', 'body' ] },
    { kind: 'init',
      path: [ 'article', 'author', 'recentArticle', 'keywords' ] },
    { kind: 'data', path: [ 'feed', 0, 'id' ], value: 1 },
    { kind: 'complete', path: [ 'feed', 0, 'id' ] },
    { kind: 'data', path: [ 'feed', 1, 'id' ], value: 2 },
    { kind: 'complete', path: [ 'feed', 1, 'id' ] },
    { kind: 'data', path: [ 'feed', 2, 'id' ], value: 3 },
    { kind: 'complete', path: [ 'feed', 2, 'id' ] },
    { kind: 'data', path: [ 'feed', 3, 'id' ], value: 4 },
    { kind: 'complete', path: [ 'feed', 3, 'id' ] },
    { kind: 'data', path: [ 'feed', 4, 'id' ], value: 5 },
    { kind: 'complete', path: [ 'feed', 4, 'id' ] },
    { kind: 'data', path: [ 'feed', 5, 'id' ], value: 6 },
    { kind: 'complete', path: [ 'feed', 5, 'id' ] },
    { kind: 'data', path: [ 'feed', 6, 'id' ], value: 7 },
    { kind: 'complete', path: [ 'feed', 6, 'id' ] },
    { kind: 'data', path: [ 'feed', 7, 'id' ], value: 8 },
    { kind: 'complete', path: [ 'feed', 7, 'id' ] },
    { kind: 'data', path: [ 'feed', 8, 'id' ], value: 9 },
    { kind: 'complete', path: [ 'feed', 8, 'id' ] },
    { kind: 'data', path: [ 'feed', 9, 'id' ], value: 10 },
    { kind: 'complete', path: [ 'feed', 9, 'id' ] },
    { kind: 'complete', path: [ 'feed' ] },
    { kind: 'data',
      path: [ 'article', 'author', 'pic', 'url' ],
      value: 'cdn://123' },
    { kind: 'complete',
      path: [ 'article', 'author', 'pic', 'url' ] },
    { kind: 'data',
      path: [ 'article', 'author', 'pic', 'width' ],
      value: '640' },
    { kind: 'complete',
      path: [ 'article', 'author', 'pic', 'width' ] },
    { kind: 'data',
      path: [ 'article', 'author', 'pic', 'height' ],
      value: '480' },
    { kind: 'complete',
      path: [ 'article', 'author', 'pic', 'height' ] },
    { kind: 'complete', path: [ 'article', 'author', 'pic' ] },
    { kind: 'data',
      path: [ 'article', 'author', 'recentArticle', 'isPublished' ],
      value: true },
    { kind: 'complete',
      path: [ 'article', 'author', 'recentArticle', 'isPublished' ] },
    { kind: 'data',
      path: [ 'article', 'author', 'recentArticle', 'title' ],
      value: 'My Article 1' },
    { kind: 'complete',
      path: [ 'article', 'author', 'recentArticle', 'title' ] },
    { kind: 'data',
      path: [ 'article', 'author', 'recentArticle', 'body' ],
      value: 'This is a post' },
    { kind: 'complete',
      path: [ 'article', 'author', 'recentArticle', 'body' ] },
    { kind: 'data',
      path: [ 'article', 'author', 'recentArticle', 'id' ],
      value: 1 },
    { kind: 'complete',
      path: [ 'article', 'author', 'recentArticle', 'id' ] },
    { kind: 'data',
      path: [ 'article', 'author', 'recentArticle', 'keywords', 0 ],
      value: 'foo' },
    { kind: 'data',
      path: [ 'article', 'author', 'recentArticle', 'keywords', 1 ],
      value: 'bar' },
    { kind: 'complete',
      path: [ 'article', 'author', 'recentArticle', 'keywords' ] },
    { kind: 'complete',
      path: [ 'article', 'author', 'recentArticle' ] },
    { kind: 'complete', path: [ 'article', 'author' ] },
    { kind: 'complete', path: [ 'article' ] },
  ];

  it('executes using a schema', (done) => {
    const partials: Array<ExecutionResult> = [];
    execute(BlogSchema, request).subscribe(
      function (next) {
        partials.push(next);
      },
      function (error) {
        assert(false, 'Unexpected error');
        done();
      },
      function () {
        expect(partials).to.have.deep.members(expectedPartialResults);
        done();
      },
    );
  });
});

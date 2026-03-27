import { describe, test, expect } from '@jest/globals';
import sql, { joinSQLValues } from './index.js';
import { YError } from 'yerror';

describe('sql', () => {
  test('should work with a valid simple query', () => {
    const query = sql`SELECT * FROM users`;

    expect(query).toMatchInlineSnapshot(`
      {
        "parts": [
          "SELECT * FROM users",
        ],
        "text": "SELECT * FROM users",
        "type": Symbol(SQLStatement),
        "values": [],
      }
    `);
  });

  test('should work with a valid complexer query', () => {
    const query = sql`SELECT * FROM users WHERE id=${1} AND type IN (${joinSQLValues(
      ['admin', 'user'],
    )}, ${joinSQLValues(['root', 'visitor'])})`;

    expect(query).toMatchInlineSnapshot(`
      {
        "parts": [
          "SELECT * FROM users WHERE id=",
          " AND type IN (",
          ", ",
          ", ",
          ", ",
          ")",
        ],
        "text": "SELECT * FROM users WHERE id=$1 AND type IN ($2, $3, $4, $5)",
        "type": Symbol(SQLStatement),
        "values": [
          1,
          "admin",
          "user",
          "root",
          "visitor",
        ],
      }
    `);
  });

  test('should fail with malformed query', async () => {
    let query;

    try {
      query = sql`SELECT * FROM ${null}`;

      if (query) {
        throw new YError('E_UNEXPECTED_SUCCESS');
      }
    } catch (err) {
      expect({
        errorCode: (err as YError).code,
        errorDebugValues: (err as YError).debugValues,
      }).toMatchInlineSnapshot(`
       {
         "errorCode": "E_INVALID_QUERY",
         "errorDebugValues": [
           "SELECT * FROM NULL",
         ],
       }
      `);
    }
  });
});

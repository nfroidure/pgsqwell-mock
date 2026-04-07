import sql, {
  sqlPart,
  joinSQLValues,
  escapeSQLIdentifier,
  emptySQLPart,
  buildQuery,
  mergeSQLParts,
  type SQLStringLiteralParameter,
  type SQLStatement,
} from 'pgsqwell';
import { YError } from 'yerror';
import { parseSync, loadModule } from 'libpg-query';

declare module 'yerror' {
  interface YErrorRegistry {
    E_INVALID_QUERY: [builtQuery: string];
  }
}

export {
  sqlPart,
  joinSQLValues,
  escapeSQLIdentifier,
  emptySQLPart,
  mergeSQLParts,
};

await loadModule();

/* Architecture Note #2: Checking SQL syntax

Its purpose it to ensure queries made with the `sql` tag are well
 formed while running your unit tests.
*/
export default function sqlMock<T extends SQLStringLiteralParameter[]>(
  chunks: TemplateStringsArray,
  ...parameters: T
): SQLStatement {
  const query = sql<T>(chunks, ...parameters);
  const builtQuery = buildQuery(query);
  try {
    parseSync(builtQuery);
  } catch (err) {
    throw YError.wrap(err as Error, 'E_INVALID_QUERY', [builtQuery]);
  }

  return query;
}

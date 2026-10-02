import { DurableObject } from 'cloudflare:workers';
import validIds from './valid-ids.json';
import type { PairAnswerList, User } from '../../../shared/user-data';

let validIdSet: Set<number> | null = null;

/**
 * Answers are deduplicated by pair and filtered to valid IDs, so this can't be
 * exceeded by valid data. It's a backstop against storing huge blobs.
 */
const maxPairAnswers = (validIds.length * (validIds.length - 1)) / 2;

/**
 * User details come from GitHub, which has its own limits, but this guards
 * against storing anything huge.
 */
const maxUserStringLength = 1_000;

function getValidIdSet() {
  if (!validIdSet) {
    validIdSet = new Set(validIds);
  }
  return validIdSet;
}

type UserDBValue = {
  githubId: number; // Primary key
  displayName: string;
  githubUsername: string;
  avatarSrc: string;
  rankings: string;
  pairAnswers: ArrayBuffer | null;
};

/**
 * Schema migrations, applied in order. Each runs once per database, and its
 * position in this list is its ID, so never reorder or remove entries. Only
 * add new ones to the end.
 *
 * `PRAGMA user_version` isn't supported in Durable Objects, so applied
 * migrations are tracked in a table.
 */
const migrations: string[] = [
  // Existing databases were created before migrations were tracked, hence IF
  // NOT EXISTS.
  `
    CREATE TABLE IF NOT EXISTS users (
      githubId INTEGER PRIMARY KEY,
      displayName TEXT,
      githubUsername TEXT,
      avatarSrc TEXT,
      rankings TEXT
    )
  `,
  // See encodePairAnswers for the format.
  `ALTER TABLE users ADD COLUMN pairAnswers BLOB`,
];

/**
 * Pair answers are stored as a flat list of uint16 [preferredId, otherId]
 * pairs, which is 4 bytes per answer. Item IDs are filtered against
 * valid-ids.json, which must stay within uint16 range.
 */
function encodePairAnswers(answers: PairAnswerList): ArrayBuffer {
  const data = new Uint16Array(answers.length * 2);
  for (const [i, [preferredId, otherId]] of answers.entries()) {
    data[i * 2] = preferredId;
    data[i * 2 + 1] = otherId;
  }
  return data.buffer;
}

function decodePairAnswers(buffer: ArrayBuffer | null): PairAnswerList {
  if (!buffer) return [];
  const data = new Uint16Array(buffer);
  const answers: PairAnswerList = [];
  for (let i = 0; i + 1 < data.length; i += 2) {
    answers.push([data[i], data[i + 1]]);
  }
  return answers;
}

export class UserData extends DurableObject<Env> {
  #sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.#sql = ctx.storage.sql;
    // Ensures no requests are handled until the schema is up to date.
    ctx.blockConcurrencyWhile(async () => this.#migrate());
  }

  #migrate() {
    this.#sql.exec(`
      CREATE TABLE IF NOT EXISTS _sql_schema_migrations (
        id INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    const { version } = this.#sql
      .exec<{
        version: number;
      }>('SELECT COALESCE(MAX(id), 0) AS version FROM _sql_schema_migrations')
      .one();

    for (let id = version + 1; id <= migrations.length; id++) {
      // Each migration is recorded in the same transaction, so a failure
      // can't leave it partially applied.
      this.ctx.storage.transactionSync(() => {
        this.#sql.exec(migrations[id - 1]);
        this.#sql.exec('INSERT INTO _sql_schema_migrations (id) VALUES (?)', id);
      });
    }
  }

  getUserById(githubId: number): User | null {
    const query = this.#sql.exec<UserDBValue>(
      'SELECT * FROM users WHERE githubId = ?',
      [githubId]
    );

    const result = query.next();
    if (!result.done) {
      const row = result.value;
      return {
        githubId: row.githubId,
        displayName: row.displayName,
        githubUsername: row.githubUsername,
        avatarSrc: row.avatarSrc,
        rankings: JSON.parse(row.rankings),
        pairAnswers: decodePairAnswers(row.pairAnswers),
      };
    }

    return null;
  }

  saveUser(user: Omit<User, 'rankings' | 'pairAnswers'>) {
    this.#sql.exec(
      `
        INSERT INTO users (githubId, displayName, githubUsername, avatarSrc, rankings) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(githubId) DO UPDATE SET
          displayName = excluded.displayName,
          githubUsername = excluded.githubUsername,
          avatarSrc = excluded.avatarSrc;
      `,
      user.githubId,
      user.displayName.slice(0, maxUserStringLength),
      user.githubUsername.slice(0, maxUserStringLength),
      user.avatarSrc.slice(0, maxUserStringLength),
      '[]'
    );
  }

  saveRankings(
    githubId: number,
    rankings: number[],
    { pairAnswers }: { pairAnswers?: PairAnswerList } = {}
  ) {
    const validIdSet = getValidIdSet();

    // Using a set to filter out duplicates
    const validRankings = new Set(rankings.filter((id) => validIdSet.has(id)));

    this.#sql.exec(
      `
        UPDATE users SET rankings = ? WHERE githubId = ?
      `,
      JSON.stringify([...validRankings]),
      githubId
    );

    // Older clients don't send answers, so leave them alone.
    if (pairAnswers) this.#savePairAnswers(githubId, pairAnswers);
  }

  #savePairAnswers(githubId: number, answers: PairAnswerList) {
    const validIdSet = getValidIdSet();
    // Keyed by pair, so there's only one answer per pair.
    const validAnswers = new Map<string, [number, number]>();

    for (const [preferredId, otherId] of answers) {
      if (preferredId === otherId) continue;
      if (!validIdSet.has(preferredId) || !validIdSet.has(otherId)) continue;
      const key =
        preferredId < otherId
          ? `${preferredId}-${otherId}`
          : `${otherId}-${preferredId}`;
      validAnswers.set(key, [preferredId, otherId]);
    }

    if (validAnswers.size > maxPairAnswers) {
      throw new Error('Too many pair answers');
    }

    this.#sql.exec(
      `
        UPDATE users SET pairAnswers = ? WHERE githubId = ?
      `,
      encodePairAnswers([...validAnswers.values()]),
      githubId
    );
  }

  getAllRankings(): { rankings: number[]; id: number; username: string }[] {
    const query = this.#sql.exec<{
      githubId: number;
      githubUsername: string;
      rankings: string;
    }>(
      'SELECT githubId, githubUsername, rankings FROM users WHERE rankings IS NOT NULL'
    );

    const result: { rankings: number[]; id: number; username: string }[] = [];

    for (const row of query) {
      try {
        const rankings = JSON.parse(row.rankings);
        if (Array.isArray(rankings)) {
          result.push({
            rankings,
            id: row.githubId,
            username: row.githubUsername,
          });
        }
      } catch (error) {
        console.error(
          `Error parsing rankings for user ${row.githubId}:`,
          error
        );
      }
    }

    return result;
  }

  clearAllData() {
    this.#sql.exec('DELETE FROM users');
  }
}

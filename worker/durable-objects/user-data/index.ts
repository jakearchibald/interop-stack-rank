import { DurableObject } from 'cloudflare:workers';
import validIds from './valid-ids.json';
import type { User } from '../../../shared/user-data';

let validIdSet: Set<number> | null = null;

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
};

export class UserData extends DurableObject<Env> {
  #sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.#sql = ctx.storage.sql;
    this.#initializeDatabase();
  }

  async #initializeDatabase() {
    this.#sql.exec(`
      CREATE TABLE IF NOT EXISTS users (
        githubId INTEGER PRIMARY KEY,
        displayName TEXT,
        githubUsername TEXT,
        avatarSrc TEXT,
        rankings TEXT
      )
    `);
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
      };
    }

    return null;
  }

  saveUser(user: Omit<User, 'rankings'>) {
    this.#sql.exec(
      `
        INSERT INTO users (githubId, displayName, githubUsername, avatarSrc, rankings) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(githubId) DO UPDATE SET
          displayName = excluded.displayName,
          githubUsername = excluded.githubUsername,
          avatarSrc = excluded.avatarSrc;
      `,
      user.githubId,
      user.displayName,
      user.githubUsername,
      user.avatarSrc,
      '[]'
    );
  }

  saveRankings(githubId: number, rankings: number[]) {
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

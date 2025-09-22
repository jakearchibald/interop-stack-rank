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

  async getUserById(githubId: number): Promise<User | null> {
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

  async saveUser(user: Omit<User, 'rankings'>) {
    console.log('Saving user:', user);
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
    console.log('Saved user');
  }

  async saveRankings(githubId: number, rankings: number[]) {
    const validIdSet = getValidIdSet();

    for (const ranking of rankings) {
      if (!validIdSet.has(ranking)) {
        throw new Error(`Invalid ranking ID: ${ranking}`);
      }
    }

    const uniqueRankings = [...new Set(rankings)];

    this.#sql.exec(
      `
        UPDATE users SET rankings = ? WHERE githubId = ?
      `,
      JSON.stringify(uniqueRankings),
      githubId
    );
  }
}

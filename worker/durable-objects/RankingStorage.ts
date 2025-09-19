import { DurableObject } from 'cloudflare:workers';

export interface User {
  email: string; // Primary key
  provider_ids: {
    github?: string;
    google?: string;
  };
  name: string;
  username?: string;
  picture?: string;
  created_at: number;
  updated_at: number;
}

export interface UserRanking {
  user_email: string;
  item_id: string;
  rank: number | null; // null = no opinion
  updated_at: number;
}

export class RankingStorage extends DurableObject {
  #sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.#sql = ctx.storage.sql;
    this.#initializeDatabase();
  }

  async #initializeDatabase() {
    // Create users table with email as primary key
    await this.#sql.exec(`
      CREATE TABLE IF NOT EXISTS users (
        email TEXT PRIMARY KEY,
        github_id TEXT,
        google_id TEXT,
        name TEXT NOT NULL,
        username TEXT,
        picture TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    // Create rankings table
    await this.#sql.exec(`
      CREATE TABLE IF NOT EXISTS rankings (
        user_email TEXT NOT NULL,
        item_id TEXT NOT NULL,
        rank INTEGER, -- NULL means no opinion
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (user_email, item_id),
        FOREIGN KEY (user_email) REFERENCES users (email)
      )
    `);

    // Create indexes for efficient queries
    await this.#sql.exec(`
      CREATE INDEX IF NOT EXISTS idx_rankings_user_email ON rankings (user_email)
    `);

    await this.#sql.exec(`
      CREATE INDEX IF NOT EXISTS idx_rankings_item_id ON rankings (item_id)
    `);

    await this.#sql.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_github_id ON users (github_id)
    `);

    await this.#sql.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_google_id ON users (google_id)
    `);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      switch (path) {
        case '/users':
          return await this.#handleUsers(request);
        case '/rankings':
          return await this.#handleRankings(request);
        case '/user-rankings':
          return await this.#handleUserRankings(request);
        default:
          return new Response('Not found', { status: 404 });
      }
    } catch (error) {
      console.error('Durable Object error:', error);
      return new Response('Internal server error', { status: 500 });
    }
  }

  async #handleUsers(request: Request): Promise<Response> {
    if (request.method === 'POST') {
      const { email, provider, provider_id, name, username, picture } =
        (await request.json()) as any;
      const now = Date.now();

      // Check if user exists
      const existingUser = await this.#sql
        .exec('SELECT * FROM users WHERE email = ?', email)
        .one();

      if (existingUser) {
        // Update existing user with new provider info
        const updateField = provider === 'github' ? 'github_id' : 'google_id';
        await this.#sql.exec(
          `
          UPDATE users SET
            ${updateField} = ?,
            name = ?,
            username = COALESCE(?, username),
            picture = COALESCE(?, picture),
            updated_at = ?
          WHERE email = ?
        `,
          provider_id,
          name,
          username,
          picture,
          now,
          email
        );
      } else {
        // Create new user
        const githubId = provider === 'github' ? provider_id : null;
        const googleId = provider === 'google' ? provider_id : null;

        await this.#sql.exec(
          `
          INSERT INTO users (email, github_id, google_id, name, username, picture, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
          email,
          githubId,
          googleId,
          name,
          username,
          picture,
          now,
          now
        );
      }

      const user = await this.#sql
        .exec('SELECT * FROM users WHERE email = ?', email)
        .one();
      return new Response(JSON.stringify(user), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'GET') {
      const email = new URL(request.url).searchParams.get('email');
      if (email) {
        const user = await this.#sql
          .exec('SELECT * FROM users WHERE email = ?', email)
          .one();
        return new Response(JSON.stringify(user || null), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('Method not allowed', { status: 405 });
  }

  async #handleRankings(request: Request): Promise<Response> {
    if (request.method === 'POST') {
      const ranking: Omit<UserRanking, 'updated_at'> = await request.json();
      const now = Date.now();

      await this.#sql.exec(
        `
        INSERT INTO rankings (user_email, item_id, rank, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT (user_email, item_id) DO UPDATE SET
          rank = excluded.rank,
          updated_at = excluded.updated_at
      `,
        ranking.user_email,
        ranking.item_id,
        ranking.rank,
        now
      );

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method not allowed', { status: 405 });
  }

  async #handleUserRankings(request: Request): Promise<Response> {
    if (request.method === 'GET') {
      const userEmail = new URL(request.url).searchParams.get('user_email');
      if (!userEmail) {
        return new Response('Missing user_email parameter', { status: 400 });
      }

      const rankings = await this.#sql
        .exec(
          'SELECT * FROM rankings WHERE user_email = ? ORDER BY rank ASC',
          userEmail
        )
        .toArray();

      return new Response(JSON.stringify(rankings), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'POST') {
      // Save all rankings for a user
      const {
        user_email,
        rankings,
      }: {
        user_email: string;
        rankings: Array<{ item_id: string; rank: number | null }>;
      } = await request.json();
      const now = Date.now();

      // Begin transaction by deleting existing rankings and inserting new ones
      await this.#sql.exec(
        'DELETE FROM rankings WHERE user_email = ?',
        user_email
      );

      for (const ranking of rankings) {
        await this.#sql.exec(
          `
          INSERT INTO rankings (user_email, item_id, rank, updated_at)
          VALUES (?, ?, ?, ?)
        `,
          user_email,
          ranking.item_id,
          ranking.rank,
          now
        );
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method not allowed', { status: 405 });
  }
}

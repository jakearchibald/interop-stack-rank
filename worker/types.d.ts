import type { RankingStorage } from './durable-objects/RankingStorage';

declare global {
  interface Env {
    SESSIONS: KVNamespace;
    RANKING_STORAGE: DurableObjectNamespace<RankingStorage>;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
  }
}

/** Answers to pair questions, as [preferredId, otherId]. */
export type PairAnswerList = [preferredId: number, otherId: number][];

export interface User {
  githubId: number;
  displayName: string;
  githubUsername: string;
  avatarSrc: string;
  rankings: number[];
  pairAnswers: PairAnswerList;
}

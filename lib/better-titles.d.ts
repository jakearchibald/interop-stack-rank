/** Titles and subtitles of proposals, in Markdown, keyed by issue number. */
declare const defs: {
  [key: number]: { title: string; subtitle?: string };
};

export default defs;

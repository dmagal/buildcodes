// Types for the Ontario Building Code 2024 data model

export interface BuildingCode {
  version: '2024';
  parts: Part[];
}

export interface Part {
  part: string;        // "9"
  partTitle: string;   // "Housing and Small Buildings"
  sections: Section[];
}

export interface Section {
  id: string;          // "9.8"
  title: string;       // "Stairs, Ramps, Handrails and Guards"
  subsections: Subsection[];
}

export interface Subsection {
  id: string;          // "9.8.8"
  title: string;       // "Guards"
  articles: Article[];
}

export interface Article {
  id: string;          // "9.8.8.1"
  title: string;       // "Guards Required"
  sentences: Sentence[];
  tables: CodeTable[];
  tags: string[];
  relatedArticles: string[];
  explanation?: Explanation;
}

export interface Sentence {
  number: number;
  text: string;
  clauses: string[];
}

export interface CodeTable {
  id: string;
  title: string;
  headers: string[];
  rows: string[][];
}

export interface Explanation {
  summary: string;
  details: string;
  commonScenarios: string[];
  tips: string[];
  disclaimer: string;
  lastReviewed: string;
}

// Flattened article used for search results and listings
export interface ArticleSearchResult {
  articleId: string;   // "9.8.8.1"
  title: string;
  partNum: string;     // "9"
  partTitle: string;
  sectionId: string;   // "9.8"
  sectionTitle: string;
  subsectionId: string;
  subsectionTitle: string;
  tags: string[];
  textSnippet: string; // First sentence, for previews
  url: string;         // "/part-9/section-9-8#9-8-8-1"
}

export type CharacterStrokeData = {
  strokes: string[];
  medians: number[][][];
};

export type CharacterComponent = {
  character: string;
  type: string[];
  hint?: string | null;
  isGlyphChanged?: boolean;
  isOldPronunciation?: boolean;
  isFromOriginalMeaning?: boolean;
};

export type CharacterImage = {
  url?: string;
  source: string;
  description: string;
  type: string;
  era: string;
  data?: CharacterStrokeData;
  fragments?: number[][];
};

export type CharacterComment = {
  source: string;
  text: string;
};

export type CharacterVariant = {
  char: string;
  parts: string;
  source: string;
};

export type CharacterOldPronunciation = {
  pinyin?: string;
  MC?: string;
  OC?: string;
  gloss?: string;
  source?: string;
};

export type CharacterPinyinFrequency = {
  pinyin: string;
  count: number;
};

export type CharacterTopWord = {
  word: string;
  share: number;
  trad: string;
  gloss: string;
};

export type CharacterStatistics = {
  hskLevel?: number;
  movieWordCount?: number;
  movieWordCountPercent?: number;
  movieWordRank?: number;
  movieWordContexts?: number;
  movieWordContextsPercent?: number;
  bookWordCount?: number;
  bookWordCountPercent?: number;
  bookWordRank?: number;
  movieCharCount?: number;
  movieCharCountPercent?: number;
  movieCharRank?: number;
  movieCharContexts?: number;
  movieCharContextsPercent?: number;
  bookCharCount?: number;
  bookCharCountPercent?: number;
  bookCharRank?: number;
  topWords?: CharacterTopWord[];
  pinyinFrequency?: number;
};

export type DictionaryItem = {
  source?: string;
  pinyin?: string;
  simpTrad?: string;
  definitions?: string[];
};

export type CharacterData = {
  _id: string;
  char?: string;
  codepoint?: string;
  strokeCount?: number | string;
  pinyinFrequencies?: CharacterPinyinFrequency[];
  simpVariants?: string[];
  tradVariants?: string[];
  sources?: string[];
  components?: CharacterComponent[];
  images?: CharacterImage[];
  shuowen?: string;
  comments?: CharacterComment[];
  variants?: CharacterVariant[];
  gloss?: string;
  oldPronunciations?: CharacterOldPronunciation[];
  hint?: string;
  statistics?: CharacterStatistics;
  customSources?: string[];
  fragments?: number[][];
  data?: CharacterStrokeData;
  isVerified?: boolean;
  originalMeaning?: string;
  variantOf?: string;
  simp?: string;
  trad?: string;
  items?: DictionaryItem[];
  pinyinSearchString?: string;
};

export type { CharacterData } from './character-data.js';
export type {
	CharacterStrokeData,
	CharacterComponent,
	CharacterImage,
	CharacterComment,
	CharacterVariant,
	CharacterOldPronunciation,
	CharacterPinyinFrequency,
	CharacterTopWord,
	CharacterStatistics,
	DictionaryItem,
} from './character-data.js';

declare const characters: Record<string, () => Promise<Record<string, unknown>>>;
export default characters;


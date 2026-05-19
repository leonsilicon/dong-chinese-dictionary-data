# dong-chinese-dictionary-data

[![npm version](https://img.shields.io/npm/v/dong-chinese-dictionary-data.svg)](https://www.npmjs.com/package/dong-chinese-dictionary-data)
[![npm downloads](https://img.shields.io/npm/dm/dong-chinese-dictionary-data.svg)](https://www.npmjs.com/package/dong-chinese-dictionary-data)
[![license](https://img.shields.io/npm/l/dong-chinese-dictionary-data.svg)](./license)

Chinese dictionary data from [dong-chinese.com/wiki](https://www.dong-chinese.com/wiki), packaged as individual per-character JSON files with TypeScript types.

## Installation

```sh
npm install dong-chinese-dictionary-data
```

```sh
bun add dong-chinese-dictionary-data
```

```sh
pnpm add dong-chinese-dictionary-data
```

## Usage

### Look up a single character

Loads only the JSON file for the requested character:

```ts
import characters from "dong-chinese-dictionary-data";

const data = await characters["你"]?.();
```

Returns `undefined` if the character is not in the dictionary.

## Types

All entries conform to the `CharacterData` type, re-exported from the package root:

```ts
import type { CharacterData } from "dong-chinese-dictionary-data";
```

See [`character-data.d.ts`](./character-data.d.ts) for the full schema.

## Data source

The dictionary data is sourced from <https://www.dong-chinese.com/wiki> and is the property of its respective authors. This package only converts the upstream JSONL dump to JSON and ships it with TypeScript types — it does not modify the data itself.

## License

[MIT](./license) for the package code. The underlying dictionary data retains its original upstream licensing; see the [data source](#data-source) section.

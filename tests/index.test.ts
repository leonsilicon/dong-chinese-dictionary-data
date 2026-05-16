import { describe, expect, test } from 'bun:test';
import characters from '../index.js';

describe('characters', () => {
	test('is an object with entries', () => {
		expect(typeof characters).toBe('object');
		expect(Object.keys(characters).length).toBeGreaterThan(0);
	});

	test('each value is a function', () => {
		for (const loader of Object.values(characters).slice(0, 5)) {
			expect(typeof loader).toBe('function');
		}
	});

	test('loader returns character data', async () => {
		const data = await characters['你']?.();
		expect(data).toBeDefined();
		expect(typeof data).toBe('object');
	});

	test('returns undefined for unknown character', async () => {
		const data = await characters['$']?.();
		expect(data).toBeUndefined();
	});

	test('different characters return different data', async () => {
		const a = await characters['你']?.();
		const b = await characters['我']?.();
		expect(a).not.toEqual(b);
	});

	test('returned data has expected fields', async () => {
		const data = await characters['你']?.();
		expect(data).toHaveProperty('_id');
		expect(data).toHaveProperty('char');
	});
});

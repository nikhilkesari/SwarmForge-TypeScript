import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import { parseAndValidateRecipes } from './recipe-generator';

describe('Recipe Generator Properties', () => {
  test('round-trip property for valid string arrays', () => {
    // Generate arrays of strings (length 1 to 10)
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 1, maxLength: 10 }),
        (arr) => {
          // Format as JSON array
          const json = JSON.stringify(arr);
          // parseAndValidateRecipes should recover the first 5 elements as strings
          const result = parseAndValidateRecipes(json);
          const expected = arr.slice(0, 5);
          expect(result).toEqual(expected);
        }
      )
    );
  });

  test('invalid JSON throws error', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => {
          try {
            JSON.parse(s);
            return false;
          } catch {
            return true;
          }
        }),
        (invalidJson) => {
          expect(() => parseAndValidateRecipes(invalidJson)).toThrow();
        }
      )
    );
  });
});

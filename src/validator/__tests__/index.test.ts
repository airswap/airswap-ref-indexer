import { isNumeric, isDateInRange } from '../index';

jest.useFakeTimers().setSystemTime(new Date(603001));

describe('Validator', () => {
  describe('isNumeric', () => {
    test('should return false', () => {
      expect(isNumeric('a')).toBe(false);
      expect(isNumeric('1a')).toBe(false);
      expect(isNumeric('a1')).toBe(false);
      expect(isNumeric('')).toBe(false);
      expect(isNumeric(' ')).toBe(false);
      //@ts-ignore
      expect(isNumeric(null)).toBe(false);
      //@ts-ignore
      expect(isNumeric(undefined)).toBe(false);
      //@ts-ignore
      expect(isNumeric({})).toBe(false);
      //@ts-ignore
      expect(isNumeric([])).toBe(false);
    });

    test('should return true', () => {
      expect(isNumeric('0')).toBe(true);
      //@ts-ignore
      expect(isNumeric(0)).toBe(true);
      expect(isNumeric('1')).toBe(true);
      //@ts-ignore
      expect(isNumeric(2)).toBe(true);
    });
  });

  describe('isDateInRange', () => {
    test('should return false', () => {
      expect(isDateInRange('a')).toBe(false);
      expect(isDateInRange('1a')).toBe(false);
      expect(isDateInRange('a1')).toBe(false);
      expect(isDateInRange('')).toBe(false);
      expect(isDateInRange(' ')).toBe(false);
      //@ts-ignore
      expect(isDateInRange(null)).toBe(false);
      //@ts-ignore
      expect(isDateInRange(undefined)).toBe(false);
      //@ts-ignore
      expect(isDateInRange({})).toBe(false);
      //@ts-ignore
      expect(isDateInRange([])).toBe(false);
    });

    test('should return true', () => {
      expect(isDateInRange('604')).toBe(true);
    });
  });
});

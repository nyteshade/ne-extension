import { describe, beforeEach, test, expect } from 'vitest'
import { Extension, Errors } from '../src/index.js'

const { CannotBeExtended: CannotBeExtendedError } = Errors

describe('Extension class tests', () => {
  let originalObject;
  let extension;

  const resetObject = () => {
    originalObject = { originalKey: 'originalValue' };
  };

  beforeEach(() => {
    resetObject();
  });

  test('successfully extends an object', () => {
    extension = new Extension('newKey', 'newValue', originalObject);
    extension.apply();

    expect(originalObject.newKey).toBe('newValue');
  });

  test('throws error when trying to extend a non-configurable property', () => {
    Object.defineProperty(originalObject, 'nonConfigurableKey', {
      value: 'immutableValue',
      configurable: false,
    });

    expect(() => {
      new Extension('nonConfigurableKey', 'newValue', originalObject);
    }).toThrow(CannotBeExtendedError);
  });

  test('reverts to the original state after extension and reversion', () => {
    extension = new Extension('newKey', 'newValue', originalObject);
    extension.apply();
    expect(originalObject.newKey).toBe('newValue');

    extension.revert();
    expect(originalObject.newKey).toBeUndefined();
    expect(originalObject).toEqual({ originalKey: 'originalValue' });
  });
});

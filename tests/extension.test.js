const {
  Extension,
  Errors: {
    CannotBeExtendedError,
    MissingOwnerValue
  }
} = require('../dist/cjs/index.js')

describe('Extension Class Tests', () => {
  let extension;
  let mockOwner;

  const mockKey = 'testKey';
  const mockValue = 'testValue';
  const originalValue = 'originalValue'

  beforeEach(() => {
    mockOwner = { [mockKey]: originalValue }
    extension = new Extension(mockKey, mockValue, mockOwner);
  });

  describe('Constructor', () => {
    it('should correctly initialize an Extension instance', () => {
      expect(extension.key).toBe(mockKey);
      expect(extension.extension[0]).toBe(mockValue);
      expect(extension.owner).toBe(mockOwner);
    });

    it('should throw MissingOwnerValue if key is not in owner', () => {
      expect(() => new Extension('nonExistentKey', mockValue, mockOwner))
        .toThrow(MissingOwnerValue);
    });
  });

  describe('isValid getter', () => {
    it('should return true if extension is valid', () => {
      expect(extension.isValid).toBeTruthy();
    });

    it('should return false if extension is not valid', () => {
      extension.original = null;
      expect(extension.isValid).toBeFalsy();
    });
  });

  describe('activate and deactivate methods', () => {
    it('should activate the extension', () => {
      extension.activate();
      expect(extension.currentValue).toBe(mockValue);
    });

    it('should deactivate the extension and restore original', () => {
      extension.activate();
      extension.deactivate();
      expect(extension.currentValue).toBe('originalValue');
    });
  });

  describe('toggle method', () => {
    it('should toggle the extension state', () => {
      extension.toggle();
      expect(extension.currentValue).toBe(mockValue);

      extension.toggle();
      expect(extension.currentValue).toBe(originalValue);
    });
  });

  describe('hasValue getter', () => {
    it('should return true if the key exists on owner', () => {
      expect(extension.hasValue).toBeTruthy();
    });

    it('should return false if the key does not exist on owner', () => {
      expect(() => new Extension('nonExistentKey', mockValue, {})).toThrow()
    });
  });

  describe('isActive getter', () => {
    it('should return true if the extension is active', () => {
      extension.activate();
      expect(extension.isActive).toBeTruthy();
    });

    it('should return false if the extension is not active', () => {
      expect(extension.isActive).toBeFalsy();
    });
  });
});

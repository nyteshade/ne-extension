const { afterEach } = require('node:test');
const {
  Patch,
} = require('../dist/cjs/index.js')

describe('Patch Class Tests', () => {
  let owner;
  let patch;
  let patch2;
  let patch3;

  let mockOwner;
  let mockPatches;

  beforeEach(() => {
    owner = {};
    mockOwner = { originalProp: 'originalValue' };
    mockPatches = { patchedProp: 'patchedValue', originalProp: 'newPatchedValue' };

    patch = new Patch(mockOwner, mockPatches);
    patch2 = new Patch(owner, { prop1: 'patched1' });
    patch3 = new Patch(owner, { prop2: 'patched2' });
  });

  afterEach(() => {
    patch?.release()
    patch2?.release()
    patch3?.release()
  })

  describe('Constructor', () => {
    it('should correctly initialize a Patch instance', () => {
      expect(patch.owner).toBe(mockOwner);
      expect(patch.patchConflicts).toHaveProperty('originalProp');
      expect(patch.patchEntries).toHaveProperty('patchedProp');
      expect(patch.patchEntries).toHaveProperty('originalProp');
    });
  });

  describe('apply method', () => {
    it('should apply all patches to the owner object', () => {
      patch.apply();
      expect(mockOwner.patchedProp).toBe(mockPatches.patchedProp);
      expect(mockOwner.originalProp).toBe(mockPatches.originalProp);
    });

    it('should set applied flag to true after applying patches', () => {
      patch.apply();
      expect(patch.applied).toBeTruthy();
    });
  });

  describe('revert method', () => {
    it('should revert all patches and restore original properties', () => {
      patch.apply();
      patch.revert();
      expect(mockOwner.originalProp).toBe('originalValue');
      expect(mockOwner).not.toHaveProperty('patchedProp');
    });

    it('should set applied flag to false after reverting patches', () => {
      patch.apply();
      patch.revert();
      expect(patch.applied).toBeFalsy();
    });
  });

  describe('patches getter', () => {
    it('should return all patch entries', () => {
      const patches = patch.patches;
      expect(patches.length).toBe(Object.keys(mockPatches).length);
      expect(patches).toEqual(expect.arrayContaining([
        expect.arrayContaining(['patchedProp', expect.anything()]),
        expect.arrayContaining(['originalProp', expect.anything()])
      ]));
    });
  });

  describe('conflicts getter', () => {
    it('should return all conflict entries', () => {
      const conflicts = patch.conflicts;
      expect(conflicts.length).toBe(1);
      expect(conflicts).toEqual(expect.arrayContaining([
        expect.arrayContaining(['originalProp', expect.anything()])
      ]));
    });
  });

  describe('enableFor method', () => {
    it('should apply all patches for a given owner', () => {
      Patch.enableFor(owner);
      expect(owner.prop1).toBe('patched1');
      expect(owner.prop2).toBe('patched2');
    });
  });

  describe('disableFor method', () => {
    it('should revert all patches for a given owner', () => {
      Patch.enableFor(owner);
      Patch.disableFor(owner);
      expect(owner).not.toHaveProperty('prop1');
      expect(owner).not.toHaveProperty('prop2');
    });
  });
});

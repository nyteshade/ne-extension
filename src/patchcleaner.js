/**
 * The PatchCleaner class provides functionality for conditional cleanup of patches.
 * It allows for the reversion of patches based on specific criteria, ensuring that
 * patches are only reverted when necessary.
 */
export class PatchCleaner {
  /**
   * Constructs a new PatchCleaner instance. The instance itself is a function
   * designed for cleanup. When called, it checks if the associated patch needs
   * cleanup and reverts it if necessary.
   *
   * @param {Patch} patch The patch instance to be potentially cleaned up.
   * @returns {Function} A cleanup function bound to the current context.
   */
  constructor(patch) {
    function extensionCleanup() {
      console.log(this)
      if (PatchCleaner.needsCleanup(patch)) {
        patch.revert()
      }
    }

    Object.assign(extensionCleanup, this);
    Object.setPrototypeOf(extensionCleanup, Object.getPrototypeOf(this));

    return extensionCleanup
  }

  /**
   * Determines whether a given patch needs cleanup. A patch needs cleanup if
   * all of its patch entries still exist on the owner object.
   *
   * @param {Patch} patch The patch to check for cleanup necessity.
   * @returns {boolean} True if the patch needs cleanup, false otherwise.
   */
  static needsCleanup(patch) {
    const needsIt = Object.keys(patch.patchEntries).every(
      key => Reflect.has(patch.owner, key)
    )

    return needsIt
  }
}
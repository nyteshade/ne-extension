import { PatchToggle } from './patchtoggle.js'
import { PatchEntry } from './patchentry.js'

/**
 * The Patch class provides a mechanism to apply patches to properties or
 * methods of an object (the owner). It keeps track of the original state of
 * these properties and allows for the application and reversion of patches.
 */
export class Patch {
  /**
   * Constructs a new Patch instance. Supported options for Patch instances
   * include either a global condition for the Patch to be applied or
   * specific property conditions subjecting only a subset of the patches
   * to conditional application.
   *
   * @example
   * ```
   * const custom = Symbol.for('nodejs.util.inspect.custom')
   * const patch = new Patch(
   *   Object,
   *   {
   *     property: 'value',
   *     [custom](depth, options, inspect) {
   *       // ... custom return string for nodejs
   *     }
   *   },
   *   {
   *     conditions: {
   *       [custom]() { return process?.versions?.node !== null },
   *     },
   *   }
   * )
   * patch.apply() // applies `property` but only applies the `custom`
   *               // property if the JavaScript is running in NodeJS
   * ```
   *
   * @param {object} owner The object to which patches will be applied.
   * @param {object} patches An object containing properties or methods to
   *                         be patched onto the owner.
   * @param {object} [options={}] Additional options for patching behavior.
   */
  constructor(owner, patches, options = {}) {
    Object.assign(this, {
      owner,
      options,
    })

    this.patchConflicts = {}
    this.patchEntries = {}
    this.patchesOwner = patches
    this.patchCount = 0
    this.patchesApplied = 0

    const globalCondition = this?.options.condition

    Reflect.ownKeys(patches).forEach(key => {
      const condition = this?.options?.conditions?.[key] ?? globalCondition
      try {
        this.patchEntries[key] = new PatchEntry(key, this.patchesOwner, condition)
        this.patchCount += 1
      }
      catch (error) {
        console.error(`Failed to process patch for ${key}\n`, error)
      }

      if (Reflect.has(this.owner, key)) {
        try {
          this.patchConflicts[key] = new PatchEntry(key, this.owner)
        }
        catch (error) {
          console.error(`Cannot capture conflicting patch key ${key}\n`, error)
        }
      }
    })

    if (!Patch.patches.has(owner)) {
      Patch.patches.set(owner, [])
    }

    Patch.patches.get(owner).push(this)
  }

  /**
   * Retrieves the patch entries as an array of [key, patchEntry] pairs.
   *
   * @returns {Array} An array of [key, patchEntry] pairs.
   */
  get entries() {
    return Reflect.ownKeys(this.patchEntries).map(key => {
      return [key, this.patchEntries[key]]
    })
  }

  /**
   * Depending on how the PatchEntry is configured, accessing the patch
   * by name can be somewhat irritating, so this provides an object with
   * the actual current patch value at the time patchValues is requested.
   *
   * @example let { patch1, patch2 } = patch.patchValues
   * @returns {object} an object with the patchName mapped to the current
   * computed patchEntry value.
   */
  get patches() {
    return this.entries.reduce((acc, [key, patchEntry]) => {
      acc[key] = patchEntry.computed
      return acc
    }, {})
  }

  /**
   * Retrieves the conflict entries (existing properties on the owner that
   * will be overridden by patches) as an array of [key, patchEntry] pairs.
   *
   * @returns {Array} An array of [key, patchEntry] pairs.
   */
  get conflicts() {
    return Reflect.ownKeys(this.patchConflicts).map(key => {
      return [key, this.patchConflicts[key]]
    })
  }

  /**
   * Checks to see if the tracked number of applied patches is greater than 0
   *
   * @returns {boolean} true if at least one patch has been applied
   */
  get applied() {
    return this.patchesApplied > 0
  }

  /**
   * Provided for semantics, but this method is synonymous with {@link applied}.
   *
   * @returns {boolean} true if at least one patch has been applied
   */
  get isPartiallyPatched() {
    return this.applied
  }

  /**
   * Returns true only when the number of tracked patches matches the number
   * of applied patches.
   *
   * @returns {boolean} true if applied patches is equal to the count of patches
   */
  get isFullyPatched() {
    return this.patchCount == this.patchesApplied
  }

  /**
   * Applies all patches to the owner object. If a property with the same key
   * already exists on the owner, it will be overridden. Optionally a callback
   * can be supplied to the call to revert. If the callback is a valid function,
   * it will be invoked with an object containing the results of the reversion
   * of the patch. The callback receives a single parameter which is an object
   * of counts. It has the signature:
   *
   * ```
   * type counts = {
   *   patches: number;
   *   applied: number;
   *   errors: Array<PatchEntry,Error>;
   *   notApplied: number;
   * }
   * ```
   *
   * While the keys may be obvious to some, `patches` is the count of patches
   * this instance tracks. `applied` is the number of patches that were applied
   * 'errors' is an array of arrays where the first element is the `PatchEntry`
   * and the second element is an `Error` indicating the problem. An error will
   * only be generated if `isAllowed` is `true` and the patch still failed to
   * apply Lastly `notApplied` is the number of patches that were unable to
   * be applied.
   *
   * Additional logic that should track
   * ```
   *   • patches should === applied when done
   *   • errors.length should be 0 when done
   *   • notApplied should be 0 when done
   * ```
   *
   * @param {function} metrics - a callback which receives a status of the
   * `revert` action if supplied. This callback will not be invoked, nor will
   * any of the other logic be captured, if {@link applied} returns false
   */
  apply(metrics) {
    const entries = this.entries
    const counts = {
      patches: entries.length,
      applied: 0,
      errors: [],
      notApplied: entries.length,
    }

    entries.forEach(([,patch]) => {
      if (patch.isAllowed) {
        // Patch
        Object.defineProperty(this.owner, patch.key, patch.descriptor)

        // Verify
        let oDesc = Object.getOwnPropertyDescriptor(this.owner, patch.key)
        if (this.#equalDescriptors(oDesc, patch.descriptor)) {
          counts.applied += 1
          counts.notApplied -= 1
        }
        else {
          counts.errors.push([patch, new Error(
            `Could not apply patch for key ${patch.key}`
          )])
        }
      }
    })

    this.patchesApplied = counts.applied

    if (typeof metrics === 'function') {
      metrics(counts)
    }
  }

  /**
   * Creates an easy to use toggle for working with `Patch` classes
   *
   * @param {boolean} preventRevert true if calling stop() on the toggle does not
   * revert the patch. false, the default, if it should.
   * @returns {PatchToggle} an instance of PatchToggle wrapped around this instance
   * of `Patch`
   * @example const toggle = ObjectExtensions.createToggle().start()
   */
  createToggle(preventRevert = false) {
    return new PatchToggle(this, preventRevert)
  }

  /**
   * Reverts all applied patches on the owner object, restoring any overridden
   * properties to their original state. Optionally a callback can be supplied to
   * the call to revert. If the callback is a valid function, it will be invoked
   * with an object containing the results of the reversion of the patch. The
   * callback receives a single parameter which is an object of counts. It has
   * the signature:
   *
   * ```
   * type counts = {
   *   patches: number;
   *   reverted: number;
   *   restored: number;
   *   conflicts: number;
   *   errors: Array<PatchEntry,Error>;
   *   stillApplied: number;
   * }
   * ```
   *
   * While the keys may be obvious to some, `patches` is the count of patches
   * this instance tracks. `reverted` is the number of patches that were removed'
   * `restored` is the number of originally conflicting keys that were restored.
   * `conflicts` is the total number of conflicts expected. `errors` is an array of
   * arrays where the first element is the `PatchEntry` and the second element
   * is an `Error` indicating the problem. Lastly `stillApplied` is the number of
   * patchesApplied still tracked. If this is greater than zero, you can assume
   * something went wrong.
   *
   * Additional logic that should track
   * ```
   *   • patches should === reverted when done
   *   • restored should === conflicts when done
   *   • errors.length should be 0 when done
   *   • stillApplied should be 0 when done
   * ```
   *
   * @param {function} metrics - a callback which receives a status of the
   * `revert` action if supplied. This callback will not be invoked, nor will
   * any of the other logic be captured, if {@link applied} returns false
   */
  revert(metrics) {
    if (!this.applied) {
      return
    }

    const entries = this.entries
    const conflicts = this.conflicts

    const counts = {
      patches: entries.length,
      reverted: 0,
      restored: 0,
      conflicts: conflicts.length,
      errors: [],
      stillApplied: 0,
    }

    entries.forEach(([,patch]) => {
      const successful = delete this.owner[patch.key]
      if (successful) {
        this.patchesApplied -= 1
        counts.reverted += 1
      }
      else {
        counts.errors.push([patch, new Error(
          `Failed to revert patch ${patch.key}`
        )])
      }
    })

    conflicts.forEach(([,patch]) => {
      Object.defineProperty(this.owner, patch.key, patch.descriptor)
      const appliedDescriptor = Object.getOwnPropertyDescriptor(this.owner, patch.key)
      if (this.#equalDescriptors(patch.descriptor, appliedDescriptor)) {
        counts.restored += 1
      }
      else {
        counts.errors.push([patch, new Error(
          `Failed to restore original ${patch.key}`
        )])
      }
    })

    counts.stillApplied = this.patchesApplied
    if (typeof metrics === 'function') {
      metrics(counts)
    }
  }

  /**
   * Removes this Patch instance from being tracked amongst all the tracked Patch
   * instances. The JavaScript virtual machine will clean this instance up once
   * nothing else is holding a reference to it.
   */
  release() {
    const patches = Patch.patches.get(this.owner)
    patches.splice(patches.find(e => e === this), 1)
  }

  /**
   * The object to which the patches are applied.
   */
  owner = null

  /**
   * Additional options for patching behavior.
   */
  options = null

  #equalDescriptors(left, right) {
    if (!left || !right) {
      return false
    }

    let circuit = true

    circuit = circuit && left.configurable === right.configurable
    circuit = circuit && left.enumerable === right.enumerable
    circuit = circuit && left.value === right.value
    circuit = circuit && left.writable === right.writable
    circuit = circuit && left.get === right.get
    circuit = circuit && left.set === right.set

    return circuit
  }

  /**
   * A global mapping of all patches in play
   */
  static patches = new Map()

  /**
   * Applies all patches associated with a given owner object. This method
   * is used to enable all patches for a specific owner if they have been
   * previously registered.
   *
   * @param {object} owner The object whose patches are to be applied.
   */
  static enableFor(owner) {
    if (Patch.patches.has(owner)) {
      for (const patch of Patch.patches.get(owner)) {
        patch.apply()
      }
    }
  }

  /**
   * Reverts all patches associated with a given owner object. This method
   * is used to disable all patches for a specific owner if they have been
   * previously applied.
   *
   * @param {object} owner The object whose patches are to be reverted.
   */
  static disableFor(owner) {
    if (Patch.patches.has(owner)) {
      for (const patch of Patch.patches.get(owner)) {
        patch.revert()
      }
    }
  }
}
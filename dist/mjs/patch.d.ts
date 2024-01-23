/**
 * The Patch class provides a mechanism to apply patches to properties or
 * methods of an object (the owner). It keeps track of the original state of
 * these properties and allows for the application and reversion of patches.
 */
export class Patch {
    /**
     * A global mapping of all patches in play
     */
    static patches: Map<any, any>;
    /**
     * Applies all patches associated with a given owner object. This method
     * is used to enable all patches for a specific owner if they have been
     * previously registered.
     *
     * @param {object} owner The object whose patches are to be applied.
     */
    static enableFor(owner: object): void;
    /**
     * Reverts all patches associated with a given owner object. This method
     * is used to disable all patches for a specific owner if they have been
     * previously applied.
     *
     * @param {object} owner The object whose patches are to be reverted.
     */
    static disableFor(owner: object): void;
    /**
     * A getter for the custom inspect symbol used by Node.js.
     *
     * @returns {symbol} The custom inspect symbol.
     */
    static get CustomInspect(): symbol;
    /**
     * Strips leading and trailing control characters, brackets, braces, and
     * quotes from a string. This is typically used to clean strings that may
     * have special characters or escape sequences that are not desired in the
     * output.
     *
     * @param {string} fromString The string to be stripped of extras.
     * @returns {string} The cleaned string with extras stripped.
     */
    static stripExtras(fromString: string): string;
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
    constructor(owner: object, patches: object, options?: object | undefined);
    /**
     * A record of conflicts between existing and patched properties or methods.
     * This object maps property names to their respective PatchEntry instances,
     * which contain information about the original and patched values.
     *
     * @type {object}
     */
    patchConflicts: object;
    /**
     * An object to store patch entries. Each key corresponds to a property or
     * method name on the owner object, and the value is the associated
     * PatchEntry instance which contains the patched and original values.
     *
     * @type {object}
     */
    patchEntries: object;
    /**
     * The object containing the patches to be applied to the owner. It is
     * initially undefined and will be populated with the patches passed to the
     * constructor.
     *
     * @type {object}
     */
    patchesOwner: object;
    /**
     * The count of patches that have been applied. This is incremented
     * each time a patch is applied and decremented when a patch is
     * reverted.
     *
     * @type {number}
     */
    patchCount: number;
    /**
     * The number of patches that have been successfully applied. This count
     * is incremented after each successful patch application and decremented
     * when a patch is reverted.
     *
     * @type {number}
     */
    patchesApplied: number;
    /**
     * Retrieves the patch entries as an array of [key, patchEntry] pairs.
     *
     * @returns {Array} An array of [key, patchEntry] pairs.
     */
    get entries(): any[];
    /**
     * Depending on how the PatchEntry is configured, accessing the patch
     * by name can be somewhat irritating, so this provides an object with
     * the actual current patch value at the time patchValues is requested.
     *
     * @example let { patch1, patch2 } = patch.patchValues
     * @returns {object} an object with the patchName mapped to the current
     * computed patchEntry value.
     */
    get patches(): object;
    /**
     * Retrieves an array of patch keys.
     *
     * This getter returns an array containing only the keys of the patch entries,
     * which can be useful for iterating over the patches or checking for the
     * existence of specific patches by key.
     *
     * @returns {string[]} An array of patch keys.
     */
    get patchKeys(): string[];
    /**
     * Retrieves the conflict entries (existing properties on the owner that
     * will be overridden by patches) as an array of [key, patchEntry] pairs.
     *
     * @returns {Array} An array of [key, patchEntry] pairs.
     */
    get conflicts(): any[];
    /**
     * Checks to see if the tracked number of applied patches is greater than 0
     *
     * @returns {boolean} true if at least one patch has been applied
     */
    get applied(): boolean;
    /**
     * Provided for semantics, but this method is synonymous with {@link applied}.
     *
     * @returns {boolean} true if at least one patch has been applied
     */
    get isPartiallyPatched(): boolean;
    /**
     * Returns true only when the number of tracked patches matches the number
     * of applied patches.
     *
     * @returns {boolean} true if applied patches is equal to the count of patches
     */
    get isFullyPatched(): boolean;
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
    apply(metrics: Function): void;
    /**
     * Creates an easy to use toggle for working with `Patch` classes
     *
     * @param {boolean} preventRevert true if calling stop() on the toggle does not
     * revert the patch. false, the default, if it should.
     * @returns {PatchToggle} an instance of PatchToggle wrapped around this instance
     * of `Patch`
     * @example const toggle = ObjectExtensions.createToggle().start()
     */
    createToggle(preventRevert?: boolean): PatchToggle;
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
    revert(metrics: Function): void;
    /**
     * Removes this Patch instance from being tracked amongst all the tracked Patch
     * instances. The JavaScript virtual machine will clean this instance up once
     * nothing else is holding a reference to it.
     */
    release(): void;
    /**
     * The object to which the patches are applied.
     */
    owner: null;
    /**
     * Additional options for patching behavior.
     */
    options: null;
    #private;
}
import { PatchToggle } from './patchtoggle.js';

/**
 * A PatchEntry class is a wrapper that maps the descriptor, key and owning
 * object in a single instance. When a Patch or Extension are created, one
 * of these for each patch is created so that the patch can be applied and
 * reverted.
 */
export class PatchEntry {
    /**
     * Constructs a new PatchEntry instance.
     *
     * @param {string|symbol} property The property key to be patched.
     * @param {object} [owningObject=globalThis] The object from which the
     * property descriptor is taken.
     * @param {function} condition if a valid function is passed here, the
     * expectation is that it takes no parameters and returns a `boolean`. If
     * `true`, then this entry can be applied. If `false`, it indicates to the
     * consuming `Patch` that it cannot be applied.
     * @throws {TypeError} if `owningObject` is not a valid object (i.e. one that
     * can contain property descriptors and assigned values), then a `TypeError`
     * is thrown. A `TypeError` is also thrown if `property` is null, or neither
     * an object nor symbol.
     */
    constructor(property: string | symbol, owningObject?: object | undefined, condition?: Function);
    /**
     * Computes and returns the current value of the patch, based on its type
     * (data or accessor).
     *
     * @returns {any} The current value of the patch.
     */
    get computed(): any;
    /**
     * Checks if the patch is a data property (has a value).
     *
     * @returns {boolean} True if the patch is a data property, false otherwise.
     */
    get isData(): boolean;
    /**
     * Checks if the patch is an accessor property (has a getter).
     *
     * @returns {boolean} True if the patch is an accessor property, false otherwise.
     */
    get isAccessor(): boolean;
    /**
     * Checks if the patch is read-only (not configurable or not writable).
     *
     * @returns {boolean} True if the patch is read-only, false otherwise.
     */
    get isReadOnly(): boolean;
    /**
     * If a `condition` is associated with this specific patch entry, then it will
     * run and its result will be returned. Otherwise `true` is returned allowing
     * all non-conditional `PatchEntry` instances to be applied every time.
     *
     * @returns {boolean} `true` if the condition is true or there is no condition
     * applied to this instance. `false` if the condition fails.
     */
    get isAllowed(): boolean;
    /**
     * Custom getter for the toStringTag symbol. Provides the class name of
     * the PatchEntry instance.
     *
     * @returns {string} The class name of the PatchEntry instance.
     */
    get [Symbol.toStringTag](): string;
}
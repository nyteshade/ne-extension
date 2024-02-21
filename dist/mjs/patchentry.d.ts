/**
 * A PatchEntry class is a wrapper that maps the descriptor, key and owning
 * object in a single instance. When a Patch or Extension are created, one
 * of these for each patch is created so that the patch can be applied and
 * reverted.
 */
export class PatchEntry {
    /**
     * Constructs a new PatchEntry instance, encapsulating the logic for
     * patching a property onto an object with optional conditions and
     * descriptor overrides.
     *
     * This constructor validates the provided property and owningObject,
     * constructs a property descriptor by merging the existing descriptor
     * (if any) with any provided overrides, and initializes the PatchEntry
     * instance with these details.
     *
     * @param {string|symbol} property The property key to patch. Must be a
     * non-null string or symbol.
     * @param {object} [owningObject=globalThis] The object to which the
     * property will be patched. Defaults to the global object.
     * @param {Function} [condition=undefined] An optional function that
     * determines if the patch should be applied. If undefined, the patch
     * is always applied.
     * @param {object} [descriptorOverrides={}] Optional overrides for the
     * property descriptor of the patch.
     * @throws {TypeError} If `property` is not a string or symbol, or if
     * `owningObject` is not an object.
     */
    constructor(property: string | symbol, owningObject?: object | undefined, condition?: Function | undefined, descriptorOverrides?: object | undefined);
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
     * Applies the patch entry to a given object. This method takes the
     * descriptor from the current patch entry and defines it on the target
     * object. If `bindAccessors` is true and the descriptor contains accessor
     * methods (getters/setters), they will be bound to the original owner of
     * the patch before being applied to ensure the correct `this` context.
     *
     * @param {object} anotherObject - The object to which the patch will be
     * applied.
     * @param {boolean} [bindAccessors=false] - Whether to bind accessor methods
     * to the patch's owner.
     */
    applyTo(anotherObject: object, bindAccessors?: boolean | undefined): void;
    /**
     * Custom getter for the toStringTag symbol. Provides the class name of
     * the PatchEntry instance.
     *
     * @returns {string} The class name of the PatchEntry instance.
     */
    get [Symbol.toStringTag](): string;
}

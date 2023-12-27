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
     * Internal class representing a single patch entry.
     */
    static "__#1@#PatchEntry": {
        new (property: string, owningObject?: object | undefined): {
            /**
             * Computes and returns the current value of the patch, based on its type
             * (data or accessor).
             *
             * @returns {any} The current value of the patch.
             */
            readonly computed: any;
            /**
             * Checks if the patch is a data property (has a value).
             *
             * @returns {boolean} True if the patch is a data property, false otherwise.
             */
            readonly isData: boolean;
            /**
             * Checks if the patch is an accessor property (has a getter).
             *
             * @returns {boolean} True if the patch is an accessor property, false otherwise.
             */
            readonly isAccessor: boolean;
            /**
             * Checks if the patch is read-only (not configurable or not writable).
             *
             * @returns {boolean} True if the patch is read-only, false otherwise.
             */
            readonly isReadOnly: boolean;
            /**
             * Custom getter for the toStringTag symbol. Provides the class name of
             * the PatchEntry instance.
             *
             * @returns {string} The class name of the PatchEntry instance.
             */
            readonly [Symbol.toStringTag]: string;
        };
    };
    /**
     * Constructs a new Patch instance.
     *
     * @param {object} owner The object to which patches will be applied.
     * @param {object} patches An object containing properties or methods to
     *                         be patched onto the owner.
     * @param {object} [options={}] Additional options for patching behavior.
     */
    constructor(owner: object, patches: object, options?: object | undefined);
    patchConflicts: {};
    patchEntries: {};
    patchesOwner: object;
    /**
     * Retrieves the patch entries as an array of [key, patchEntry] pairs.
     *
     * @returns {Array} An array of [key, patchEntry] pairs.
     */
    get patches(): any[];
    /**
     * Retrieves the conflict entries (existing properties on the owner that
     * will be overridden by patches) as an array of [key, patchEntry] pairs.
     *
     * @returns {Array} An array of [key, patchEntry] pairs.
     */
    get conflicts(): any[];
    /**
     * Applies all patches to the owner object. If a property with the same key
     * already exists on the owner, it will be overridden.
     */
    apply(): void;
    applied: boolean | undefined;
    /**
     * Reverts all applied patches on the owner object, restoring any overridden
     * properties to their original state.
     */
    revert(): void;
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
}

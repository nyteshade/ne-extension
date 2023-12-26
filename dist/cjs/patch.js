"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _Patch_PatchEntry;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Patch = void 0;
/**
 * The Patch class provides a mechanism to apply patches to properties or
 * methods of an object (the owner). It keeps track of the original state of
 * these properties and allows for the application and reversion of patches.
 */
class Patch {
    /**
     * Constructs a new Patch instance.
     *
     * @param {object} owner The object to which patches will be applied.
     * @param {object} patches An object containing properties or methods to
     *                         be patched onto the owner.
     * @param {object} [options={}] Additional options for patching behavior.
     */
    constructor(owner, patches, options = {}) {
        /**
         * The object to which the patches are applied.
         */
        this.owner = null;
        /**
         * Additional options for patching behavior.
         */
        this.options = null;
        Object.assign(this, {
            owner,
            options,
            applied: false,
        });
        this.patchConflicts = {};
        this.patchEntries = {};
        this.patchesOwner = patches;
        Reflect.ownKeys(patches).forEach(key => {
            this.patchEntries[key] = new (__classPrivateFieldGet(_a, _a, "f", _Patch_PatchEntry))(key, this.patchesOwner);
            if (Reflect.has(this.owner, key)) {
                this.patchConflicts[key] = new (__classPrivateFieldGet(_a, _a, "f", _Patch_PatchEntry))(key, this.owner);
            }
        });
        if (!_a.patches.has(owner)) {
            _a.patches.set(owner, []);
        }
        _a.patches.get(owner).push(this);
    }
    /**
     * Retrieves the patch entries as an array of [key, patchEntry] pairs.
     *
     * @returns {Array} An array of [key, patchEntry] pairs.
     */
    get patches() {
        return Reflect.ownKeys(this.patchEntries).map(key => {
            return [key, this.patchEntries[key]];
        });
    }
    /**
     * Retrieves the conflict entries (existing properties on the owner that
     * will be overridden by patches) as an array of [key, patchEntry] pairs.
     *
     * @returns {Array} An array of [key, patchEntry] pairs.
     */
    get conflicts() {
        return Reflect.ownKeys(this.patchConflicts).map(key => {
            return [key, this.patchConflicts[key]];
        });
    }
    /**
     * Applies all patches to the owner object. If a property with the same key
     * already exists on the owner, it will be overridden.
     */
    apply() {
        if (!this.applied) {
            this.patches.forEach(([, patch]) => {
                Object.defineProperty(this.owner, patch.key, patch.descriptor);
            });
            this.applied = true;
        }
    }
    /**
     * Reverts all applied patches on the owner object, restoring any overridden
     * properties to their original state.
     */
    revert() {
        if (this.applied) {
            this.patches.forEach(([, patch]) => {
                delete this.owner[patch.key];
            });
            this.conflicts.forEach(([, patch]) => {
                Object.defineProperty(this.owner, patch.key, patch.descriptor);
            });
            this.applied = false;
        }
    }
    /**
     * Removes this Patch instance from being tracked amongst all the tracked Patch
     * instances. The JavaScript virtual machine will clean this instance up once
     * nothing else is holding a reference to it.
     */
    release() {
        const patches = _a.patches.get(this.owner);
        patches.splice(patches.find(e => e === this), 1);
    }
    /**
     * Applies all patches associated with a given owner object. This method
     * is used to enable all patches for a specific owner if they have been
     * previously registered.
     *
     * @param {object} owner The object whose patches are to be applied.
     */
    static enableFor(owner) {
        if (_a.patches.has(owner)) {
            for (const patch of _a.patches.get(owner)) {
                patch.apply();
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
        if (_a.patches.has(owner)) {
            for (const patch of _a.patches.get(owner)) {
                patch.revert();
            }
        }
    }
}
exports.Patch = Patch;
_a = Patch;
/**
 * A global mapping of all patches in play
 */
Patch.patches = new Map();
/**
 * Internal class representing a single patch entry.
 */
_Patch_PatchEntry = { value: class {
        /**
         * Constructs a new PatchEntry instance.
         *
         * @param {string} property The property key to be patched.
         * @param {object} [owningObject=globalThis] The object from which the
         * property descriptor is taken.
         */
        constructor(property, owningObject = globalThis) {
            Object.assign(this, {
                key: property,
                descriptor: Object.getOwnPropertyDescriptor(owningObject, property),
                owner: owningObject
            });
        }
        /**
         * Computes and returns the current value of the patch, based on its type
         * (data or accessor).
         *
         * @returns {any} The current value of the patch.
         */
        get computed() {
            if (this.isAccessor) {
                return this.descriptor.get.bind(this.owner).call();
            }
            else {
                return this.descriptor.value;
            }
        }
        /**
         * Checks if the patch is a data property (has a value).
         *
         * @returns {boolean} True if the patch is a data property, false otherwise.
         */
        get isData() {
            return Reflect.has(this.descriptor, 'value');
        }
        /**
         * Checks if the patch is an accessor property (has a getter).
         *
         * @returns {boolean} True if the patch is an accessor property, false otherwise.
         */
        get isAccessor() {
            return Reflect.has(this.descriptor, 'get');
        }
        /**
         * Checks if the patch is read-only (not configurable or not writable).
         *
         * @returns {boolean} True if the patch is read-only, false otherwise.
         */
        get isReadOnly() {
            return ((Reflect.has(this.descriptor, 'configurable') && !this.descriptor.configurable) ||
                (Reflect.has(this.descriptor, 'writable') && !this.descriptor.writable));
        }
        /**
         * Custom getter for the toStringTag symbol. Provides the class name of
         * the PatchEntry instance.
         *
         * @returns {string} The class name of the PatchEntry instance.
         */
        get [Symbol.toStringTag]() {
            return this.constructor.name;
        }
        /**
         * Custom inspect function for Node.js that provides a formatted representation
         * of the PatchEntry instance, primarily for debugging purposes.
         *
         * @param {number} depth The depth to which the object should be formatted.
         * @param {object} options Formatting options.
         * @param {function} inspect The inspection function to format the object.
         * @returns {string} A formatted string representing the PatchEntry instance.
         */
        [Symbol.for('nodejs.util.inspect.custom')](depth, options, inspect) {
            return `PatchEntry<${this.key}, ${this.isData ? 'Data' : 'Accessor'}${this.isReadOnly ? ' [ReadOnly]' : ''}>`;
        }
    } };

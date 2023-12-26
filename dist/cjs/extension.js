"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _Extension_fetchPropAndMeta, _Extension_isWritable;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Extension = void 0;
const CannotBeExtendedError_js_1 = require("./errors/CannotBeExtendedError.js");
const MissingOwnerValue_js_1 = require("./errors/MissingOwnerValue.js");
const [VALUE, DESCRIPTOR] = [0, 1];
/**
 * The Extension class provides a mechanism to dynamically extend or override
 * properties of a given object (the owner). It handles the activation,
 * deactivation, and toggling of these extensions, while ensuring the integrity
 * and original state of the owner can be maintained.
 */
class Extension {
    /**
     * Constructs a new Extension instance.
     *
     * @param {string} key The property key on the owner object that will be extended.
     * @param {any} extension The new value or behavior to assign to the key.
     * @param {object} [owner=globalThis] The object to which the extension will be applied.
     * @param {object} [options={}] Additional options for managing the extension.
     */
    constructor(key, extension, owner = globalThis, options = {}) {
        // Storage for the original element under `key` on object `owner`
        this.original = null;
        // The current state of the extension object to apply to `owner`
        this.extension = null;
        // The key where the original version of the object to be extended once
        // resided. When created, the instance of Extension will attempt to
        // capture the original object and store a reference here.
        this.key = null;
        // By default the `globalThis` refers to `window` in a browser or `global`
        // in nodejs compatible environments.
        this.owner = null;
        // The flag indicating the state of the
        this.activated = false;
        Object.assign(this, { key, owner, options });
        this.extension = [
            extension,
            { enumerable: true, configurable: true, value: extension }
        ];
        if (Reflect.has(options ?? {}, 'isAccessor') && extension instanceof Function) {
            this.extension[DESCRIPTOR] = {
                enumerable: true,
                configurable: true,
                get: extension,
                set: options?.setter,
            };
        }
        if (Reflect.has(owner, key)) {
            this.original = __classPrivateFieldGet(_a, _a, "m", _Extension_fetchPropAndMeta).call(_a, owner, key);
            if (this.original?.[DESCRIPTOR]) {
                const descriptor = this.original?.[DESCRIPTOR];
                if (!__classPrivateFieldGet(_a, _a, "m", _Extension_isWritable).call(_a, descriptor)) {
                    throw new CannotBeExtendedError_js_1.CannotBeExtendedError(owner, key);
                }
            }
        }
        else {
            throw new MissingOwnerValue_js_1.MissingOwnerValue(owner, key);
        }
    }
    /**
     * Checks whether the extension is valid. An extension is considered valid
     * if the original property is present and the extension value is defined.
     *
     * @returns {boolean} True if the extension is valid, otherwise false.
     */
    get isValid() {
        return this.original !== null && this.extension != null && this.hasValue;
    }
    /**
     * Checks if the original property key exists on the owner object.
     *
     * @returns {boolean} True if the owner object has the property key, otherwise false.
     */
    get hasValue() {
        return Reflect.has(this.owner, this.key);
    }
    /**
     * Determines if the extension is currently active on the owner object.
     *
     * @returns {boolean} True if the extension is active, otherwise false.
     */
    get isActive() {
        return this.owner[this.key] === this.extension[VALUE];
    }
    /**
     * Activates the extension by defining the property on the owner object with the
     * extended behavior or value.
     */
    activate() {
        console.log(`[activate] ${!this.isActive ? 'activating' : 'already active'}`);
        if (!this.isActive) {
            Object.defineProperty(this.owner, this.key, this.extension[DESCRIPTOR]);
        }
    }
    /**
     * Deactivates the extension by restoring the original property definition
     * on the owner object.
     */
    deactivate() {
        console.log(`[deactivate] ${this.isActive ? 'deactivating' : 'already deactivated'}`);
        if (this.isActive) {
            Object.defineProperty(this.owner, this.key, this.original[DESCRIPTOR]);
        }
    }
    /**
     * Toggles the state of the extension. If active, it will be deactivated,
     * and vice versa.
     */
    toggle() {
        if (this.isActive) {
            this.deactivate();
        }
        else {
            this.activate();
        }
    }
    /**
     * Returns the currently tracked value.
     *
     * @returns {any} the value currently stored on the `owner` object using the
     * `key` property key.
     */
    get currentValue() {
        return this.owner[this.key];
    }
    /**
     * Custom inspect function for Node.js that provides a formatted representation
     * of the Extension instance, primarily for debugging purposes.
     *
     * @param {number} depth The depth to which the object should be formatted.
     * @param {object} options Formatting options.
     * @param {function} inspect The inspection function to format the object.
     * @returns {string} A formatted string representing the Extension instance.
     */
    [Symbol.for('nodejs.util.inspect.custom')](depth, options, inspect) {
        return `Extension:${this.constructor.name} ${this.key}`;
    }
    /**
     * Custom getter for the toStringTag symbol. Provides the class name when the
     * object is converted to a string, typically used for debugging and logging.
     *
     * @returns {string} The class name of the Extension instance.
     */
    get [Symbol.toStringTag]() {
        return this.constructor.name;
    }
}
exports.Extension = Extension;
_a = Extension, _Extension_fetchPropAndMeta = function _Extension_fetchPropAndMeta(owner, key) {
    return [
        owner[key],
        Object.getOwnPropertyDescriptor(owner, key)
    ];
}, _Extension_isWritable = function _Extension_isWritable(descriptor) {
    const configurable = Reflect.has(descriptor, 'configurable') && descriptor.configurable;
    const writable = Reflect.has(descriptor, 'writable') && descriptor.writable;
    const isData = Reflect.has(descriptor, 'value');
    return (configurable || (isData && writable));
};
Extension.extensions = [];

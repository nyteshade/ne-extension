"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Extension = void 0;
const CannotBeExtendedError_js_1 = require("./errors/CannotBeExtendedError.js");
const MissingOwnerValue_js_1 = require("./errors/MissingOwnerValue.js");
const patch_js_1 = require("./patch.js");
/** Shared array of primitive types for use with `isPrimitive` */
const primitives = ['number', 'boolean', 'bigint', 'string', 'symbol'];
/**
 * The Extension class, inheriting from the Patch class, is specifically designed
 * for extending properties or methods of a given object. It facilitates the
 * extension process by determining the target key and value for the extension and
 * ensuring the target property is writable and configurable. If these conditions
 * are not met, the class throws a CannotBeExtendedError. This class is useful
 * in scenarios like testing, dynamic behavior adjustments, or managing complex
 * object configurations.
 */
class Extension extends patch_js_1.Patch {
    /**
     * Constructs a new Extension instance. This constructor initializes the extension
     * by determining the target key and value for the extension and ensuring that
     * the property to be extended is configurable and writable. It throws an error
     * if these conditions are not satisfied. The constructor leverages the Patch
     * class's functionalities to manage the extension effectively.
     *
     * @param {Function|string} keyClassOrFn - The key, class, or function to be
     * used for the extension. If a function or class is provided, its name is used
     * as the key.
     * @param {*} value - The value or method to be used for the extension.
     * @param {object} [owner=globalThis] - The object to which the extension will
     * be applied.
     * @param {object} [options={}] - Additional options for the extension behavior.
     * @throws {CannotBeExtendedError} If the target property is not writable or
     * configurable.
     * @throws {MissingOwnerValue} If the `keyClassOrFn` value is null or there
     * is an error determining the key and extension values, MissingOwnerValue is
     * thrown.
     */
    constructor(keyClassOrFn, value, owner = globalThis, options = {}) {
        const metadata = Extension.determineInput(keyClassOrFn);
        let { key, extension, valid } = metadata;
        extension = value || extension;
        if (!valid) {
            throw new MissingOwnerValue_js_1.MissingOwnerValue(owner, key);
        }
        const descriptor = Object.getOwnPropertyDescriptor(owner, key);
        if (descriptor) {
            if ((Reflect.has(descriptor, 'writable') && !descriptor.writable) ||
                (Reflect.has(descriptor, 'configurable') && !descriptor.configurable)) {
                throw new CannotBeExtendedError_js_1.CannotBeExtendedError(owner, key);
            }
        }
        super(owner, { [key]: extension }, options);
        this.key = key;
        this.class = metadata.class;
        this.function = metadata.function;
    }
    /**
     * Returns true if this `Extension` represents a `function`
     *
     * @returns {boolean} `true` if this `Extension` introduces a `function`, or
     * `false` if it does not
     */
    get isFunction() { return !!(this.function); }
    /**
     * Returns true if this `Extension` represents a `class`
     *
     * @returns {boolean} `true` if this `Extension` introduces a `class`, or
     * `false` if it does not
     */
    get isClass() { return !!(this.class); }
    /**
     * Returns true if this `Extension` represents a `primitive`
     *
     * @returns {boolean} `true` if this `Extension` introduces a
     * primitive value or `false` if it does not.
     */
    get isPrimitive() {
        return ~primitives.indexOf(typeof this.value);
    }
    /**
     * Returns true if this `Extension` represents a value that is not
     * coerced into an `Object` wrapper when wrapped with `Object(value)`
     *
     * @returns {boolean} `true` if this `Extension` introduces a value
     * that is alrady an `object`, `false` otherwise.
     */
    get isObject() {
        return Object(this.value) === this.value;
    }
    /**
     * Determines the input type for the extension. This method processes the input
     * and identifies the key for the extension and the associated value or method.
     * It supports inputs as either a string key or a function/class, providing
     * flexibility in defining extensions.
     *
     * @param {Function|string} keyClassOrFn - The key, class, or function provided
     * as input. If a function or class is provided, its name is used as the key.
     * containing the determined key, the extension value/method, and a validity flag
     * indicating whether the input is usable.
     * @returns {{key: string|null, extension: *|null, valid: boolean}} An object
     */
    static determineInput(keyClassOrFn) {
        let input = { key: null, extension: null, valid: false };
        if (keyClassOrFn instanceof Function) {
            input = {
                key: keyClassOrFn.name,
                extension: keyClassOrFn,
                valid: true
            };
            if (/^class .*/.exec(keyClassOrFn.toString())) {
                input.class = keyClassOrFn;
            }
            if (/^(async )?function .*/.exec(keyClassOrFn.toString())) {
                input.function = keyClassOrFn;
            }
        }
        else if (typeof keyClassOrFn === 'string' || keyClassOrFn instanceof String) {
            input = { key: keyClassOrFn, extension: null, valid: true };
        }
        return input;
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
        const exprs = {
            get braces() { return /^(\x1B\[\d+m)?[\[\{]|[\]\}](\x1B\[\d+m)?$/g; },
            get quotes() { return /^(\x1B\[\d+m)?['"]|["'](\x1B\[\d+m)?$/g; },
        };
        const key = inspect(this.key, options).replaceAll(exprs.quotes, '$1$2');
        const val = (inspect(this.patches[this.key], options)
            .replaceAll(exprs.braces, '$1$2'));
        return `Extension[${key}:${val}]`;
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
//# sourceMappingURL=extension.js.map
import { CannotBeExtendedError } from "./errors/CannotBeExtendedError.js";
import { MissingOwnerValue } from './errors/MissingOwnerValue.js';
import { Patch } from './patch.js';
/**
 * The Extension class, inheriting from the Patch class, is specifically designed
 * for extending properties or methods of a given object. It facilitates the
 * extension process by determining the target key and value for the extension and
 * ensuring the target property is writable and configurable. If these conditions
 * are not met, the class throws a CannotBeExtendedError. This class is useful
 * in scenarios like testing, dynamic behavior adjustments, or managing complex
 * object configurations.
 */
export class Extension extends Patch {
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
        let { key, extension, valid } = Extension.determineInput(keyClassOrFn);
        extension = value || extension;
        if (!valid) {
            throw new MissingOwnerValue(owner, key);
        }
        const descriptor = Object.getOwnPropertyDescriptor(owner, key);
        if (descriptor) {
            if ((Reflect.has(descriptor, 'writable') && !descriptor.writable) ||
                (Reflect.has(descriptor, 'configurable') && !descriptor.configurable)) {
                throw new CannotBeExtendedError(owner, key);
            }
        }
        super(owner, { [key]: extension }, options);
        this.key = key;
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
            input = { key: keyClassOrFn.name, extension: keyClassOrFn, valid: true };
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
        return `Extension<${this.key}>`;
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

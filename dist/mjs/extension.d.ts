/**
 * The Extension class provides a mechanism to dynamically extend or override
 * properties of a given object (the owner). It handles the activation,
 * deactivation, and toggling of these extensions, while ensuring the integrity
 * and original state of the owner can be maintained.
 */
export class Extension {
    /**
     * Fetches the property value and its descriptor from the owner object.
     *
     * @param {object} owner The owner object from which to fetch the property.
     * @param {string} key The key of the property to fetch.
     * @returns {Array} An array containing the property value and its descriptor.
     */
    static "__#1@#fetchPropAndMeta"(owner: object, key: string): any[];
    static "__#1@#isWritable"(descriptor: any): any;
    static extensions: any[];
    /**
     * Constructs a new Extension instance.
     *
     * @param {string} key The property key on the owner object that will be extended.
     * @param {any} extension The new value or behavior to assign to the key.
     * @param {object} [owner=globalThis] The object to which the extension will be applied.
     * @param {object} [options={}] Additional options for managing the extension.
     */
    constructor(key: string, extension: any, owner?: object | undefined, options?: object | undefined);
    extension: null;
    original: null;
    /**
     * Checks whether the extension is valid. An extension is considered valid
     * if the original property is present and the extension value is defined.
     *
     * @returns {boolean} True if the extension is valid, otherwise false.
     */
    get isValid(): boolean;
    /**
     * Checks if the original property key exists on the owner object.
     *
     * @returns {boolean} True if the owner object has the property key, otherwise false.
     */
    get hasValue(): boolean;
    /**
     * Determines if the extension is currently active on the owner object.
     *
     * @returns {boolean} True if the extension is active, otherwise false.
     */
    get isActive(): boolean;
    /**
     * Activates the extension by defining the property on the owner object with the
     * extended behavior or value.
     */
    activate(): void;
    /**
     * Deactivates the extension by restoring the original property definition
     * on the owner object.
     */
    deactivate(): void;
    /**
     * Toggles the state of the extension. If active, it will be deactivated,
     * and vice versa.
     */
    toggle(): void;
    /**
     * Returns the currently tracked value.
     *
     * @returns {any} the value currently stored on the `owner` object using the
     * `key` property key.
     */
    get currentValue(): any;
    key: null;
    owner: null;
    activated: boolean;
    /**
     * Custom getter for the toStringTag symbol. Provides the class name when the
     * object is converted to a string, typically used for debugging and logging.
     *
     * @returns {string} The class name of the Extension instance.
     */
    get [Symbol.toStringTag](): string;
}

import { CannotBeExtendedError } from "./errors/CannotBeExtendedError.js"
import { MissingOwnerValue } from './errors/MissingOwnerValue.js'

const [VALUE, DESCRIPTOR] = [0, 1]

/**
 * The Extension class provides a mechanism to dynamically extend or override
 * properties of a given object (the owner). It handles the activation,
 * deactivation, and toggling of these extensions, while ensuring the integrity
 * and original state of the owner can be maintained.
 */
export class Extension {
  /**
   * Constructs a new Extension instance.
   *
   * @param {string} key The property key on the owner object that will be extended.
   * @param {any} extension The new value or behavior to assign to the key.
   * @param {object} [owner=globalThis] The object to which the extension will be applied.
   * @param {object} [options={}] Additional options for managing the extension.
   */
  constructor(key, extension, owner = globalThis, options = {}) {
    Object.assign(this, { key, owner, options })

    this.extension = [
      extension,
      { enumerable: true, configurable: true, value: extension }
    ]

    if (Reflect.has(options ?? {}, 'isAccessor') && extension instanceof Function) {
      this.extension[DESCRIPTOR] = {
        enumerable: true,
        configurable: true,
        get: extension,
        set: options?.setter,
      }
    }

    if (Reflect.has(owner, key)) {
      this.original = Extension.#fetchPropAndMeta(owner, key)

      if (this.original?.[DESCRIPTOR]) {
        const descriptor = this.original?.[DESCRIPTOR]

        if (!Extension.#isWritable(descriptor)) {
          throw new CannotBeExtendedError(owner, key)
        }
      }
    }
    else {
      throw new MissingOwnerValue(owner, key)
    }
  }

  /**
   * Checks whether the extension is valid. An extension is considered valid
   * if the original property is present and the extension value is defined.
   *
   * @returns {boolean} True if the extension is valid, otherwise false.
   */
  get isValid() {
    return this.original !== null && this.extension != null && this.hasValue
  }

  /**
   * Checks if the original property key exists on the owner object.
   *
   * @returns {boolean} True if the owner object has the property key, otherwise false.
   */
  get hasValue() {
    return Reflect.has(this.owner, this.key)
  }

  /**
   * Determines if the extension is currently active on the owner object.
   *
   * @returns {boolean} True if the extension is active, otherwise false.
   */
  get isActive() {
    return this.owner[this.key] === this.extension[VALUE]
  }

  /**
   * Activates the extension by defining the property on the owner object with the
   * extended behavior or value.
   */
  activate() {
    if (!this.isActive) {
      Object.defineProperty(this.owner, this.key, this.extension[DESCRIPTOR])
    }
  }

  /**
   * Deactivates the extension by restoring the original property definition
   * on the owner object.
   */
  deactivate() {
    if (this.isActive) {
      Object.defineProperty(this.owner, this.key, this.original[DESCRIPTOR])
    }
  }

  /**
   * Toggles the state of the extension. If active, it will be deactivated,
   * and vice versa.
   */
  toggle() {
    if (this.isActive) {
      this.deactivate()
    }
    else {
      this.activate()
    }
  }

  /**
   * Returns the currently tracked value.
   *
   * @returns {any} the value currently stored on the `owner` object using the
   * `key` property key.
   */
  get currentValue() {
    return this.owner[this.key]
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
    return `Extension:${this.constructor.name} ${this.key}`
  }

  /**
   * Custom getter for the toStringTag symbol. Provides the class name when the
   * object is converted to a string, typically used for debugging and logging.
   *
   * @returns {string} The class name of the Extension instance.
   */
  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  // Storage for the original element under `key` on object `owner`
  original = null

  // The current state of the extension object to apply to `owner`
  extension = null

  // The key where the original version of the object to be extended once
  // resided. When created, the instance of Extension will attempt to
  // capture the original object and store a reference here.
  key = null

  // By default the `globalThis` refers to `window` in a browser or `global`
  // in nodejs compatible environments.
  owner = null

  // The flag indicating the state of the
  activated = false

  /**
   * Fetches the property value and its descriptor from the owner object.
   *
   * @param {object} owner The owner object from which to fetch the property.
   * @param {string} key The key of the property to fetch.
   * @returns {Array} An array containing the property value and its descriptor.
   */
  static #fetchPropAndMeta(owner, key) {
    return [
      owner[key],
      Object.getOwnPropertyDescriptor(owner, key)
    ]
  }

  static #isWritable(descriptor) {
    const configurable =
      Reflect.has(descriptor, 'configurable') && descriptor.configurable

    const writable =
      Reflect.has(descriptor, 'writable') && descriptor.writable

    const isData = Reflect.has(descriptor, 'value')

    return (configurable || (isData && writable))
  }

  static extensions = []
}
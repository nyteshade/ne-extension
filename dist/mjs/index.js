export { Extension } from './extension.js';
import { CannotBeExtendedError } from './errors/CannotBeExtendedError.js';
import { MissingOwnerValue } from './errors/MissingOwnerValue.js';
export const Errors = {
    get CannotBeExtended() { return CannotBeExtendedError; },
    get MissingOwnerValue() { return MissingOwnerValue; },
};

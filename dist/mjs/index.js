export { Extension } from './extension.js';
export { Patch } from './patch.js';
export { PatchCleaner } from './patchcleaner.js';
import { CannotBeExtendedError } from './errors/CannotBeExtendedError.js';
import { MissingOwnerValue } from './errors/MissingOwnerValue.js';
export const Errors = {
    get CannotBeExtended() { return CannotBeExtendedError; },
    get MissingOwnerValue() { return MissingOwnerValue; },
};

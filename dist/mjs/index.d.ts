export { Extension } from "./extension.js";
export { Patch } from "./patch.js";
export namespace Errors {
    let CannotBeExtended: typeof CannotBeExtendedError;
    let MissingOwnerValue: typeof import("./errors/MissingOwnerValue.js").MissingOwnerValue;
}
import { CannotBeExtendedError } from './errors/CannotBeExtendedError.js';

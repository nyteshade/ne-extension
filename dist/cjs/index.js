"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Errors = exports.PatchToggle = exports.Patch = exports.Extension = void 0;
var extension_js_1 = require("./extension.js");
Object.defineProperty(exports, "Extension", { enumerable: true, get: function () { return extension_js_1.Extension; } });
var patch_js_1 = require("./patch.js");
Object.defineProperty(exports, "Patch", { enumerable: true, get: function () { return patch_js_1.Patch; } });
var patchtoggle_js_1 = require("./patchtoggle.js");
Object.defineProperty(exports, "PatchToggle", { enumerable: true, get: function () { return patchtoggle_js_1.PatchToggle; } });
const CannotBeExtendedError_js_1 = require("./errors/CannotBeExtendedError.js");
const MissingOwnerValue_js_1 = require("./errors/MissingOwnerValue.js");
exports.Errors = {
    get CannotBeExtended() { return CannotBeExtendedError_js_1.CannotBeExtendedError; },
    get MissingOwnerValue() { return MissingOwnerValue_js_1.MissingOwnerValue; },
};

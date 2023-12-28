"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Errors = exports.PatchCleaner = exports.Patch = exports.Extension = void 0;
var extension_js_1 = require("./extension.js");
Object.defineProperty(exports, "Extension", { enumerable: true, get: function () { return extension_js_1.Extension; } });
var patch_js_1 = require("./patch.js");
Object.defineProperty(exports, "Patch", { enumerable: true, get: function () { return patch_js_1.Patch; } });
var patchcleaner_js_1 = require("./patchcleaner.js");
Object.defineProperty(exports, "PatchCleaner", { enumerable: true, get: function () { return patchcleaner_js_1.PatchCleaner; } });
const CannotBeExtendedError_js_1 = require("./errors/CannotBeExtendedError.js");
const MissingOwnerValue_js_1 = require("./errors/MissingOwnerValue.js");
exports.Errors = {
    get CannotBeExtended() { return CannotBeExtendedError_js_1.CannotBeExtendedError; },
    get MissingOwnerValue() { return MissingOwnerValue_js_1.MissingOwnerValue; },
};

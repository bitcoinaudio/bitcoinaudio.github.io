"use strict";
/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const javascript_import_scanner_1 = require("../../javascript/javascript-import-scanner");
const test_utils_1 = require("../test-utils");
suite('JavaScriptImportScanner', () => {
    let analyzer;
    suiteSetup(() => __awaiter(this, void 0, void 0, function* () {
        ({ analyzer } = yield test_utils_1.createForDirectory(test_utils_1.fixtureDir));
    }));
    test('finds imports', () => __awaiter(this, void 0, void 0, function* () {
        const { features, warnings } = yield test_utils_1.runScanner(analyzer, new javascript_import_scanner_1.JavaScriptImportScanner(), 'javascript/module.js');
        chai_1.assert.equal(warnings.length, 0);
        chai_1.assert.containSubset(features, [
            {
                type: 'js-import',
                url: './submodule.js',
                lazy: false,
            },
        ]);
    }));
    test('finds dynamic imports', () => __awaiter(this, void 0, void 0, function* () {
        const { features, warnings } = yield test_utils_1.runScanner(analyzer, new javascript_import_scanner_1.JavaScriptImportScanner({ moduleResolution: 'node' }), 'javascript/dynamic-import.js');
        chai_1.assert.equal(warnings.length, 1);
        chai_1.assert.containSubset(warnings, [{ code: 'non-literal-import' }]);
        chai_1.assert.containSubset(features, [
            {
                type: 'js-import',
                url: './submodule.js',
                lazy: true,
                specifier: './submodule.js',
            },
            {
                type: 'js-import',
                url: './node_modules/test-package/index.js',
                lazy: true,
                specifier: 'test-package'
            },
        ]);
    }));
    test('resolves bare specifiers', () => __awaiter(this, void 0, void 0, function* () {
        const { features, warnings } = yield test_utils_1.runScanner(analyzer, new javascript_import_scanner_1.JavaScriptImportScanner({ moduleResolution: 'node' }), 'javascript/module-with-named-import.js');
        chai_1.assert.equal(warnings.length, 0);
        chai_1.assert.containSubset(features, [
            {
                type: 'js-import',
                url: './node_modules/test-package/index.js',
                lazy: false,
                specifier: 'test-package'
            },
            {
                type: 'js-import',
                url: './node_modules/test-package/index.js',
                lazy: false,
                specifier: 'test-package'
            },
        ]);
    }));
    test('warns for non-resolvable bare specifiers', () => __awaiter(this, void 0, void 0, function* () {
        const { features, warnings } = yield test_utils_1.runScanner(analyzer, new javascript_import_scanner_1.JavaScriptImportScanner({ moduleResolution: 'node' }), 'javascript/module-with-not-found-named-import.js');
        chai_1.assert.equal(warnings.length, 1);
        chai_1.assert.containSubset(warnings, [{ code: 'cant-resolve-module-specifier' }]);
        chai_1.assert.containSubset(features, [
            {
                type: 'js-import',
                url: undefined,
                lazy: false,
            },
        ]);
    }));
    test('handles URL specifiers', () => __awaiter(this, void 0, void 0, function* () {
        const { features, warnings } = yield test_utils_1.runScanner(analyzer, new javascript_import_scanner_1.JavaScriptImportScanner(), 'javascript/module-with-remote-import.js');
        chai_1.assert.equal(warnings.length, 0);
        chai_1.assert.containSubset(features, [
            {
                type: 'js-import',
                url: 'https://unpkg.com/lit-html/lit-html.js',
                lazy: false,
            },
        ]);
    }));
    test('recognizes reexports as imports', () => __awaiter(this, void 0, void 0, function* () {
        const { features, warnings } = yield test_utils_1.runScanner(analyzer, new javascript_import_scanner_1.JavaScriptImportScanner(), 'javascript/all-export-types.js');
        chai_1.assert.equal(warnings.length, 0);
        chai_1.assert.containSubset(features, [
            {
                type: 'js-import',
                url: './module-with-export.js',
                lazy: false,
            },
            {
                type: 'js-import',
                url: './module-with-export.js',
                lazy: false,
            },
        ]);
    }));
});
//# sourceMappingURL=javascript-import-scanner_test.js.map
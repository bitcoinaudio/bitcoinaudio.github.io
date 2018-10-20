"use strict";
/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
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
const test_utils_1 = require("../test-utils");
suite('JavaScriptExportScanner', () => {
    let analyzer;
    suiteSetup(() => __awaiter(this, void 0, void 0, function* () {
        analyzer = (yield test_utils_1.createForDirectory(test_utils_1.fixtureDir)).analyzer;
    }));
    function getExports(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            const analysis = yield analyzer.analyze([filename]);
            const result = analysis.getDocument(filename);
            if (!result.successful) {
                throw new Error('could not get document');
            }
            chai_1.assert.deepEqual(result.value.getWarnings().map((w) => w.toString()), []);
            return result.value.getFeatures({ kind: 'export' });
        });
    }
    test('identifies the names of exports', () => __awaiter(this, void 0, void 0, function* () {
        const features = yield getExports('javascript/all-export-types.js');
        chai_1.assert.deepEqual([...features].map((f) => [...f.identifiers]), [
            ['namedConstIdentifier'],
            ['default'],
            ['ClassName'],
            ['functionName'],
            ['identifierAssignedFunction'],
            ['a', 'b', 'c', 'd'],
            ['g', 'i', 'k'],
            ['anotherValue'],
            ['someValue']
        ]);
    }));
    test('re-exports across multiple files correctly', () => __awaiter(this, void 0, void 0, function* () {
        const features = yield getExports('javascript/re-export-all.js');
        // Like the list above, but flattened as they're all exported from one
        // export statement.
        chai_1.assert.deepEqual([...features].map((f) => [...f.identifiers]), [[
                'namedConstIdentifier',
                'ClassName',
                'functionName',
                'identifierAssignedFunction',
                'a',
                'b',
                'c',
                'd',
                'g',
                'i',
                'k',
                'anotherValue',
                'someValue'
            ]]);
    }));
});
//# sourceMappingURL=javascript-export-scanner_test.js.map
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
const model_1 = require("../../model/model");
const test_utils_1 = require("../test-utils");
function getOnlyItem(items) {
    const arr = [...items];
    chai_1.assert.equal(arr.length, 1);
    return arr[0];
}
suite('ScannedReference', () => {
    let analyzer;
    suiteSetup(() => __awaiter(this, void 0, void 0, function* () {
        analyzer = (yield test_utils_1.createForDirectory(test_utils_1.fixtureDir)).analyzer;
    }));
    test('resolves exports', () => __awaiter(this, void 0, void 0, function* () {
        const filename = 'javascript/exported-class.js';
        const analysis = yield analyzer.analyze([filename]);
        const result = analysis.getDocument(filename);
        if (!result.successful) {
            throw new Error('could not get document');
        }
        const doc = result.value;
        chai_1.assert.deepEqual(doc.getWarnings().map((w) => w.toString()), []);
        function resolve(feature) {
            const reference = new model_1.ScannedReference('class', getOnlyItem(feature.identifiers), feature.sourceRange, feature.astNode, feature.astNodePath);
            const resolved = reference.resolve(doc);
            if (resolved.feature === undefined) {
                return undefined;
            }
            return getOnlyItem(resolved.feature.identifiers);
        }
        const exports = result.value.getFeatures({ kind: 'export' });
        const actual = [...exports].map((e) => [getOnlyItem(e.identifiers), resolve(e)]);
        chai_1.assert.deepEqual(actual, [
            ['Foo', 'Foo'],
            ['FooAlias', 'Foo'],
            ['Bar', 'Bar'],
        ]);
    }));
});
//# sourceMappingURL=reference_test.js.map
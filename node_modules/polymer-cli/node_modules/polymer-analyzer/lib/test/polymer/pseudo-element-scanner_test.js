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
const pseudo_element_scanner_1 = require("../../polymer/pseudo-element-scanner");
const test_utils_1 = require("../test-utils");
suite('PseudoElementScanner', () => {
    test('finds pseudo elements in html comments ', () => __awaiter(this, void 0, void 0, function* () {
        const desc = `This is a pseudo element`;
        const contents = `<html><head></head><body>
          <!--
          ${desc}
          @pseudoElement x-foo
          @demo demo/index.html
          -->
        </body>
        </html>`;
        const { features } = yield test_utils_1.runScannerOnContents(new pseudo_element_scanner_1.PseudoElementScanner(), 'test-doc.html', contents);
        chai_1.assert.deepEqual(features.map((f) => [f.tagName, f.pseudo, f.description.trim(), f.demos]), [[
                'x-foo',
                true,
                desc,
                [{ desc: 'demo', path: test_utils_1.fileRelativeUrl `demo/index.html` }]
            ]]);
    }));
});
//# sourceMappingURL=pseudo-element-scanner_test.js.map
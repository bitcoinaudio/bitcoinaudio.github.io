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
const css_import_scanner_1 = require("../../polymer/css-import-scanner");
const test_utils_1 = require("../test-utils");
suite('CssImportScanner', () => {
    test('finds CSS Imports', () => __awaiter(this, void 0, void 0, function* () {
        const contents = `<html><head>
          <link rel="import" href="polymer.html">
          <link rel="import" type="css" href="ignored-outside-dom-module.css">
          <script src="foo.js"></script>
          <link rel="stylesheet" href="foo.css"></link>
        </head>
        <body>
          <dom-module>
            <link rel="import" type="css" href="polymer.css">
            <template>
              <link rel="import" type="css" href="ignored-in-template.css">
            </template>
          </dom-module>
        </body>
        </html>`;
        const { features } = yield test_utils_1.runScannerOnContents(new css_import_scanner_1.CssImportScanner(), 'test.html', contents);
        chai_1.assert.deepEqual(features.map((f) => [f.type, f.url]), [['css-import', 'polymer.css']]);
    }));
    test('adjusts CSS Import urls relative to baseUrl', () => __awaiter(this, void 0, void 0, function* () {
        const contents = `<html><head><base href="/aybabtu/">
        </head>
        <body>
          <dom-module>
            <link rel="import" type="css" href="polymer.css">
          </dom-module>
        </body>
        </html>`;
        const { features, analyzer, urlLoader } = yield test_utils_1.runScannerOnContents(new css_import_scanner_1.CssImportScanner(), 'test.html', contents);
        chai_1.assert.deepEqual(features.map((f) => [f.type, f.url]), [['css-import', 'polymer.css']]);
        urlLoader.urlContentsMap.set(analyzer.resolveUrl('aybabtu/polymer.css'), '');
        const [import_] = (yield analyzer.analyze(['test.html'])).getFeatures({ kind: 'import' });
        chai_1.assert.equal(import_.originalUrl, 'polymer.css');
        chai_1.assert.equal(import_.url, analyzer.resolveUrl('aybabtu/polymer.css'));
    }));
});
//# sourceMappingURL=css-import-scanner_test.js.map
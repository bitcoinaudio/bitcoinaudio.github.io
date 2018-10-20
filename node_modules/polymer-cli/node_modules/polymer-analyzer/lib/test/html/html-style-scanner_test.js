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
const html_style_scanner_1 = require("../../html/html-style-scanner");
const model_1 = require("../../model/model");
const test_utils_1 = require("../test-utils");
suite('HtmlStyleScanner', () => {
    test('finds external and inline styles', () => __awaiter(this, void 0, void 0, function* () {
        const contents = `<html><head>
          <link rel="stylesheet" type="text/css" href="foo.css">
          <style>h1 { color: green; }</style>
        </head></html>`;
        const { features } = yield test_utils_1.runScannerOnContents(new html_style_scanner_1.HtmlStyleScanner(), 'test-document.html', contents);
        chai_1.assert.equal(features.length, 2);
        chai_1.assert.instanceOf(features[0], model_1.ScannedImport);
        const feature0 = features[0];
        chai_1.assert.equal(feature0.type, 'html-style');
        chai_1.assert.equal(feature0.url, 'foo.css');
        chai_1.assert.instanceOf(features[1], model_1.ScannedInlineDocument);
        const feature1 = features[1];
        chai_1.assert.equal(feature1.type, 'css');
        chai_1.assert.equal(feature1.contents, `h1 { color: green; }`);
        chai_1.assert.deepEqual(feature1.locationOffset, { line: 2, col: 17 });
    }));
    test('finds external styles relative to baseUrl', () => __awaiter(this, void 0, void 0, function* () {
        const contents = `<html><head><base href="/aybabtu/">
          <link rel="stylesheet" type="text/css" href="foo.css">
        </head></html>`;
        const { features } = yield test_utils_1.runScannerOnContents(new html_style_scanner_1.HtmlStyleScanner(), 'test-document.html', contents);
        chai_1.assert.deepEqual(features.map((f) => [f.type, f.url]), [['html-style', 'foo.css']]);
    }));
});
//# sourceMappingURL=html-style-scanner_test.js.map
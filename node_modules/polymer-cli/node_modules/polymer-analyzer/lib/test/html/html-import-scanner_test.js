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
const html_import_scanner_1 = require("../../html/html-import-scanner");
const index_1 = require("../../index");
const test_utils_1 = require("../test-utils");
suite('HtmlImportScanner', () => {
    test('finds HTML Imports', () => __awaiter(this, void 0, void 0, function* () {
        const contents = `<html><head>
          <link rel="import" href="polymer.html">
          <link rel="import" type="css" href="polymer.css">
          <script src="foo.js"></script>
          <link rel="stylesheet" href="foo.css"></link>
        </head></html>`;
        const { features } = yield test_utils_1.runScannerOnContents(new html_import_scanner_1.HtmlImportScanner(), 'test.html', contents);
        const importFeatures = features;
        chai_1.assert.deepEqual(importFeatures.map((imp) => [imp.type, imp.url]), [['html-import', 'polymer.html']]);
    }));
    test('resolves HTML Import URLs relative to baseUrl', () => __awaiter(this, void 0, void 0, function* () {
        const contents = `<html><head><base href="/aybabtu/">
          <link rel="import" href="polymer.html">
          <link rel="import" type="css" href="polymer.css">
          <script src="foo.js"></script>
          <link rel="stylesheet" href="foo.css"></link>
        </head></html>`;
        const { features, analyzer, urlLoader } = yield test_utils_1.runScannerOnContents(new html_import_scanner_1.HtmlImportScanner(), 'test.html', contents);
        const importFeatures = features;
        chai_1.assert.deepEqual(importFeatures.map((imp) => [imp.type, imp.url]), [['html-import', 'polymer.html']]);
        urlLoader.urlContentsMap.set(analyzer.resolveUrl('aybabtu/polymer.html'), '');
        const [import_] = (yield analyzer.analyze(['test.html'])).getFeatures({
            kind: 'html-import'
        });
        chai_1.assert.equal(import_.originalUrl, 'polymer.html');
        chai_1.assert.equal(import_.url, analyzer.resolveUrl('aybabtu/polymer.html'));
    }));
    test('finds lazy HTML Imports', () => __awaiter(this, void 0, void 0, function* () {
        const contents = `<html><head>
          <link rel="import" href="polymer.html">
          <dom-module>
          <link rel="lazy-import"  href="lazy-polymer.html">
          </dom-module>
          <link rel="stylesheet" href="foo.css"></link>
        </head></html>`;
        const { features } = yield test_utils_1.runScannerOnContents(new html_import_scanner_1.HtmlImportScanner(), 'test.html', contents);
        const importFeatures = features;
        chai_1.assert.deepEqual(importFeatures.map((imp) => [imp.type, imp.url, imp.lazy]), [
            ['html-import', 'polymer.html', false],
            ['html-import', 'lazy-polymer.html', true]
        ]);
    }));
    suite('scan() with lazy import map', () => {
        test('injects synthetic lazy html imports', () => __awaiter(this, void 0, void 0, function* () {
            const contents = `<html><head>
            <link rel="import" href="polymer.html">
            <link rel="import" type="css" href="polymer.css">
            <script src="foo.js"></script>
            <link rel="stylesheet" href="foo.css"></link>
          </head></html>`;
            const overlayLoader = new index_1.InMemoryOverlayUrlLoader();
            const analyzer = new index_1.Analyzer({ urlLoader: overlayLoader });
            overlayLoader.urlContentsMap.set(analyzer.resolveUrl('test.html'), contents);
            const lazyEdges = new Map([[
                    analyzer.resolveUrl('test.html'),
                    ['lazy1.html', 'lazy2.html', 'lazy3.html']
                ]]);
            const { features } = yield test_utils_1.runScanner(analyzer, new html_import_scanner_1.HtmlImportScanner(lazyEdges), 'test.html');
            const importFeatures = features;
            chai_1.assert.deepEqual(importFeatures.map((f) => f.type), ['html-import', 'html-import', 'html-import', 'html-import']);
            chai_1.assert.deepEqual(importFeatures.map((i) => i.lazy), [false, true, true, true]);
            chai_1.assert.deepEqual(importFeatures.map((f) => f.url), ['polymer.html', 'lazy1.html', 'lazy2.html', 'lazy3.html']);
        }));
    });
});
//# sourceMappingURL=html-import-scanner_test.js.map
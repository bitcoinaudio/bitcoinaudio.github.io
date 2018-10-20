"use strict";
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
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
const dom5 = require("dom5/lib/index-next");
const analyzer_1 = require("../../core/analyzer");
const overlay_loader_1 = require("../../url-loader/overlay-loader");
const package_url_resolver_1 = require("../../url-loader/package-url-resolver");
const test_utils_1 = require("../test-utils");
suite('HtmlTemplateLiteralScanner', () => {
    function analyzeContents(fileName, contents) {
        return __awaiter(this, void 0, void 0, function* () {
            const urlResolver = new package_url_resolver_1.PackageUrlResolver();
            const urlLoader = new overlay_loader_1.InMemoryOverlayUrlLoader();
            const url = urlResolver.resolve(fileName);
            urlLoader.urlContentsMap.set(url, contents);
            const analyzer = new analyzer_1.Analyzer({ urlResolver, urlLoader });
            const analysis = yield analyzer.analyze([url]);
            const result = analysis.getDocument(url);
            if (!result.successful) {
                throw new Error(`Tried to get document for url but failed: ${url}`);
            }
            const underliner = new test_utils_1.CodeUnderliner(analyzer);
            return { document: result.value, url, underliner };
        });
    }
    test('works in a super simple case', () => __awaiter(this, void 0, void 0, function* () {
        const { document, url } = yield analyzeContents('index.js', `
      html\`<div>Hello world</div>\`
    `);
        const documents = document.getFeatures({ kind: 'document' });
        chai_1.assert.deepEqual([...documents].map((d) => [d.url, d.type, d.isInline]), [[url, 'js', false], [url, 'html', true]]);
        const [htmlDocument] = document.getFeatures({ kind: 'html-document' });
        chai_1.assert.deepEqual(htmlDocument.parsedDocument.contents, `<div>Hello world</div>`);
    }));
    test('can get source ranges for tags in the inline document', () => __awaiter(this, void 0, void 0, function* () {
        const { document, underliner } = yield analyzeContents('index.js', `
      html\`<div>Hello world</div>
        \${expression()}
        <div>Another tag</div>
      \`;
    `);
        const [htmlDocument] = document.getFeatures({ kind: 'html-document' });
        const elements = [...dom5.queryAll(htmlDocument.parsedDocument.ast, dom5.predicates.hasTagName('div'))];
        const ranges = elements.map((el) => htmlDocument.parsedDocument.sourceRangeForStartTag(el));
        chai_1.assert.deepEqual(yield underliner.underline(ranges), [
            `
      html\`<div>Hello world</div>
           ~~~~~`,
            `
        <div>Another tag</div>
        ~~~~~`
        ]);
    }));
    let testName = 'can handle nesting of inline documents with html at the root';
    test(testName, () => __awaiter(this, void 0, void 0, function* () {
        const { document, underliner, url } = yield analyzeContents('index.html', `
      <script>
        html\`<div>Hello world</div>\`;
      </script>
    `);
        const documents = document.getFeatures({ kind: 'document' });
        chai_1.assert.deepEqual([...documents].map((d) => [d.url, d.type, d.isInline]), [[url, 'html', false], [url, 'js', true], [url, 'html', true]]);
        const [, htmlDocument] = document.getFeatures({ kind: 'html-document' });
        chai_1.assert.deepEqual(htmlDocument.parsedDocument.contents, `<div>Hello world</div>`);
        const elements = [...dom5.queryAll(htmlDocument.parsedDocument.ast, dom5.predicates.hasTagName('div'))];
        const ranges = elements.map((el) => htmlDocument.parsedDocument.sourceRangeForStartTag(el));
        chai_1.assert.deepEqual(yield underliner.underline(ranges), [
            `
        html\`<div>Hello world</div>\`;
             ~~~~~`,
        ]);
    }));
    testName = 'can handle nesting of inline documents with js at the root';
    test(testName, () => __awaiter(this, void 0, void 0, function* () {
        const { document, underliner, url } = yield analyzeContents('index.js', `

      html\`
        <div>Hello world</div>

        <script>
          \${
            multiLineExpressionToComplicateSourceRanges
          }
          html\\\`
            <style>
              div {
                --working: yes;
              }
            </style>
          \\\`
        </script>
      \`;
    `);
        const documents = document.getFeatures({ kind: 'document' });
        chai_1.assert.deepEqual([...documents].map((d) => [d.url, d.type, d.isInline]), [
            [url, 'js', false],
            [url, 'html', true],
            [url, 'js', true],
            [url, 'html', true],
            [url, 'css', true]
        ]);
        const [customPropertyAssignment] = document.getFeatures({ kind: 'css-custom-property-assignment' });
        chai_1.assert.deepEqual(yield underliner.underline(customPropertyAssignment.sourceRange), `
                --working: yes;
                ~~~~~~~~~`);
    }));
    // See: https://github.com/Polymer/polymer-analyzer/issues/818
    testName = 'can handle escape characters properly';
    test.skip(testName, () => __awaiter(this, void 0, void 0, function* () {
        const { document, underliner, url } = yield analyzeContents('index.js', `
      html\`\\n\\n<div>Hello world</div>\`;
    `);
        const documents = document.getFeatures({ kind: 'document' });
        chai_1.assert.deepEqual([...documents].map((d) => [d.url, d.type, d.isInline]), [[url, 'js', false], [url, 'html', true]]);
        const [htmlDocument] = document.getFeatures({ kind: 'html-document' });
        chai_1.assert.deepEqual(htmlDocument.parsedDocument.contents, '\n\n<div>Hello world</div>');
        const elements = [...dom5.queryAll(htmlDocument.parsedDocument.ast, dom5.predicates.hasTagName('div'))];
        const ranges = elements.map((el) => htmlDocument.parsedDocument.sourceRangeForStartTag(el));
        chai_1.assert.deepEqual(yield underliner.underline(ranges), [`
      html\`\\n\\n<div>Hello world</div>\`;
                ~~~~~`]);
    }));
});
//# sourceMappingURL=html-template-literal-scanner_test.js.map
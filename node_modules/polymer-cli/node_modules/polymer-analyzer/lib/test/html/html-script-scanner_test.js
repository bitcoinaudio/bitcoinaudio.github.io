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
const analyzer_1 = require("../../core/analyzer");
const html_script_scanner_1 = require("../../html/html-script-scanner");
const model_1 = require("../../model/model");
const overlay_loader_1 = require("../../url-loader/overlay-loader");
const test_utils_1 = require("../test-utils");
suite('HtmlScriptScanner', () => {
    test('finds external and inline scripts', () => __awaiter(this, void 0, void 0, function* () {
        const contents = `<html><head>
          <script src="foo.js"></script>
          <script>console.log('hi')</script>
        </head></html>`;
        const { features } = yield test_utils_1.runScannerOnContents(new html_script_scanner_1.HtmlScriptScanner(), 'test-document.html', contents);
        chai_1.assert.equal(features.length, 2);
        chai_1.assert.instanceOf(features[0], model_1.ScannedImport);
        const feature0 = features[0];
        chai_1.assert.equal(feature0.type, 'html-script');
        chai_1.assert.equal(feature0.url, 'foo.js');
        chai_1.assert.instanceOf(features[1], model_1.ScannedInlineDocument);
        const feature1 = features[1];
        chai_1.assert.equal(feature1.type, 'js');
        chai_1.assert.equal(feature1.contents, `console.log('hi')`);
        chai_1.assert.deepEqual(feature1.locationOffset, { line: 2, col: 18 });
    }));
    test('finds external scripts relative to baseUrl', () => __awaiter(this, void 0, void 0, function* () {
        const contents = `<html><head><base href="/aybabtu/">
          <script src="foo.js"></script>
        </head></html>`;
        const { features } = yield test_utils_1.runScannerOnContents(new html_script_scanner_1.HtmlScriptScanner(), 'test-document.html', contents);
        chai_1.assert.deepEqual(features.map((f) => [f.type, f.url]), [['html-script', 'foo.js']]);
    }));
    test('could-not-load vs not-loadable warnings', () => __awaiter(this, void 0, void 0, function* () {
        const contents = `
      <script src="does-not-exist-but-should.js"></script>
      <script src="https://else.where/does-not-exist-lol-dont-care.js"></script>
    `;
        const urlLoader = new overlay_loader_1.InMemoryOverlayUrlLoader();
        const analyzer = new analyzer_1.Analyzer({ urlLoader });
        const testDocUrl = analyzer.resolveUrl('test-document.html');
        urlLoader.urlContentsMap.set(testDocUrl, contents);
        urlLoader.canLoad = (url) => url.startsWith('file://');
        const testDoc = (yield analyzer.analyze([testDocUrl])).getDocument(testDocUrl);
        if (!testDoc.successful) {
            throw testDoc.error;
        }
        const warnings = testDoc.value.warnings;
        chai_1.assert.deepEqual(warnings.map((w) => w.code).sort(), ['could-not-load', 'not-loadable']);
        const couldNotLoadWarning = warnings.find((w) => w.code === 'could-not-load');
        chai_1.assert.match(couldNotLoadWarning.message, /does-not-exist-but-should\.js/);
        const notLoadableWarning = warnings.find((w) => w.code === 'not-loadable');
        chai_1.assert.match(notLoadableWarning.message, /does-not-exist-lol-dont-care\.js/);
    }));
    suite('modules', () => {
        let analyzer;
        let analysis;
        suiteSetup(() => __awaiter(this, void 0, void 0, function* () {
            ({ analyzer } = yield test_utils_1.createForDirectory(test_utils_1.fixtureDir));
            analysis = yield analyzer.analyze(['js-modules.html', 'base-href/imports-js-module-with-base.html']);
        }));
        test('finds external module scripts', () => {
            const result = analysis.getDocument('js-modules.html');
            if (!result.successful) {
                throw new Error(`could not get document js-modules.html`);
            }
            const htmlScripts = [...result.value.getFeatures({ kind: 'html-script' })];
            chai_1.assert.equal(htmlScripts.length, 1);
            const js = htmlScripts[0].document.parsedDocument;
            chai_1.assert.equal(js.url, analyzer.resolveUrl('javascript/module.js'));
            chai_1.assert.equal(js.parsedAsSourceType, 'module');
        });
        test('finds inline module scripts', () => {
            const result = analysis.getDocument('js-modules.html');
            if (!result.successful) {
                throw new Error(`could not get document js-modules.html`);
            }
            const inlineDocuments = [...result.value.getFeatures({ kind: 'inline-document' })];
            chai_1.assert.equal(inlineDocuments.length, 2);
            const js1 = inlineDocuments[0].parsedDocument;
            chai_1.assert.equal(js1.url, analyzer.resolveUrl('js-modules.html'));
            chai_1.assert.equal(js1.parsedAsSourceType, 'module');
            chai_1.assert.equal(js1.contents.trim(), `import * as something from './javascript/module-with-export.js';`);
            const js2 = inlineDocuments[1].parsedDocument;
            chai_1.assert.equal(js2.url, analyzer.resolveUrl('js-modules.html'));
            chai_1.assert.equal(js2.parsedAsSourceType, 'module');
            chai_1.assert.equal(js2.contents.trim(), `import * as somethingElse from './javascript/other-module-with-export.js';`);
        });
        test('follows import statements in modules', () => __awaiter(this, void 0, void 0, function* () {
            const result = analysis.getDocument('js-modules.html');
            if (!result.successful) {
                throw new Error(`could not get document js-modules.html`);
            }
            const jsImports = [...result.value.getFeatures({ kind: 'js-import', imported: true, excludeBackreferences: true })];
            chai_1.assert.deepEqual(jsImports.map((imp) => imp.originalUrl), [
                './javascript/module-with-export.js',
                './javascript/other-module-with-export.js',
                './submodule.js',
                './submodule.js',
                './does-not-exist.js',
            ]);
            // import statement in 1st inline module script in 'js-modules.html'
            const js0 = jsImports[0].document.parsedDocument;
            chai_1.assert.equal(js0.url, analyzer.resolveUrl('javascript/module-with-export.js'));
            chai_1.assert.equal(js0.parsedAsSourceType, 'module');
            chai_1.assert.equal(js0.contents.trim(), `export const someValue = 'value goes here';`);
            // import statement in 2nd inline module script in 'js-modules.html'
            const js1 = jsImports[1].document.parsedDocument;
            chai_1.assert.equal(js1.url, analyzer.resolveUrl('javascript/other-module-with-export.js'));
            chai_1.assert.equal(js1.parsedAsSourceType, 'module');
            chai_1.assert.equal(js1.contents.trim(), `import { subThing } from './submodule.js';\n` +
                `export const otherValue = subThing;`);
            // import statement in imported 'javascript/other-module-with-export.js'
            const js2 = jsImports[2].document.parsedDocument;
            chai_1.assert.equal(js2.url, analyzer.resolveUrl('javascript/submodule.js'));
            chai_1.assert.equal(js2.parsedAsSourceType, 'module');
            chai_1.assert.equal(js2.contents.trim(), `export const subThing = 'sub-thing';`);
            // import statement in external module script 'javascript/module.js'
            const js3 = jsImports[3].document.parsedDocument;
            chai_1.assert.equal(js3.url, analyzer.resolveUrl('javascript/submodule.js'));
            chai_1.assert.equal(js3.parsedAsSourceType, 'module');
            chai_1.assert.equal(js3.contents.trim(), `export const subThing = 'sub-thing';`);
        }));
        test('query for modules imported in specific inline scripts', () => __awaiter(this, void 0, void 0, function* () {
            const result = analysis.getDocument('js-modules.html');
            if (!result.successful) {
                throw new Error(`could not get document js-modules.html`);
            }
            const [jsDoc0, jsDoc1] = [...result.value.getFeatures({ kind: 'js-document', imported: false, excludeBackreferences: true })];
            chai_1.assert.equal(jsDoc0.parsedDocument.contents.trim(), `import * as something from './javascript/module-with-export.js';`);
            chai_1.assert.equal(jsDoc1.parsedDocument.contents.trim(), `import * as somethingElse from './javascript/other-module-with-export.js';`);
            const jsDoc0imports = jsDoc0.getFeatures({ kind: 'js-import', imported: false, excludeBackreferences: true });
            chai_1.assert.equal(jsDoc0imports.size, 1);
            // Demonstrate that without `excludeBackreferences: true`, the number of
            // imports returned would be 2, because we'll be getting the js-import
            // from the other inline JavaScript document's import statement.
            chai_1.assert.equal(jsDoc0.getFeatures({ kind: 'js-import', imported: false }).size, 2);
            const jsDoc1imports = jsDoc1.getFeatures({ kind: 'js-import', imported: false, excludeBackreferences: true });
            chai_1.assert.equal(jsDoc1imports.size, 1);
        }));
        test('finds imports, honoring base href', () => __awaiter(this, void 0, void 0, function* () {
            const result = analysis.getDocument('base-href/imports-js-module-with-base.html');
            if (!result.successful) {
                throw new Error(`could not get document` +
                    ` base-href/imports-js-module-with-base.html`);
            }
            const jsImports = [...result.value.getFeatures({ kind: 'js-import' })];
            chai_1.assert.equal(jsImports.length, 1);
            // import statement in inline module script in
            // 'imports-js-module-with-base.html'
            const js0 = jsImports[0].document.parsedDocument;
            chai_1.assert.equal(js0.url, analyzer.resolveUrl('javascript/module-with-export.js'));
            chai_1.assert.equal(js0.parsedAsSourceType, 'module');
            chai_1.assert.equal(js0.contents.trim(), `export const someValue = 'value goes here';`);
        }));
    });
});
//# sourceMappingURL=html-script-scanner_test.js.map
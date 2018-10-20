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
const clone = require("clone");
const path = require("path");
const analyzer_1 = require("../../core/analyzer");
const utils_1 = require("../../core/utils");
const html_document_1 = require("../../html/html-document");
const html_parser_1 = require("../../html/html-parser");
const javascript_document_1 = require("../../javascript/javascript-document");
const model_1 = require("../../model/model");
const fs_url_loader_1 = require("../../url-loader/fs-url-loader");
const overlay_loader_1 = require("../../url-loader/overlay-loader");
const test_utils_1 = require("../test-utils");
const chaiAsPromised = require("chai-as-promised");
const chaiSubset = require("chai-subset");
const stripIndent = require("strip-indent");
const package_url_resolver_1 = require("../../url-loader/package-url-resolver");
const analysis_context_1 = require("../../core/analysis-context");
const vscode_uri_1 = require("vscode-uri");
const cancel_token_1 = require("../../core/cancel-token");
chai_1.use(chaiSubset);
chai_1.use(chaiAsPromised);
function getOnly(iter) {
    const arr = Array.from(iter);
    chai_1.assert.equal(arr.length, 1);
    return arr[0];
}
const testDir = path.join(test_utils_1.fixtureDir, '..');
suite('Analyzer', () => {
    let analyzer;
    let inMemoryOverlay;
    let underliner;
    function analyzeDocument(url, localAnalyzer) {
        return __awaiter(this, void 0, void 0, function* () {
            localAnalyzer = localAnalyzer || analyzer;
            const result = (yield localAnalyzer.analyze([url])).getDocument(url);
            if (!result.successful) {
                throw new Error(`Could not get document for url: ${url}`);
            }
            return result.value;
        });
    }
    setup(() => {
        const underlyingUrlLoader = new fs_url_loader_1.FsUrlLoader(testDir);
        inMemoryOverlay = new overlay_loader_1.InMemoryOverlayUrlLoader(underlyingUrlLoader);
        analyzer = new analyzer_1.Analyzer({
            urlLoader: inMemoryOverlay,
            urlResolver: new package_url_resolver_1.PackageUrlResolver({ packageDir: testDir })
        });
        underliner = new test_utils_1.CodeUnderliner(inMemoryOverlay);
    });
    test('canLoad delegates to the urlLoader canLoad method', () => {
        chai_1.assert.isTrue(analyzer.canLoad(vscode_uri_1.default.file(testDir).toString()));
        chai_1.assert.isFalse(analyzer.canLoad(vscode_uri_1.default.file(path.resolve(testDir, '../outside')).toString()));
        chai_1.assert.isFalse(analyzer.canLoad(test_utils_1.resolvedUrl `file://hostname/path`));
        chai_1.assert.isFalse(analyzer.canLoad(test_utils_1.resolvedUrl `http://host/`));
        chai_1.assert.isFalse(analyzer.canLoad(test_utils_1.resolvedUrl `http://host/path`));
    });
    suite('analyze()', () => {
        let testName = 'analyzes a document with an inline Polymer element feature';
        test(testName, () => __awaiter(this, void 0, void 0, function* () {
            const document = yield analyzeDocument('static/analysis/simple/simple-element.html');
            const elements = Array.from(document.getFeatures({ kind: 'element', imported: false }));
            chai_1.assert.deepEqual(elements.map((e) => e.tagName), ['simple-element']);
        }));
        testName = 'analyzes a document with an external Polymer element feature';
        test(testName, () => __awaiter(this, void 0, void 0, function* () {
            const document = yield analyzeDocument('static/analysis/separate-js/element.html');
            const elements = Array.from(document.getFeatures({ kind: 'element', imported: true }));
            chai_1.assert.deepEqual(elements.map((e) => e.tagName), ['my-element']);
        }));
        test('gets source ranges of documents correct', () => __awaiter(this, void 0, void 0, function* () {
            const document = yield analyzeDocument('static/dependencies/root.html');
            chai_1.assert.deepEqual(yield underliner.underline(document.sourceRange), `
<link rel="import" href="inline-only.html">
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
<link rel="import" href="leaf.html">
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
<link rel="import" href="inline-and-imports.html">
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
<link rel="import" href="subfolder/in-folder.html">
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
<link rel="lazy-import" href="lazy.html">
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

`);
        }));
        test('analyzes inline scripts correctly', () => __awaiter(this, void 0, void 0, function* () {
            const document = yield analyzeDocument('static/inline-documents/inline-documents.html');
            const jsDocuments = document.getFeatures({ kind: 'js-document' });
            chai_1.assert.equal(jsDocuments.size, 1);
            const jsDocument = getOnly(jsDocuments);
            chai_1.assert.isObject(jsDocument.astNode);
            const astNode = jsDocument.astNode;
            if (astNode.language !== 'html') {
                throw new Error('Expected inline js doc to have an HTML containing node.');
            }
            chai_1.assert.equal(astNode.node.tagName, 'script');
            chai_1.assert.deepEqual(yield underliner.underline(jsDocument.sourceRange), `
  <script>
          ~
    console.log('hi');
~~~~~~~~~~~~~~~~~~~~~~
  </script>
~~`);
        }));
        test('analyzes inline styles correctly', () => __awaiter(this, void 0, void 0, function* () {
            const document = yield analyzeDocument('static/inline-documents/inline-documents.html');
            const cssDocuments = document.getFeatures({ kind: 'css-document' });
            const cssDocument = getOnly(cssDocuments);
            const astNode = cssDocument.astNode;
            chai_1.assert.isObject(astNode);
            if (astNode.language !== 'html') {
                throw new Error('Expected inline css doc to have an HTML containing node.');
            }
            chai_1.assert.equal(astNode.node.tagName, 'style');
            chai_1.assert.deepEqual(yield underliner.underline(cssDocument.sourceRange), `
  <style>
         ~
    body {
~~~~~~~~~~
      color: red;
~~~~~~~~~~~~~~~~~
    }
~~~~~
  </style>
~~`);
        }));
        test('analyzes a document with an import', () => __awaiter(this, void 0, void 0, function* () {
            const document = yield analyzeDocument('static/analysis/behaviors/behavior.html');
            const behaviors = Array.from(document.getFeatures({ kind: 'behavior', imported: true }));
            chai_1.assert.deepEqual(behaviors.map((b) => b.className), ['MyNamespace.SubBehavior', 'MyNamespace.SimpleBehavior']);
        }));
        testName = 'gives a useful warning when analyzing a nonexistant file';
        test(testName, () => __awaiter(this, void 0, void 0, function* () {
            const analysis = yield analyzer.analyze(['static/analysis/does-not-exist.html']);
            const warnings = analysis.getWarnings();
            chai_1.assert.deepEqual(warnings.map((w) => w.code), ['could-not-load']);
            chai_1.assert.match(warnings[0].message, /^No such file: /);
        }));
        testName = `creates "missing behavior" warnings on imported ` +
            `documents without elements`;
        test(testName, () => __awaiter(this, void 0, void 0, function* () {
            const document = yield analyzeDocument('static/chained-missing-behavior/index.html');
            const chainedDocument = getOnly(document.getFeatures({
                kind: 'document',
                id: analyzer.resolveUrl('static/chained-missing-behavior/chained.html'),
                imported: true
            }));
            const expectedWarning = {
                code: 'could-not-resolve-reference',
                message: 'Could not resolve reference to behavior. Is it annotated with' +
                    ' @polymerBehavior?',
                severity: 1,
                sourceRange: {
                    end: { column: 55, line: 2 },
                    start: { column: 39, line: 2 },
                    file: analyzer.resolveUrl('static/chained-missing-behavior/chained.html')
                },
            };
            chai_1.assert.deepEqual(document.getWarnings({ imported: false }), []);
            chai_1.assert.deepEqual(document.getWarnings({ imported: true }).map((w) => w.toJSON()), [expectedWarning]);
            chai_1.assert.deepEqual(chainedDocument.getWarnings({ imported: false }).map((w) => w.toJSON()), [expectedWarning]);
        }));
        testName =
            'an inline document can find features from its container document';
        test(testName, () => __awaiter(this, void 0, void 0, function* () {
            const document = yield analyzeDocument('static/analysis/behaviors/behavior.html');
            const localDocuments = document.getFeatures({ kind: 'document', imported: false });
            chai_1.assert.equal(localDocuments.size, 2); // behavior.html and its inline
            const allDocuments = document.getFeatures({ kind: 'document', imported: true });
            chai_1.assert.equal(allDocuments.size, 4);
            const inlineDocuments = Array.from(document.getFeatures({ kind: 'document', imported: false }))
                .filter((d) => d instanceof model_1.Document && d.isInline);
            chai_1.assert.equal(inlineDocuments.length, 1);
            // This is the main purpose of the test: get a feature from
            // the inline
            // document that's imported by the container document
            const behaviorJsDocument = inlineDocuments[0];
            const subBehavior = getOnly(behaviorJsDocument.getFeatures({ kind: 'behavior', id: 'MyNamespace.SubBehavior', imported: true }));
            chai_1.assert.equal(subBehavior.className, 'MyNamespace.SubBehavior');
        }));
        testName = 'an inline script can find features from its container document';
        test(testName, () => __awaiter(this, void 0, void 0, function* () {
            const document = yield analyzeDocument('static/script-tags/inline/test-element.html');
            const inlineDocuments = Array.from(document.getFeatures({ kind: 'document', imported: false }))
                .filter((d) => d.isInline);
            chai_1.assert.equal(inlineDocuments.length, 1);
            const inlineJsDocument = inlineDocuments[0];
            // The inline document can find the container's imported
            // features
            const subBehavior = getOnly(inlineJsDocument.getFeatures({ kind: 'behavior', id: 'TestBehavior', imported: true }));
            chai_1.assert.equal(subBehavior.className, 'TestBehavior');
        }));
        testName = 'an inline feature can narrow down its containing document';
        test(testName, () => __awaiter(this, void 0, void 0, function* () {
            const url = 'static/script-tags/inline/test-element.html';
            const result = (yield analyzer.analyze([url]));
            const document = result.getDocument(url);
            if (!document.successful) {
                throw new Error(`Could not get document for url: ${url}`);
            }
            const inlineDocuments = Array
                .from(document.value.getFeatures({ kind: 'document', imported: false }))
                .filter((d) => d.isInline);
            chai_1.assert.equal(inlineDocuments.length, 1);
            const inlineJsDocument = inlineDocuments[0];
            // The inline document can find the container's imported
            // features
            const subBehavior = getOnly(document.value.getFeatures({ kind: 'polymer-element', id: 'test-element', imported: true }));
            const narrowedDocument = result.getDocumentContaining(subBehavior.sourceRange);
            chai_1.assert.equal(narrowedDocument, inlineJsDocument);
        }));
        testName =
            'a feature in the top level document narrows down to the full document';
        test(testName, () => __awaiter(this, void 0, void 0, function* () {
            const url = 'static/script-tags/inline/test-element.html';
            const result = (yield analyzer.analyze([url]));
            const document = result.getDocument(url);
            if (!document.successful) {
                throw new Error(`Could not get document for url: ${url}`);
            }
            // The inline document can find the container's imported
            // features
            const HTMLImport = getOnly(document.value.getFeatures({ kind: 'html-import' }));
            const narrowedDocument = result.getDocumentContaining(HTMLImport.sourceRange);
            chai_1.assert.equal(narrowedDocument, document.value);
        }));
        testName =
            'an external script can find features from its container document';
        test(testName, () => __awaiter(this, void 0, void 0, function* () {
            const document = yield analyzeDocument('static/script-tags/external/test-element.html');
            const htmlScriptTags = Array.from(document.getFeatures({ kind: 'html-script', imported: false }));
            chai_1.assert.equal(htmlScriptTags.length, 1);
            const htmlScriptTag = htmlScriptTags[0];
            const scriptDocument = htmlScriptTag.document;
            // The inline document can find the container's imported
            // features
            const subBehavior = getOnly(scriptDocument.getFeatures({ kind: 'behavior', id: 'TestBehavior', imported: true }));
            chai_1.assert.equal(subBehavior.className, 'TestBehavior');
        }));
        // This test is nearly identical to the previous, but covers a different
        // issue.
        // PolymerElement must find behaviors while resolving, and if inline
        // documents don't add a document feature for their container until after
        // resolution, then the element can't find them and throws.
        testName =
            'an inline document can find behaviors from its container document';
        test(testName, () => __awaiter(this, void 0, void 0, function* () {
            const document = yield analyzeDocument('static/analysis/behaviors/elementdir/element.html');
            const documents = document.getFeatures({ kind: 'document', imported: false });
            chai_1.assert.equal(documents.size, 2);
            const inlineDocuments = Array.from(documents).filter((d) => d instanceof model_1.Document && d.isInline);
            chai_1.assert.equal(inlineDocuments.length, 1);
            // This is the main purpose of the test: get a feature
            // from the inline
            // document that's imported by the container document
            const behaviorJsDocument = inlineDocuments[0];
            const subBehavior = getOnly(behaviorJsDocument.getFeatures({ kind: 'behavior', id: 'MyNamespace.SubBehavior', imported: true }));
            chai_1.assert.equal(subBehavior.className, 'MyNamespace.SubBehavior');
        }));
        test('returns a Document with warnings for malformed files', () => __awaiter(this, void 0, void 0, function* () {
            const document = yield analyzeDocument('static/malformed.html');
            chai_1.assert(document.getWarnings({ imported: false }).length >= 1);
        }));
        test('analyzes transitive dependencies', () => __awaiter(this, void 0, void 0, function* () {
            const root = yield analyzeDocument('static/dependencies/root.html');
            // If we ask for documents we get every document in evaluation order.
            const strictlyReachableDocuments = [
                ['static/dependencies/root.html', 'html', false],
                ['static/dependencies/inline-only.html', 'html', false],
                ['static/dependencies/inline-only.html', 'js', true],
                ['static/dependencies/inline-only.html', 'css', true],
                ['static/dependencies/leaf.html', 'html', false],
                ['static/dependencies/inline-and-imports.html', 'html', false],
                ['static/dependencies/inline-and-imports.html', 'js', true],
                ['static/dependencies/subfolder/in-folder.html', 'html', false],
                ['static/dependencies/subfolder/subfolder-sibling.html', 'html', false],
                ['static/dependencies/inline-and-imports.html', 'css', true],
            ].map(([u, t, i]) => [analyzer.resolveUrl(u), t, i]);
            // If we ask for documents we get every document in
            // evaluation order.
            chai_1.assert.deepEqual(Array
                .from(root.getFeatures({ kind: 'document', imported: true, noLazyImports: true }))
                .map((d) => [d.url, d.parsedDocument.type, d.isInline]), strictlyReachableDocuments);
            chai_1.assert.deepEqual(Array.from(root.getFeatures({ kind: 'document', imported: true }))
                .map((d) => [d.url, d.parsedDocument.type, d.isInline]), strictlyReachableDocuments.concat([[
                    analyzer.resolveUrl('static/dependencies/lazy.html'),
                    'html',
                    false
                ]]));
            // If we ask for imports we get the import statements in evaluation order.
            // Unlike documents, we can have duplicates here because imports exist in
            // distinct places in their containing docs.
            chai_1.assert.deepEqual(Array.from(root.getFeatures({ kind: 'import', imported: true }))
                .map((d) => d.url), [
                'static/dependencies/inline-only.html',
                'static/dependencies/leaf.html',
                'static/dependencies/inline-and-imports.html',
                'static/dependencies/subfolder/in-folder.html',
                'static/dependencies/subfolder/subfolder-sibling.html',
                'static/dependencies/subfolder/in-folder.html',
                'static/dependencies/lazy.html',
            ].map((u) => analyzer.resolveUrl(u)));
            const inlineOnly = getOnly(root.getFeatures({
                kind: 'document',
                id: analyzer.resolveUrl('static/dependencies/inline-only.html'),
                imported: true
            }));
            chai_1.assert.deepEqual(Array
                .from(inlineOnly.getFeatures({ kind: 'document', imported: true }))
                .map((d) => d.parsedDocument.type), ['html', 'js', 'css']);
            const leaf = getOnly(root.getFeatures({
                kind: 'document',
                id: analyzer.resolveUrl('static/dependencies/leaf.html'),
                imported: true
            }));
            chai_1.assert.deepEqual(Array.from(leaf.getFeatures({ kind: 'document', imported: true })), [leaf]);
            const inlineAndImports = getOnly(root.getFeatures({
                kind: 'document',
                id: analyzer.resolveUrl('static/dependencies/inline-and-imports.html'),
                imported: true
            }));
            chai_1.assert.deepEqual(Array
                .from(inlineAndImports.getFeatures({ kind: 'document', imported: true }))
                .map((d) => d.parsedDocument.type), ['html', 'js', 'html', 'html', 'css']);
            const inFolder = getOnly(root.getFeatures({
                kind: 'document',
                id: analyzer.resolveUrl('static/dependencies/subfolder/in-folder.html'),
                imported: true
            }));
            chai_1.assert.deepEqual(Array.from(inFolder.getFeatures({ kind: 'document', imported: true }))
                .map((d) => d.url), [
                'static/dependencies/subfolder/in-folder.html',
                'static/dependencies/subfolder/subfolder-sibling.html'
            ].map((u) => analyzer.resolveUrl(u)));
            // check de-duplication
            chai_1.assert.equal(getOnly(inlineAndImports.getFeatures({
                kind: 'document',
                id: analyzer.resolveUrl('static/dependencies/subfolder/in-folder.html'),
                imported: true
            })), inFolder);
        }));
        test(`warns for files that don't exist`, () => __awaiter(this, void 0, void 0, function* () {
            const url = '/static/does_not_exist.html';
            const analysis = yield analyzer.analyze([url]);
            const result = analysis.getDocument(url);
            if (result.successful) {
                throw new Error('Expected a failed result from getDocument');
            }
            chai_1.assert.isTrue(result.error instanceof model_1.Warning);
        }));
        test('handles documents from multiple calls to analyze()', () => __awaiter(this, void 0, void 0, function* () {
            yield analyzer.analyze(['static/caching/file1.html']);
            yield analyzer.analyze(['static/caching/file2.html']);
        }));
        test('handles mutually recursive documents', () => __awaiter(this, void 0, void 0, function* () {
            const document = yield analyzeDocument('static/circular/mutual-a.html');
            chai_1.assert.deepEqual([...document.getFeatures({ kind: 'document' })].map((f) => f.url), [analyzer.resolveUrl('static/circular/mutual-a.html')]);
            chai_1.assert.deepEqual([...document.getFeatures({ kind: 'import' })].map((f) => f.url), [analyzer.resolveUrl('static/circular/mutual-b.html')]);
            chai_1.assert.deepEqual([...document.getFeatures({ kind: 'document', imported: true })].map((f) => f.url), ['static/circular/mutual-a.html', 'static/circular/mutual-b.html']
                .map((u) => analyzer.resolveUrl(u)));
            chai_1.assert.deepEqual([...document.getFeatures({ kind: 'import', imported: true })].map((f) => f.url), ['static/circular/mutual-b.html', 'static/circular/mutual-a.html']
                .map((u) => analyzer.resolveUrl(u)));
        }));
        testName = 'handles parallel analyses of mutually recursive documents';
        test(testName, () => __awaiter(this, void 0, void 0, function* () {
            // At one point this deadlocked, or threw
            // a _makeDocument error.
            yield Promise.all([
                analyzer.analyze(['static/circular/mutual-a.html']),
                analyzer.analyze(['static/circular/mutual-b.html'])
            ]);
        }));
        test('handles a document importing itself', () => __awaiter(this, void 0, void 0, function* () {
            const document = yield analyzeDocument('static/circular/self-import.html');
            chai_1.assert.deepEqual([...document.getFeatures({ kind: 'document', imported: true })].map((f) => f.url), ['static/circular/self-import.html'].map((u) => analyzer.resolveUrl(u)));
            chai_1.assert.deepEqual([...document.getFeatures({ kind: 'import', imported: true })].map((f) => f.url), [
                'static/circular/self-import.html',
                'static/circular/self-import.html'
            ].map((u) => analyzer.resolveUrl(u)));
        }));
        suite('handles documents with spaces in filename', () => {
            test('given a url with unencoded spaces to analyze', () => __awaiter(this, void 0, void 0, function* () {
                const document = yield analyzeDocument('static/spaces in file.html');
                chai_1.assert.deepEqual([...document.getFeatures({ kind: 'document', imported: true })].map((f) => f.url), [
                    'static/spaces in file.html',
                    'static/dependencies/spaces in import.html'
                ].map((u) => analyzer.resolveUrl(u)));
                chai_1.assert.deepEqual([...document.getFeatures({ kind: 'import', imported: true })].map((f) => f.url), ['static/dependencies/spaces in import.html'].map((u) => analyzer.resolveUrl(u)));
            }));
            test('given a url with encoded spaces to analyze', () => __awaiter(this, void 0, void 0, function* () {
                const document = yield analyzeDocument('static/spaces%20in%20file.html');
                chai_1.assert.deepEqual([...document.getFeatures({ kind: 'document', imported: true })].map((f) => f.url), [
                    'static/spaces in file.html',
                    'static/dependencies/spaces in import.html'
                ].map((u) => analyzer.resolveUrl(u)));
                chai_1.assert.deepEqual([...document.getFeatures({ kind: 'import', imported: true })].map((f) => f.url), ['static/dependencies/spaces in import.html'].map((u) => analyzer.resolveUrl(u)));
            }));
            test('gracefully handles a scanner that throws', () => __awaiter(this, void 0, void 0, function* () {
                const options = {
                    urlResolver: analyzer.urlResolver,
                    urlLoader: inMemoryOverlay
                };
                const scanners = analysis_context_1.AnalysisContext.getDefaultScanners(options);
                class FailingScanner {
                    scan() {
                        return __awaiter(this, void 0, void 0, function* () {
                            throw new Error('Method not implemented.');
                        });
                    }
                }
                options.scanners = scanners;
                scanners.get('html').push(new FailingScanner());
                const localAnalyzer = new analyzer_1.Analyzer(options);
                const url = localAnalyzer.resolveUrl(`foo.html`);
                inMemoryOverlay.urlContentsMap.set(url, `
          <dom-module id="foo-bar"></dom-module>
        `);
                const analysis = yield localAnalyzer.analyze([url]);
                const result = analysis.getDocument(url);
                if (result.successful) {
                    throw new Error(`Got document with crashing scanner.`);
                }
                if (!result.error) {
                    throw new Error(`No warning message for document with crashing scanner`);
                }
                chai_1.assert.deepEqual(result.error.message, 'Error while scanning: Error: Method not implemented.');
            }));
        });
    });
    // TODO: reconsider whether we should test these private methods.
    suite('_parse()', () => {
        test('loads and parses an HTML document', () => __awaiter(this, void 0, void 0, function* () {
            const context = yield getContext(analyzer);
            const docResult = yield context['_parse'](analyzer.resolveUrl(`static/html-parse-target.html`), cancel_token_1.neverCancels);
            if (docResult.successful !== true) {
                throw new Error(`Expected doc result to be successful.`);
            }
            const doc = docResult.value;
            chai_1.assert.instanceOf(doc, html_document_1.ParsedHtmlDocument);
            chai_1.assert.equal(doc.url, analyzer.resolveUrl(`static/html-parse-target.html`));
        }));
        test('loads and parses a JavaScript document', () => __awaiter(this, void 0, void 0, function* () {
            const context = yield getContext(analyzer);
            const docResult = yield context['_parse'](analyzer.resolveUrl(`static/js-elements.js`), cancel_token_1.neverCancels);
            if (docResult.successful !== true) {
                throw new Error(`Expected doc result to be successful.`);
            }
            const doc = docResult.value;
            chai_1.assert.instanceOf(doc, javascript_document_1.JavaScriptDocument);
            chai_1.assert.equal(doc.url, analyzer.resolveUrl(`static/js-elements.js`));
        }));
        test('returns a Promise of a Warning for non-existant files', () => __awaiter(this, void 0, void 0, function* () {
            const context = yield getContext(analyzer);
            const result = yield context['_parse'](analyzer.resolveUrl(`static/not-found`), cancel_token_1.neverCancels);
            if (result.successful === true) {
                throw new Error(`Expected result to be unsuccessful`);
            }
        }));
    });
    suite('_getScannedFeatures()', () => {
        test('default import scanners', () => __awaiter(this, void 0, void 0, function* () {
            const contents = `<html><head>
          <link rel="import" href="polymer.html">
          <script src="foo.js"></script>
          <link rel="stylesheet" href="foo.css"></link>
        </head></html>`;
            const document = new html_parser_1.HtmlParser().parse(contents, test_utils_1.resolvedUrl `test.html`, new package_url_resolver_1.PackageUrlResolver());
            const context = yield getContext(analyzer);
            const features = (yield context['_getScannedFeatures'](document)).features;
            chai_1.assert.deepEqual(features.map((e) => e.type), ['html-import', 'html-script', 'html-style']);
            chai_1.assert.deepEqual(features.map((e) => e.url), //
            ['polymer.html', 'foo.js', 'foo.css']);
        }));
        test('polymer css import scanner', () => __awaiter(this, void 0, void 0, function* () {
            const contents = `<html><head>
          <link rel="import" type="css" href="foo.css">
        </head>
        <body>
          <dom-module>
            <link rel="import" type="css" href="bar.css">
          </dom-module>
        </body></html>`;
            const document = new html_parser_1.HtmlParser().parse(contents, test_utils_1.resolvedUrl `test.html`, new package_url_resolver_1.PackageUrlResolver());
            const context = yield getContext(analyzer);
            const features = (yield context['_getScannedFeatures'](document))
                .features.filter((e) => e instanceof
                model_1.ScannedImport);
            chai_1.assert.equal(features.length, 1);
            chai_1.assert.equal(features[0].type, 'css-import');
            chai_1.assert.equal(features[0].url, 'bar.css');
        }));
        test('HTML inline document scanners', () => __awaiter(this, void 0, void 0, function* () {
            const contents = `<html><head>
          <script>console.log('hi')</script>
          <style>body { color: red; }</style>
        </head></html>`;
            const context = yield getContext(analyzer);
            const document = new html_parser_1.HtmlParser().parse(contents, test_utils_1.resolvedUrl `test.html`, new package_url_resolver_1.PackageUrlResolver());
            const features = ((yield context['_getScannedFeatures'](document)).features);
            chai_1.assert.equal(features.length, 2);
            chai_1.assert.instanceOf(features[0], model_1.ScannedInlineDocument);
            chai_1.assert.instanceOf(features[1], model_1.ScannedInlineDocument);
        }));
        const testName = 'HTML inline documents can be cloned, modified, and stringified';
        test(testName, () => __awaiter(this, void 0, void 0, function* () {
            const contents = stripIndent(`
        <div>
          <script>
            console.log("foo");
          </script>
          <style>
            body {
              color: blue;
            }
          </style>
        </div>
      `).trim();
            const modifiedContents = stripIndent(`
        <div>
          <script>
            console.log("bar");
          </script>
          <style>
            body {
              color: red;
            }
          </style>
        </div>
      `).trim();
            inMemoryOverlay.urlContentsMap.set(analyzer.resolveUrl('test-doc.html'), contents);
            const origDocument = yield analyzeDocument('test-doc.html');
            const document = clone(origDocument);
            // In document, we'll change `foo` to
            // `bar` in the js and `blue` to
            // `red` in the css.
            const jsDocs = document.getFeatures({ kind: 'js-document', imported: true });
            chai_1.assert.equal(1, jsDocs.size);
            const jsDoc = getOnly(jsDocs);
            jsDoc.parsedDocument.visit([{
                    enterCallExpression(node) {
                        node.arguments =
                            [{ type: 'StringLiteral', value: 'bar' }];
                    }
                }]);
            const cssDocs = document.getFeatures({ kind: 'css-document', imported: true });
            chai_1.assert.equal(1, cssDocs.size);
            const cssDoc = getOnly(cssDocs);
            cssDoc.parsedDocument.visit([{
                    visit(node) {
                        if (node.type === 'expression' && node.text === 'blue') {
                            node.text = 'red';
                        }
                    }
                }]);
            // We can stringify the clone and get the modified contents, and
            // stringify the original and still get the original contents.
            chai_1.assert.deepEqual(document.stringify(), modifiedContents);
            chai_1.assert.deepEqual(origDocument.stringify(), contents);
        }));
    });
    suite('documentation extraction', () => {
        test('we get the wrong description for paper-input', () => __awaiter(this, void 0, void 0, function* () {
            const document = yield analyzeDocument('static/paper-input.html');
            const [element] = document.getFeatures({ kind: 'element', id: 'paper-input' });
            chai_1.assert(!/fresh new hell/.test(element.description), `Doesn't pick up on unexpected html comments.`);
            chai_1.assert(element.description.startsWith('Material design: [Text fields]'), `Does get the message right.`);
        }));
    });
    test('analyzes a document with a namespace', () => __awaiter(this, void 0, void 0, function* () {
        const document = yield analyzeDocument('static/namespaces/import-all.html');
        const namespaces = Array.from(document.getFeatures({ kind: 'namespace', imported: true }));
        chai_1.assert.deepEqual(namespaces.map((b) => b.name), [
            'ExplicitlyNamedNamespace',
            'ExplicitlyNamedNamespace.NestedNamespace',
            'ImplicitlyNamedNamespace',
            'ImplicitlyNamedNamespace.NestedNamespace',
            'ParentNamespace.FooNamespace',
            'ParentNamespace.BarNamespace',
            'DynamicNamespace.ComputedProperty',
            'DynamicNamespace.UnanalyzableComputedProperty',
            'DynamicNamespace.Aliased',
            'DynamicNamespace.InferredComputedProperty',
        ]);
    }));
    // TODO(rictic): move duplicate checks into scopes/analysis results.
    //     No where else has reliable knowledge of the clash.
    const testName = 'creates warnings when duplicate namespaces are analyzed';
    test.skip(testName, () => __awaiter(this, void 0, void 0, function* () {
        const document = yield analyzer.analyze(['static/namespaces/import-duplicates.html']);
        const namespaces = Array.from(document.getFeatures({ kind: 'namespace' }));
        chai_1.assert.deepEqual(namespaces.map((b) => b.name), [
            'ExplicitlyNamedNamespace',
            'ExplicitlyNamedNamespace.NestedNamespace',
        ]);
        const warnings = document.getWarnings();
        chai_1.assert.containSubset(warnings, [{
                message: 'Found more than one namespace named ExplicitlyNamedNamespace.',
                severity: model_1.Severity.WARNING,
                code: 'multiple-javascript-namespaces',
            }]);
        chai_1.assert.deepEqual(yield underliner.underline(warnings), [`
var DuplicateNamespace = {};
~~~~~~~~~~~~~~~~~~~~~~~~~~~~`]);
    }));
    test('treats module script tags as normal imports', () => __awaiter(this, void 0, void 0, function* () {
        const analysis = yield analyzer.analyze(['static/script-tags/modules/index.html']);
        const warnings = analysis.getWarnings();
        chai_1.assert.deepEqual(warnings.map((w) => w.code), ['could-not-resolve-reference']);
        chai_1.assert.deepEqual(yield underliner.underline(analysis.getWarnings()), [
            `
class Bar extends Foo {
                  ~~~`,
        ]);
    }));
    suite('analyzePackage', () => {
        test('produces a package with the right documents', () => __awaiter(this, void 0, void 0, function* () {
            const { analyzer } = yield test_utils_1.createForDirectory(path.join(test_utils_1.fixtureDir, 'project'));
            const pckage = yield analyzer.analyzePackage();
            // The root documents of the package are a minimal set of documents whose
            // imports touch every document in the package.
            chai_1.assert.deepEqual(Array.from(pckage['_searchRoots']).map((d) => d.url).sort(), [
                'build/output.html',
                'cyclic-a.html',
                'root.html',
                'subdir/root-in-subdir.html'
            ].map((u) => analyzer.resolveUrl(u)).sort());
            // Note that this does not contain the bower_components/ files
            chai_1.assert.deepEqual(Array.from(pckage.getFeatures({ kind: 'document' }))
                .filter((d) => !d.isInline)
                .map((d) => d.url)
                .sort(), [
                'build/output.html',
                'cyclic-a.html',
                'cyclic-b.html',
                'root.html',
                'leaf.html',
                'subdir/subdir-leaf.html',
                'subdir/root-in-subdir.html'
            ].map((u) => analyzer.resolveUrl(u))
                .sort());
            // And this does contain the one imported file in bower_components/
            chai_1.assert.deepEqual(Array
                .from(pckage.getFeatures({ kind: 'document', externalPackages: true }))
                .filter((d) => !d.isInline)
                .map((d) => d.url)
                .sort(), [
                'build/output.html',
                'cyclic-a.html',
                'cyclic-b.html',
                'root.html',
                'leaf.html',
                'subdir/subdir-leaf.html',
                'subdir/root-in-subdir.html',
                'bower_components/imported.html',
            ].map((u) => analyzer.resolveUrl(u))
                .sort());
            const packageElements = [
                'build-output',
                'root-root',
                'leaf-leaf',
                'cyclic-a',
                'cyclic-b',
                'root-in-subdir',
                'subdir-leaf'
            ];
            // All elements in the package
            chai_1.assert.deepEqual(Array.from(pckage.getFeatures({ kind: 'element' }))
                .map((e) => e.tagName)
                .sort(), packageElements.sort());
            // All elements in the package, as well as all elements in
            // its bower_components directory that are reachable from imports in the
            // package.
            chai_1.assert.deepEqual(Array
                .from(pckage.getFeatures({ kind: 'element', externalPackages: true }))
                .map((e) => e.tagName)
                .sort(), packageElements.concat(['imported-dependency']).sort());
        }));
        test('can get warnings from within and without the package', () => __awaiter(this, void 0, void 0, function* () {
            const { analyzer } = yield test_utils_1.createForDirectory(path.join(test_utils_1.fixtureDir, 'project-with-errors'));
            const pckage = yield analyzer.analyzePackage();
            chai_1.assert.deepEqual(Array.from(pckage['_searchRoots']).map((d) => d.url), ['index.html', 'build/output.html'].map((u) => analyzer.resolveUrl(u)));
            chai_1.assert.deepEqual(pckage.getWarnings().map((w) => w.sourceRange.file), [
                analyzer.resolveUrl('index.html'),
                analyzer.resolveUrl('build/output.html')
            ]);
            chai_1.assert.deepEqual(pckage.getWarnings({ externalPackages: true })
                .map((w) => w.sourceRange.file)
                .sort(), [
                'bower_components/external-with-warnings.html',
                'build/output.html',
                'index.html',
            ].map((u) => analyzer.resolveUrl(u)));
        }));
    });
    suite('_fork', () => {
        test('returns an independent copy of Analyzer', () => __awaiter(this, void 0, void 0, function* () {
            inMemoryOverlay.urlContentsMap.set(analyzer.resolveUrl('a.html'), 'a is shared');
            yield analyzer.analyze(['a.html']);
            // Unmap a.html so that future reads of it will fail, thus testing the
            // cache.
            inMemoryOverlay.urlContentsMap.delete(analyzer.resolveUrl('a.html'));
            const analyzer2 = yield analyzer._fork();
            inMemoryOverlay.urlContentsMap.set(analyzer.resolveUrl('b.html'), 'b for analyzer');
            yield analyzer.analyze(['b.html']);
            inMemoryOverlay.urlContentsMap.set(analyzer.resolveUrl('b.html'), 'b for analyzer2');
            yield analyzer2.analyze(['b.html']);
            inMemoryOverlay.urlContentsMap.delete(analyzer.resolveUrl('b.html'));
            const a1 = yield analyzeDocument('a.html', analyzer);
            const a2 = yield analyzeDocument('a.html', analyzer2);
            const b1 = yield analyzeDocument('b.html', analyzer);
            const b2 = yield analyzeDocument('b.html', analyzer2);
            chai_1.assert.equal(a1.parsedDocument.contents, 'a is shared');
            chai_1.assert.equal(a2.parsedDocument.contents, 'a is shared');
            chai_1.assert.equal(b1.parsedDocument.contents, 'b for analyzer');
            chai_1.assert.equal(b2.parsedDocument.contents, 'b for analyzer2');
        }));
        test('supports overriding of urlLoader', () => __awaiter(this, void 0, void 0, function* () {
            const loader1 = {
                canLoad: () => true,
                load: (u) => __awaiter(this, void 0, void 0, function* () { return `${u} 1`; })
            };
            const loader2 = {
                canLoad: () => true,
                load: (u) => __awaiter(this, void 0, void 0, function* () { return `${u} 2`; })
            };
            const analyzer1 = new analyzer_1.Analyzer({ urlLoader: loader1 });
            const a1 = yield analyzeDocument('a.html', analyzer1);
            const analyzer2 = yield analyzer1._fork({ urlLoader: loader2 });
            const a2 = yield analyzeDocument('a.html', analyzer2);
            const b1 = yield analyzeDocument('b.html', analyzer1);
            const b2 = yield analyzeDocument('b.html', analyzer2);
            chai_1.assert.isTrue(a1.parsedDocument.contents.endsWith('a.html 1'), 'a.html, loader 1');
            chai_1.assert.isTrue(a2.parsedDocument.contents.endsWith('a.html 1'), 'a.html, in cache');
            chai_1.assert.isTrue(b1.parsedDocument.contents.endsWith('b.html 1'), 'b.html, loader 1');
            chai_1.assert.isTrue(b2.parsedDocument.contents.endsWith('b.html 2'), 'b.html, loader 2');
        }));
    });
    suite('race conditions and caching', () => {
        test('maintain caches across multiple edits', () => __awaiter(this, void 0, void 0, function* () {
            // This is a regression test of a scenario where changing a dependency
            // did not properly update warnings of a file. The bug turned out to
            // be in the dependency graph, but this test seems useful enough to
            // keep around.
            // The specific warning is renaming a superclass without updating the
            // class which extends it.
            inMemoryOverlay.urlContentsMap.set(analyzer.resolveUrl('base.js'), `
        class BaseElement extends HTMLElement {}
        customElements.define('base-elem', BaseElement);
      `);
            inMemoryOverlay.urlContentsMap.set(analyzer.resolveUrl('user.html'), `
        <script src="./base.js"></script>
        <script>
          class UserElem extends BaseElement {}
          customElements.define('user-elem', UserElem);
        </script>
      `);
            const b1Doc = yield analyzer.analyze(['base.js']);
            chai_1.assert.deepEqual(b1Doc.getWarnings(), []);
            const u1Doc = yield analyzer.analyze(['user.html']);
            chai_1.assert.deepEqual(u1Doc.getWarnings(), []);
            inMemoryOverlay.urlContentsMap.set(analyzer.resolveUrl('base.js'), `
        class NewSpelling extends HTMLElement {}
        customElements.define('base-elem', NewSpelling);
      `);
            analyzer.filesChanged(['base.js']);
            const b2Doc = yield analyzer.analyze(['base.js']);
            chai_1.assert.deepEqual(b2Doc.getWarnings(), []);
            const u2Doc = yield analyzer.analyze(['user.html']);
            chai_1.assert.notEqual(u1Doc, u2Doc);
            chai_1.assert.equal(u2Doc.getWarnings()[0].message, 'Could not resolve reference to class');
            inMemoryOverlay.urlContentsMap.set(analyzer.resolveUrl('base.js'), `
        class BaseElement extends HTMLElement {}
        customElements.define('base-elem', BaseElement);
      `);
            analyzer.filesChanged(['base.js']);
            const b3Doc = yield analyzer.analyze(['base.js']);
            chai_1.assert.deepEqual(b3Doc.getWarnings(), []);
            const u3Doc = yield analyzer.analyze(['user.html']);
            chai_1.assert.equal(u3Doc.getWarnings().length, 0);
        }));
        class RacyUrlLoader {
            constructor(pathToContentsMap, waitFunction) {
                this.pathToContentsMap = pathToContentsMap;
                this.waitFunction = waitFunction;
            }
            canLoad() {
                return true;
            }
            load(path) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield this.waitFunction();
                    const contents = this.pathToContentsMap.get(path);
                    if (contents != null) {
                        return contents;
                    }
                    throw new Error(`no known contents for ${path}`);
                });
            }
        }
        const editorSimulator = (waitFn) => __awaiter(this, void 0, void 0, function* () {
            // Here we're simulating a lot of noop-changes to base.html,
            // which has
            // two imports, which mutually import a common dep. This
            // stresses the
            // analyzer's caching.
            const urlResolver = new package_url_resolver_1.PackageUrlResolver();
            const entries = [
                [
                    'base.html',
                    `<link rel="import" href="a.html">\n<link rel="import" href="b.html">`
                ],
                ['a.html', `<link rel="import" href="common.html">`],
                ['b.html', `<link rel="import" href="common.html">`],
                ['common.html', `<custom-el></custom-el>`],
            ];
            const contentsMap = new Map();
            const analyzer = new analyzer_1.Analyzer({ urlLoader: new RacyUrlLoader(contentsMap, waitFn), urlResolver });
            for (const [key, value] of entries) {
                contentsMap.set(analyzer.resolveUrl(key), value);
            }
            const promises = [];
            const intermediatePromises = [];
            for (let i = 0; i < 1; i++) {
                yield waitFn();
                for (const entry of contentsMap) {
                    // Randomly edit some files.
                    const path = entry[0];
                    if (Math.random() > 0.5) {
                        analyzer.filesChanged([path]);
                        analyzer.analyze([path]);
                        if (Math.random() > 0.5) {
                            analyzer.filesChanged([path]);
                            const p = analyzer.analyze([path]);
                            const cacheContext = yield getContext(analyzer);
                            intermediatePromises.push((() => __awaiter(this, void 0, void 0, function* () {
                                yield p;
                                const docs = Array.from(cacheContext['_cache'].analyzedDocuments.values());
                                chai_1.assert.isTrue(new Set(docs.map((d) => d.url).sort())
                                    .has(path));
                            }))());
                        }
                    }
                    promises.push(analyzeDocument('base.html', analyzer));
                    yield Promise.all(promises);
                }
                // Analyze the base file
                promises.push(analyzeDocument('base.html', analyzer));
                yield Promise.all(promises);
            }
            // Assert that all edits went through fine.
            yield Promise.all(intermediatePromises);
            // Assert that the every analysis of 'base.html' after each
            // batch of edits
            // was correct, and doesn't have missing or inconsistent
            // results.
            const documents = yield Promise.all(promises);
            for (const document of documents) {
                chai_1.assert.deepEqual(document.url, analyzer.resolveUrl('base.html'));
                const localFeatures = document.getFeatures({ imported: false });
                const kinds = Array.from(localFeatures).map((f) => Array.from(f.kinds));
                const message = `localFeatures: ${JSON.stringify(Array.from(localFeatures).map((f) => ({
                    kinds: Array.from(f.kinds),
                    ids: Array.from(f.identifiers)
                })))}`;
                chai_1.assert.deepEqual(kinds, [
                    ['document', 'html-document'],
                    ['import', 'html-import'],
                    ['import', 'html-import']
                ], message);
                const imports = Array.from(document.getFeatures({ kind: 'import', imported: true }));
                chai_1.assert.sameMembers(imports.map((m) => m.url), ['a.html', 'b.html', 'common.html', 'common.html'].map((u) => analyzer.resolveUrl(u)));
                const docs = Array.from(document.getFeatures({ kind: 'document', imported: true }));
                chai_1.assert.sameMembers(docs.map((d) => d.url), ['a.html', 'b.html', 'base.html', 'common.html'].map((u) => analyzer.resolveUrl(u)));
                const refs = Array.from(document.getFeatures({ kind: 'element-reference', imported: true }));
                chai_1.assert.sameMembers(refs.map((ref) => ref.tagName), ['custom-el']);
            }
        });
        test('editor simulator of imports that import a common dep', () => __awaiter(this, void 0, void 0, function* () {
            const waitTimes = [];
            const randomWait = () => new Promise((resolve) => {
                const waitTime = Math.random() * 30;
                waitTimes.push(waitTime);
                setTimeout(resolve, waitTime);
            });
            try {
                yield editorSimulator(randomWait);
            }
            catch (err) {
                console.error('Wait times to reproduce this failure:');
                console.error(JSON.stringify(waitTimes));
                throw err;
            }
        }));
        /**
         * This is a tool for reproducing and debugging a failure of the
         * editor
         * simulator test above, but only at the exact same commit, as
         * it's
         * sensitive to the order of internal operations of the analyzer.
         * So this
         * code with a defined list of wait times should not be checked
         * in.
         *
         * It's also worth noting that this code will be dependent on many
         * other
         * system factors, so it's only somewhat more reproducible, and
         * may not
         * end
         * up being very useful. If it isn't, we should delete it.
         */
        test.skip('somewhat more reproducable editor simulator', () => __awaiter(this, void 0, void 0, function* () {
            // Replace waitTimes' value with the array of wait times
            // that's logged
            // to the console when the random editor test fails.
            const waitTimes = [];
            const reproducableWait = () => new Promise((resolve) => {
                const waitTime = waitTimes.shift();
                if (waitTime == null) {
                    throw new Error('Was asked for more random waits than the ' +
                        'given array of wait times');
                }
                setTimeout(resolve, waitTime);
            });
            yield editorSimulator(reproducableWait);
        }));
        suite('deterministic tests', () => {
            // Deterministic tests extracted from various failures of the
            // above
            // random
            // test.
            /**
             * This is an asynchronous keyed queue, useful for controlling
             * the
             * order
             * of results in order to make tests more deterministic.
             *
             * It's intended to be used in fake loaders, scanners, etc,
             * where the
             * test
             * provides the intended result on a file by file basis, with
             * control
             * over
             * the order in which the results come in.
             */
            class KeyedQueue {
                constructor() {
                    this._requests = new Map();
                    this._results = new Map();
                }
                request(key) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const results = this._results.get(key) || [];
                        if (results.length > 0) {
                            return results.shift();
                        }
                        const deferred = new utils_1.Deferred();
                        const deferreds = this._requests.get(key) || [];
                        this._requests.set(key, deferreds);
                        deferreds.push(deferred);
                        return deferred.promise;
                    });
                }
                /**
                 * Resolves the next unfulfilled request for the given key
                 * with the
                 * given value.
                 */
                resolve(key, value) {
                    const requests = this._requests.get(key) || [];
                    if (requests.length > 0) {
                        const request = requests.shift();
                        request.resolve(value);
                        return;
                    }
                    const results = this._results.get(key) || [];
                    this._results.set(key, results);
                    results.push(value);
                }
                toString() {
                    return JSON.stringify({
                        openRequests: Array.from(this._requests.keys()),
                        openResponses: Array.from(this._results.keys())
                    });
                }
            }
            class DeterministicUrlLoader {
                constructor() {
                    this.queue = new KeyedQueue();
                }
                canLoad(_url) {
                    return true;
                }
                load(url) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return this.queue.request(url);
                    });
                }
            }
            class NoopUrlLoader {
                canLoad() {
                    return true;
                }
                load() {
                    return __awaiter(this, void 0, void 0, function* () {
                        throw new Error(`Noop Url Loader isn't supposed to be actually called.`);
                    });
                }
            }
            /**
             * This crashed the analyzer as there was a race to
             * _makeDocument,
             * violating its constraint that there not already be a resolved
             * Document
             * for a given path.
             *
             * This test came out of debugging this issue:
             *     https://github.com/Polymer/polymer-analyzer/issues/406
             */
            test('two edits of the same file back to back', () => __awaiter(this, void 0, void 0, function* () {
                const overlay = new overlay_loader_1.InMemoryOverlayUrlLoader(new NoopUrlLoader);
                const analyzer = new analyzer_1.Analyzer({ urlLoader: overlay });
                overlay.urlContentsMap.set(analyzer.resolveUrl('leaf.html'), 'Hello');
                const p1 = analyzer.analyze(['leaf.html']);
                overlay.urlContentsMap.set(analyzer.resolveUrl('leaf.html'), 'World');
                analyzer.filesChanged(['leaf.html']);
                const p2 = analyzer.analyze(['leaf.html']);
                yield Promise.all([p1, p2]);
            }));
            test('handles a shared dependency', () => __awaiter(this, void 0, void 0, function* () {
                const initialPaths = ['static/diamond/a.html', 'static/diamond/root.html'];
                let result = yield analyzer.analyze(initialPaths);
                const resultA = result.getDocument(initialPaths[0]);
                if (!resultA.successful) {
                    throw new Error(`Could not get document a`);
                }
                inMemoryOverlay.urlContentsMap.set(analyzer.resolveUrl('static/diamond/a.html'), resultA.value.parsedDocument.contents);
                yield analyzer.filesChanged(['static/diamond/a.html']);
                result = yield analyzer.analyze(initialPaths);
                const rootResult = result.getDocument(initialPaths[1]);
                if (!rootResult.successful) {
                    throw new Error(`Could not get root document`);
                }
                const localFeatures = rootResult.value.getFeatures({ imported: false });
                const kinds = Array.from(localFeatures).map((f) => Array.from(f.kinds));
                chai_1.assert.deepEqual(kinds, [
                    ['document', 'html-document'],
                    ['import', 'html-import'],
                    ['import', 'html-import']
                ]);
            }));
            test('all files in a cycle wait for the whole cycle', () => __awaiter(this, void 0, void 0, function* () {
                const loader = new DeterministicUrlLoader();
                const analyzer = new analyzer_1.Analyzer({ urlLoader: loader });
                const aAnalyzed = analyzer.analyze(['a.html']);
                const bAnalyzed = analyzer.analyze(['b.html']);
                loader.queue.resolve(analyzer.resolveUrl('a.html'), `<link rel="import" href="b.html">
            <link rel="import" href="c.html">`);
                loader.queue.resolve(analyzer.resolveUrl('b.html'), `<link rel="import" href="a.html">`);
                let cResolved = false;
                // Analysis shouldn't finish without c.html resolving
                const aAnalyzedDone = aAnalyzed.then(() => {
                    chai_1.assert.isTrue(cResolved);
                });
                const bAnalyzedDone = bAnalyzed.then(() => {
                    chai_1.assert.isTrue(cResolved);
                });
                // flush the microtask queue
                yield Promise.resolve();
                cResolved = true;
                loader.queue.resolve(analyzer.resolveUrl('c.html'), '');
                // wait for the callback above to complete
                yield Promise.all([aAnalyzedDone, bAnalyzedDone]);
            }));
            test('analyzes multiple imports of the same behavior', () => __awaiter(this, void 0, void 0, function* () {
                const documentA = yield analyzer.analyze(['static/multiple-behavior-imports/element-a.html']);
                const documentB = yield analyzer.analyze(['static/multiple-behavior-imports/element-b.html']);
                chai_1.assert.deepEqual(documentA.getWarnings({ imported: true }), []);
                chai_1.assert.deepEqual(documentB.getWarnings({ imported: true }), []);
            }));
            const testName = 'analyzes multiple imports of the same behavior simultaneously';
            test(testName, () => __awaiter(this, void 0, void 0, function* () {
                const result = yield Promise.all([
                    analyzer.analyze(['static/multiple-behavior-imports/element-a.html']),
                    analyzer.analyze(['static/multiple-behavior-imports/element-b.html'])
                ]);
                const documentA = result[0];
                const documentB = result[1];
                chai_1.assert.deepEqual(documentA.getWarnings({ imported: true }), []);
                chai_1.assert.deepEqual(documentB.getWarnings({ imported: true }), []);
            }));
        });
    });
});
function getContext(analyzer) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield analyzer['_analysisComplete'];
    });
}
//# sourceMappingURL=analyzer_test.js.map
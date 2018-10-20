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
const fs_url_resolver_1 = require("../../url-loader/fs-url-resolver");
const indirect_url_resolver_1 = require("../../url-loader/indirect-url-resolver");
const overlay_loader_1 = require("../../url-loader/overlay-loader");
const test_utils_1 = require("../test-utils");
suite('IndirectUrlResolver', function () {
    const mapping = new Map([
        ['/foo/foo.html', 'sub/package/foo/foo.html'],
        ['/foo/foo.css', 'sub/package/foo/foo.css'],
        ['/bar/bar.html', 'different/x/y/bar.html'],
        ['/bar/bar.css', 'different/x/y/bar.css'],
    ]);
    const indirectResolver = new indirect_url_resolver_1.IndirectUrlResolver('/root', '/root/sub/package', mapping);
    test('resolve', () => __awaiter(this, void 0, void 0, function* () {
        // Package relative urls are resolved relative to the package
        chai_1.assert.deepEqual(indirectResolver.resolve(test_utils_1.packageRelativeUrl `foo.html`), test_utils_1.rootedFileUrl `root/sub/package/foo.html`);
        // Full URLs are left alone
        chai_1.assert.deepEqual(indirectResolver.resolve(test_utils_1.rootedFileUrl `root/sub/package/bar.html`), test_utils_1.rootedFileUrl `root/sub/package/bar.html`);
        // Relative urls with a base url are resolved relative to url space
        chai_1.assert.deepEqual(indirectResolver.resolve(test_utils_1.rootedFileUrl `root/sub/package/foo/foo.html`, test_utils_1.fileRelativeUrl `../bar/bar.html`), test_utils_1.rootedFileUrl `root/different/x/y/bar.html`);
        // Protocol-relative urls are resolved with default https: protocol
        chai_1.assert.deepEqual(indirectResolver.resolve(test_utils_1.packageRelativeUrl `//foo.com/bar.html`), test_utils_1.resolvedUrl `https://foo.com/bar.html`);
        // Protocol-relative urls are resolved with provided protocol
        chai_1.assert.deepEqual((new indirect_url_resolver_1.IndirectUrlResolver('/root', '/root/sub/package', mapping, 'potato'))
            .resolve(test_utils_1.packageRelativeUrl `//foo.com/bar.html`), test_utils_1.resolvedUrl `potato://foo.com/bar.html`);
    }));
    test('relative', () => __awaiter(this, void 0, void 0, function* () {
        // From a mapped url to a mapped known url.
        chai_1.assert.deepEqual(indirectResolver.relative(test_utils_1.rootedFileUrl `root/different/x/y/bar.html`, test_utils_1.rootedFileUrl `root/sub/package/foo/foo.css`), `../foo/foo.css`);
        // From a mapped url to an unmapped url.
        chai_1.assert.deepEqual(indirectResolver.relative(test_utils_1.rootedFileUrl `root/different/x/y/bar.html`, test_utils_1.rootedFileUrl `root/different/x/y/bar.js`), `bar.js`);
        // From an unmapped url to an unmapped url.
        chai_1.assert.deepEqual(indirectResolver.relative(test_utils_1.rootedFileUrl `root/another/baz.html`, test_utils_1.rootedFileUrl `root/more/bonk.html`), `../more/bonk.html`);
    }));
    suite('integration', () => {
        const testName = `handles resolving urls with a full mapping from deep ` +
            `subdirs into a flatter runtime url space`;
        test(testName, () => __awaiter(this, void 0, void 0, function* () {
            const fsUrlResolver = new fs_url_resolver_1.FsUrlResolver('/root');
            const overlayLoader = new overlay_loader_1.InMemoryOverlayUrlLoader();
            overlayLoader.urlContentsMap.set(fsUrlResolver.resolve(test_utils_1.packageRelativeUrl `sub/package/foo/foo.html`), `
        <link rel="import" href="../bar/bar.html">
        <link rel="stylesheet" href="foo.css">
      `);
            overlayLoader.urlContentsMap.set(fsUrlResolver.resolve(test_utils_1.packageRelativeUrl `sub/package/foo/foo.css`), ``);
            overlayLoader.urlContentsMap.set(fsUrlResolver.resolve(test_utils_1.packageRelativeUrl `different/x/y/bar.html`), `
        <link rel="stylesheet" href="./bar.css">
      `);
            overlayLoader.urlContentsMap.set(fsUrlResolver.resolve(test_utils_1.packageRelativeUrl `different/x/y/bar.css`), ``);
            const analyzer = new analyzer_1.Analyzer({ urlLoader: overlayLoader, urlResolver: indirectResolver });
            const analysis = yield analyzer.analyze(['foo/foo.html']);
            chai_1.assert.deepEqual(analysis.getWarnings().map((w) => w.toString({ verbosity: 'code-only' })), []);
            const documents = analysis.getFeatures({ kind: 'document' });
            chai_1.assert.deepEqual([...documents].map((d) => d.url), [
                test_utils_1.rootedFileUrl `root/sub/package/foo/foo.html`,
                test_utils_1.rootedFileUrl `root/different/x/y/bar.html`,
                test_utils_1.rootedFileUrl `root/different/x/y/bar.css`,
                test_utils_1.rootedFileUrl `root/sub/package/foo/foo.css`
            ]);
            const imports = analysis.getFeatures({ kind: 'import' });
            chai_1.assert.deepEqual([...imports].map((i) => i.originalUrl), ['../bar/bar.html', './bar.css', 'foo.css']);
            chai_1.assert.deepEqual([...imports].map((i) => i.url), [
                test_utils_1.rootedFileUrl `root/different/x/y/bar.html`,
                test_utils_1.rootedFileUrl `root/different/x/y/bar.css`,
                test_utils_1.rootedFileUrl `root/sub/package/foo/foo.css`
            ]);
        }));
    });
});
//# sourceMappingURL=indirect-url-resolver_test.js.map
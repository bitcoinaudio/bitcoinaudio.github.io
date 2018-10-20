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
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const path = require("path");
const vscode_uri_1 = require("vscode-uri");
const fs_url_loader_1 = require("../../url-loader/fs-url-loader");
const test_utils_1 = require("../test-utils");
suite('FsUrlLoader', function () {
    suite('canLoad', () => {
        test('canLoad is true for a local file URL inside root', () => {
            chai_1.assert.isTrue(new fs_url_loader_1.FsUrlLoader('/a/').canLoad(vscode_uri_1.default.file(path.resolve('/a/foo.html')).toString()));
        });
        test('canLoad is false for a local file URL outside root', () => {
            chai_1.assert.isFalse(new fs_url_loader_1.FsUrlLoader('/a/').canLoad(vscode_uri_1.default.file(path.resolve('/b/foo.html')).toString()));
        });
        test('canLoad is false for a file url with a host', () => {
            chai_1.assert.isFalse(new fs_url_loader_1.FsUrlLoader('/foo/').canLoad(test_utils_1.resolvedUrl `file://foo/foo/foo.html`));
        });
        test('canLoad is false for a relative path URL', () => {
            chai_1.assert.isFalse(new fs_url_loader_1.FsUrlLoader().canLoad(test_utils_1.resolvedUrl `../../foo/foo.html`));
        });
        test('canLoad is false for an http URL', () => {
            chai_1.assert.isFalse(new fs_url_loader_1.FsUrlLoader().canLoad(test_utils_1.resolvedUrl `http://abc.xyz/foo.html`));
        });
    });
});
//# sourceMappingURL=fs-url-loader_test.js.map
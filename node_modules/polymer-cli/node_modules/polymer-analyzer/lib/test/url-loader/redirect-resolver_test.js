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
const redirect_resolver_1 = require("../../url-loader/redirect-resolver");
const test_utils_1 = require("../test-utils");
suite('RedirectResolver', function () {
    suite('resolve', () => {
        test('if prefix matches, url is rewritten', () => {
            let resolver = new redirect_resolver_1.RedirectResolver(test_utils_1.resolvedUrl ``, 'proto://site/', 'some/path/');
            chai_1.assert.equal(resolver.resolve(test_utils_1.packageRelativeUrl `proto://site/something.html`), test_utils_1.resolvedUrl `some/path/something.html`);
            resolver = new redirect_resolver_1.RedirectResolver(test_utils_1.resolvedUrl ``, '/site/', 'some/path/');
            chai_1.assert.equal(resolver.resolve(test_utils_1.packageRelativeUrl `/site/something.html`), test_utils_1.resolvedUrl `some/path/something.html`);
        });
        test(`if prefix doesn't match, returns undefined`, () => {
            const resolver = new redirect_resolver_1.RedirectResolver(test_utils_1.resolvedUrl ``, 'proto://site/', 'some/path/');
            chai_1.assert.equal(resolver.resolve(test_utils_1.packageRelativeUrl `protoz://site/something.html`), undefined);
        });
        test(`if url matches redirection target, returns url`, () => {
            const resolver = new redirect_resolver_1.RedirectResolver(test_utils_1.resolvedUrl `/a/`, 'proto://site/', '/b/');
            const resolved = resolver.resolve(test_utils_1.packageRelativeUrl `proto://site/page.html`);
            chai_1.assert.equal(resolved, test_utils_1.resolvedUrl `/b/page.html`);
            chai_1.assert.equal(resolver.resolve(resolved), resolved);
        });
    });
    suite('relative', () => {
        test('if `to` is not in redirect-to, return as-is', () => {
            const resolver = new redirect_resolver_1.RedirectResolver(test_utils_1.resolvedUrl `file:///src/a/`, test_utils_1.resolvedUrl `proto://site/`, test_utils_1.resolvedUrl `file:///src/b/`);
            const relative = resolver.relative(test_utils_1.resolvedUrl `file:///src/a/page.html`);
            chai_1.assert.equal(relative, test_utils_1.packageRelativeUrl `page.html`);
            chai_1.assert.equal(resolver.relative(test_utils_1.resolvedUrl `file:///src/a/page.html`), test_utils_1.packageRelativeUrl `page.html`);
        });
        test('if `from` is not in redirect-to, un-redirect the `to`', () => {
            const resolver = new redirect_resolver_1.RedirectResolver(test_utils_1.resolvedUrl `file:///src/a/`, test_utils_1.resolvedUrl `proto://site/`, test_utils_1.resolvedUrl `file:///src/b/`);
            const relative = resolver.relative(test_utils_1.resolvedUrl `file:///src/b/page.html`);
            chai_1.assert.equal(relative, test_utils_1.packageRelativeUrl `proto://site/page.html`);
            chai_1.assert.equal(resolver.relative(test_utils_1.resolvedUrl `proto://site/page.html`), test_utils_1.packageRelativeUrl `proto://site/page.html`);
        });
    });
});
//# sourceMappingURL=redirect-resolver_test.js.map
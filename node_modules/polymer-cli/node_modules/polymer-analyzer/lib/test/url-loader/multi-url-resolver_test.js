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
const multi_url_resolver_1 = require("../../url-loader/multi-url-resolver");
const url_resolver_1 = require("../../url-loader/url-resolver");
const test_utils_1 = require("../test-utils");
class MockResolver extends url_resolver_1.UrlResolver {
    constructor(_resolution) {
        super();
        this._resolution = _resolution;
        this.packageUrl = test_utils_1.resolvedUrl ``;
        this.resolveCount = 0;
        this.relativeCount = 0;
    }
    resolve(firstUrl, secondUrl) {
        const url = secondUrl || firstUrl;
        ++this.resolveCount;
        if (this._resolution && url === this._resolution) {
            return this.brandAsResolved(this._resolution);
        }
        return undefined;
    }
    relative(fromOrTo, maybeTo, _kind) {
        const [from, to] = (maybeTo !== undefined) ? [fromOrTo, maybeTo] :
            [this.packageUrl, fromOrTo];
        ++this.relativeCount;
        const result = this.simpleUrlRelative(from, to);
        if (maybeTo === undefined) {
            return this.brandAsPackageRelative(result);
        }
        return result;
    }
}
const mockResolverArray = (resolutions) => {
    return resolutions.map((resolution) => {
        return new MockResolver(resolution);
    });
};
suite('MultiUrlResolver', function () {
    suite('resolve', () => {
        test('only the first resolution is returned', () => {
            const resolvers = mockResolverArray(['file1.html', 'file2.html', 'file3.html']);
            const resolver = new multi_url_resolver_1.MultiUrlResolver(resolvers);
            chai_1.assert.equal(resolver.resolve(test_utils_1.packageRelativeUrl `file2.html`), test_utils_1.resolvedUrl `file2.html`);
            // Verify only the first two resolvers are called
            chai_1.assert.equal(resolvers[0].resolveCount, 1);
            chai_1.assert.equal(resolvers[1].resolveCount, 1);
            chai_1.assert.equal(resolvers[2].resolveCount, 0);
        });
        test('keeps trying until it finds a good resolver', () => {
            const resolvers = mockResolverArray([null, null, 'test.html']);
            const resolver = new multi_url_resolver_1.MultiUrlResolver(resolvers);
            chai_1.assert.equal(resolver.resolve(test_utils_1.resolvedUrl ``, test_utils_1.fileRelativeUrl `test.html`), test_utils_1.resolvedUrl `test.html`);
            // Verify all resolvers are called
            chai_1.assert.equal(resolvers[0].resolveCount, 1);
            chai_1.assert.equal(resolvers[1].resolveCount, 1);
            chai_1.assert.equal(resolvers[2].resolveCount, 1);
        });
        test(`returns undefined if no resolver works`, () => {
            const resolvers = mockResolverArray([null, null, null]);
            const resolver = new multi_url_resolver_1.MultiUrlResolver(resolvers);
            chai_1.assert.equal(resolver.resolve(test_utils_1.resolvedUrl ``, test_utils_1.fileRelativeUrl `test.html`), undefined);
            // Verify all resolvers are called.
            chai_1.assert.equal(resolvers[0].resolveCount, 1);
            chai_1.assert.equal(resolvers[1].resolveCount, 1);
            chai_1.assert.equal(resolvers[2].resolveCount, 1);
        });
    });
    suite('relative', () => {
        test('delegate the relative function based on resolve', () => {
            const resolvers = mockResolverArray(['file1.html', 'file2.html', 'file3.html']);
            const resolver = new multi_url_resolver_1.MultiUrlResolver(resolvers);
            chai_1.assert.equal(resolver.relative(test_utils_1.resolvedUrl `file2.html`), test_utils_1.packageRelativeUrl `file2.html`);
            // Verify the first two resolvers are called.
            chai_1.assert.equal(resolvers[0].resolveCount, 1);
            chai_1.assert.equal(resolvers[1].resolveCount, 1);
            chai_1.assert.equal(resolvers[2].resolveCount, 0);
            // Verify only the second resolver's `relative` is invoked.
            chai_1.assert.equal(resolvers[0].relativeCount, 0);
            chai_1.assert.equal(resolvers[1].relativeCount, 1);
            chai_1.assert.equal(resolvers[2].relativeCount, 0);
        });
    });
});
//# sourceMappingURL=multi-url-resolver_test.js.map
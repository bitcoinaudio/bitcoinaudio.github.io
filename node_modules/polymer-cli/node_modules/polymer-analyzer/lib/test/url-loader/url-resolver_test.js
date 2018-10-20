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
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const url_resolver_1 = require("../../url-loader/url-resolver");
class SimplestUrlResolver extends url_resolver_1.UrlResolver {
    resolve(firstUrl, secondUrl) {
        const [baseUrl = '/test/', url] = this.getBaseAndUnresolved(firstUrl, secondUrl);
        return this.simpleUrlResolve(baseUrl, url, 'https');
    }
    relative(fromOrTo, maybeTo, _kind) {
        let from, to;
        if (maybeTo !== undefined) {
            from = fromOrTo;
            to = maybeTo;
        }
        else {
            throw new Error('simplest url resolver.relative must be called with two arguments');
        }
        const result = this.simpleUrlRelative(from, to);
        if (maybeTo === undefined) {
            return this.brandAsPackageRelative(result);
        }
        return result;
    }
}
suite('UrlResolver', () => {
    suite('resolve', () => {
        const resolver = new SimplestUrlResolver();
        function resolve(baseUrl, unresolvedUrl) {
            return resolver.resolve(baseUrl, unresolvedUrl);
        }
        test('can resolve a url when relative url contains no pathname', () => {
            chai_1.assert.equal(resolve('/foo.html?fiz#buz', ''), '/foo.html?fiz');
            chai_1.assert.equal(resolve('/foo.html', '#fiz'), '/foo.html#fiz');
            chai_1.assert.equal(resolve('/foo.html#buz', '#fiz'), '/foo.html#fiz');
            chai_1.assert.equal(resolve('/foo.html', '?fiz'), '/foo.html?fiz');
            chai_1.assert.equal(resolve('/foo.html?buz', '?fiz'), '/foo.html?fiz');
            chai_1.assert.equal(resolve('/foo.html?bar#buz', '?fiz'), `/foo.html?fiz`);
        });
    });
    suite('relative', () => {
        const resolver = new SimplestUrlResolver();
        function relative(from, to) {
            const fromResolved = resolver.resolve(from);
            const toResolved = resolver.resolve(to);
            return resolver.relative(fromResolved, toResolved);
        }
        test('can get relative urls between urls', () => {
            chai_1.assert.equal(relative('/', '/'), '');
            chai_1.assert.equal(relative('/', '/bar/'), 'bar/');
            chai_1.assert.equal(relative('/foo/', '/foo/'), '');
            chai_1.assert.equal(relative('/foo/', '/bar/'), '../bar/');
            chai_1.assert.equal(relative('foo/', '/'), '../../'); // 'foo/' ~> '/test/foo/'
            chai_1.assert.equal(relative('foo.html', 'foo.html'), '');
            chai_1.assert.equal(relative('foo/', 'bar/'), '../bar/');
            chai_1.assert.equal(relative('foo.html', 'bar.html'), 'bar.html');
            chai_1.assert.equal(relative('sub/foo.html', 'bar.html'), '../bar.html');
            chai_1.assert.equal(relative('sub1/foo.html', 'sub2/bar.html'), '../sub2/bar.html');
            chai_1.assert.equal(relative('foo.html', 'sub/bar.html'), 'sub/bar.html');
            chai_1.assert.equal(relative('./foo.html', './sub/bar.html'), 'sub/bar.html');
            chai_1.assert.equal(relative('./foo.html', './bar.html'), 'bar.html');
            chai_1.assert.equal(relative('./foo/', 'sub/bar.html'), '../sub/bar.html');
            chai_1.assert.equal(relative('./foo/bonk.html', 'sub/bar/'), '../sub/bar/');
        });
        test('preserves target url querystrings and fragments', () => {
            chai_1.assert.equal(relative('foo.html', 'foo.html?fiz=buz'), '?fiz=buz');
            chai_1.assert.equal(relative('foo.html', 'bar.html?fiz=buz'), 'bar.html?fiz=buz');
            chai_1.assert.equal(relative('foo.html?fiz=buz', 'foo.html'), '');
            chai_1.assert.equal(relative('foo.html', 'foo.html#fiz'), '#fiz');
        });
        test('will keep absolute urls absolute', () => {
            chai_1.assert.equal(relative('foo/', 'http://example.com'), 'http://example.com/');
            chai_1.assert.equal(relative('foo/', 'https://example.com'), 'https://example.com/');
            chai_1.assert.equal(relative('foo/', 'file://host/path/to/file'), 'file://host/path/to/file');
        });
        test('sibling urls work properly', () => {
            chai_1.assert.equal(relative('foo.html', '../bar/bar.html'), '../bar/bar.html');
            chai_1.assert.equal(relative('foo/foo.html', '../bar/bar.html'), '../../bar/bar.html');
            chai_1.assert.equal(relative('../foo/foo.html', '../bar/bar.html'), '../bar/bar.html');
        });
    });
});
//# sourceMappingURL=url-resolver_test.js.map
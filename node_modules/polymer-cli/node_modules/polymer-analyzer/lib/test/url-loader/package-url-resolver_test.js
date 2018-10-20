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
const package_url_resolver_1 = require("../../url-loader/package-url-resolver");
const test_utils_1 = require("../test-utils");
suite('PackageUrlResolver', function () {
    suite('resolve', () => {
        let resolver;
        setup(() => {
            resolver = new package_url_resolver_1.PackageUrlResolver({ packageDir: `/1/2` });
        });
        test(`resolves file:// urls to themselves`, () => {
            const r = new package_url_resolver_1.PackageUrlResolver();
            chai_1.assert.equal(r.resolve(test_utils_1.resolvedUrl `https://example.com/bar`, test_utils_1.fileRelativeUrl `file:///foo/bar/baz`), test_utils_1.resolvedUrl `file:///foo/bar/baz`);
        });
        // test for url with host but not protocol
        test('resolves an in-package URL', () => {
            chai_1.assert.equal(resolver.resolve(test_utils_1.packageRelativeUrl `foo.html`), test_utils_1.rootedFileUrl `1/2/foo.html`);
            chai_1.assert.equal(resolver.resolve(test_utils_1.packageRelativeUrl `/foo.html`), test_utils_1.rootedFileUrl `1/2/foo.html`);
            chai_1.assert.equal(resolver.resolve(test_utils_1.packageRelativeUrl `./foo.html`), test_utils_1.rootedFileUrl `1/2/foo.html`);
        });
        test(`resolves sibling URLs to the component dir`, () => {
            chai_1.assert.equal(resolver.resolve(test_utils_1.packageRelativeUrl `../foo/foo.html`), test_utils_1.rootedFileUrl `1/2/bower_components/foo/foo.html`);
            const configured = new package_url_resolver_1.PackageUrlResolver({ componentDir: 'components', packageDir: '/1/2/' });
            chai_1.assert.equal(configured.resolve(
            // tslint:disable-next-line: no-any
            (test_utils_1.rootedFileUrl `1/bar/bar.html`)), test_utils_1.rootedFileUrl `1/2/components/bar/bar.html`);
        });
        test('resolves sibling with matching name prefix to component dir', () => {
            // Regression test for bug in path containment check.
            const configured = new package_url_resolver_1.PackageUrlResolver({ packageDir: '/repos/iron-icons' });
            chai_1.assert.equal(configured.resolve(
            // tslint:disable-next-line: no-any
            test_utils_1.rootedFileUrl `repos/iron-iconset-svg/foo.html`), test_utils_1.rootedFileUrl `repos/iron-icons/bower_components/iron-iconset-svg/foo.html`);
        });
        test('resolves cousin URLs as normal', () => {
            chai_1.assert.equal(resolver.resolve(test_utils_1.packageRelativeUrl `../../foo/foo.html`), test_utils_1.rootedFileUrl `foo/foo.html`);
        });
        test('passes URLs with unknown hostnames through untouched', () => {
            const r = new package_url_resolver_1.PackageUrlResolver();
            chai_1.assert.equal(r.resolve(test_utils_1.packageRelativeUrl `http://abc.xyz/foo.html`), test_utils_1.resolvedUrl `http://abc.xyz/foo.html`);
            chai_1.assert.equal(r.resolve(test_utils_1.resolvedUrl `https://baz.com/qux.js`, test_utils_1.fileRelativeUrl `https://foo.com/bar.html`), test_utils_1.resolvedUrl `https://foo.com/bar.html`);
        });
        test('resolves protocol-relative URLs using default protocol', () => {
            const r = new package_url_resolver_1.PackageUrlResolver({ packageDir: `/1/2`, host: 'foo.com' });
            chai_1.assert.equal(r.resolve(test_utils_1.packageRelativeUrl `//abc.xyz/foo.html`), test_utils_1.resolvedUrl `https://abc.xyz/foo.html`);
            chai_1.assert.equal(r.resolve(test_utils_1.rootedFileUrl `1/2/bar.html`, test_utils_1.fileRelativeUrl `//abc.xyz/foo.html`), test_utils_1.resolvedUrl `https://abc.xyz/foo.html`);
            chai_1.assert.equal(r.resolve(test_utils_1.rootedFileUrl `1/2/bar.html`, test_utils_1.fileRelativeUrl `//foo.com/baz.html`), test_utils_1.rootedFileUrl `1/2/baz.html`);
        });
        test('resolves protocol-relative URLs using provided protocol', () => {
            const r = new package_url_resolver_1.PackageUrlResolver({ protocol: 'potato', packageDir: `/1/2`, host: 'foo.com' });
            chai_1.assert.equal(r.resolve(test_utils_1.packageRelativeUrl `//foo.com/bar.html`), test_utils_1.rootedFileUrl `1/2/bar.html`, 'host matches resolver, resolve to file URL');
            chai_1.assert.equal(r.resolve(test_utils_1.packageRelativeUrl `//abc.xyz/foo.html`), test_utils_1.resolvedUrl `potato://abc.xyz/foo.html`, 'host does not match resolver, resolve with protocol option');
            chai_1.assert.equal(r.resolve(test_utils_1.resolvedUrl `spaghetti://abc.xyz/foo.html`, test_utils_1.fileRelativeUrl `//foo.com/bar.html`), test_utils_1.rootedFileUrl `1/2/bar.html`, 'host matches resolver, resolve as file URL');
            chai_1.assert.equal(r.resolve(test_utils_1.resolvedUrl `spaghetti://abc.xyz/foo.html`, test_utils_1.fileRelativeUrl `//abc.xyz/foo.html`), test_utils_1.resolvedUrl `spaghetti://abc.xyz/foo.html`, 'host does not match resolver, inherit non-file protocol from base URL');
            chai_1.assert.equal(r.resolve(test_utils_1.rootedFileUrl `1/2/bar.html`, test_utils_1.fileRelativeUrl `//abc.xyz/foo.html`), test_utils_1.resolvedUrl `potato://abc.xyz/foo.html`, 'host does not match resolver, do not inherit file protocol from base URL');
            chai_1.assert.equal(r.resolve(test_utils_1.resolvedUrl `spaghetti://example.com/`, test_utils_1.fileRelativeUrl `//abc.xyz/foo.html`), test_utils_1.resolvedUrl `spaghetti://abc.xyz/foo.html`, 'host does not match resolver, inherit non-file protocol from base URL');
        });
        test(`resolves a URL with the right hostname`, () => {
            const resolver = new package_url_resolver_1.PackageUrlResolver({ componentDir: `components`, host: `abc.xyz`, packageDir: `/1/2` });
            chai_1.assert.equal(resolver.resolve(test_utils_1.packageRelativeUrl `http://abc.xyz/foo.html`), test_utils_1.rootedFileUrl `1/2/foo.html`);
            chai_1.assert.equal(resolver.resolve(test_utils_1.packageRelativeUrl `http://abc.xyz/./foo.html`), test_utils_1.rootedFileUrl `1/2/foo.html`);
            chai_1.assert.equal(resolver.resolve(test_utils_1.packageRelativeUrl `http://abc.xyz/../foo.html`), test_utils_1.rootedFileUrl `1/2/foo.html`);
            chai_1.assert.equal(resolver.resolve(test_utils_1.packageRelativeUrl `http://abc.xyz/foo/../foo.html`), test_utils_1.rootedFileUrl `1/2/foo.html`);
            chai_1.assert.equal(resolver.resolve(test_utils_1.packageRelativeUrl `foo.html`), test_utils_1.rootedFileUrl `1/2/foo.html`);
            chai_1.assert.equal(resolver.resolve(test_utils_1.packageRelativeUrl `./foo.html`), test_utils_1.rootedFileUrl `1/2/foo.html`);
            chai_1.assert.equal(resolver.resolve(test_utils_1.packageRelativeUrl `foo/../foo.html`), test_utils_1.rootedFileUrl `1/2/foo.html`);
            chai_1.assert.equal(resolver.resolve(test_utils_1.packageRelativeUrl `/foo.html`), test_utils_1.rootedFileUrl `1/2/foo.html`);
            chai_1.assert.equal(resolver.resolve(test_utils_1.packageRelativeUrl `/./foo.html`), test_utils_1.rootedFileUrl `1/2/foo.html`);
            chai_1.assert.equal(resolver.resolve(test_utils_1.packageRelativeUrl `/../foo/foo.html`), test_utils_1.rootedFileUrl `1/2/foo/foo.html`);
            chai_1.assert.equal(resolver.resolve(test_utils_1.packageRelativeUrl `/foo/../foo.html`), test_utils_1.rootedFileUrl `1/2/foo.html`);
        });
        test(`resolves a URL with spaces`, () => {
            chai_1.assert.equal(resolver.resolve(test_utils_1.packageRelativeUrl `spaced name.html`), test_utils_1.rootedFileUrl `1/2/spaced%20name.html`);
        });
        test('resolves an undecodable URL to undefined', () => {
            chai_1.assert.equal(resolver.resolve(test_utils_1.packageRelativeUrl `%><><%=`), undefined);
        });
        test('resolves a relative URL containing querystring and fragment', () => {
            chai_1.assert.equal(resolver.resolve(test_utils_1.rootedFileUrl `1/2/foo.html?bar`, test_utils_1.fileRelativeUrl `foo.html#bat`), test_utils_1.rootedFileUrl `1/2/foo.html#bat`);
            chai_1.assert.equal(resolver.resolve(test_utils_1.packageRelativeUrl `foo.html?baz#bat`), test_utils_1.rootedFileUrl `1/2/foo.html?baz#bat`);
            chai_1.assert.equal(resolver.resolve(test_utils_1.rootedFileUrl `1/2/bar/baz/`, test_utils_1.fileRelativeUrl `foo.html?baz#bat`), test_utils_1.rootedFileUrl `1/2/bar/baz/foo.html?baz#bat`);
        });
        test('resolves a URL with no pathname', () => {
            chai_1.assert.equal(resolver.resolve(test_utils_1.rootedFileUrl `1/2/foo.html`, test_utils_1.fileRelativeUrl ``), test_utils_1.rootedFileUrl `1/2/foo.html`);
            chai_1.assert.equal(resolver.resolve(test_utils_1.rootedFileUrl `1/2/foo.html?baz#bat`, test_utils_1.fileRelativeUrl ``), test_utils_1.rootedFileUrl `1/2/foo.html?baz`);
            chai_1.assert.equal(resolver.resolve(test_utils_1.rootedFileUrl `1/2/foo.html`, test_utils_1.fileRelativeUrl `#buz`), test_utils_1.rootedFileUrl `1/2/foo.html#buz`);
            chai_1.assert.equal(resolver.resolve(test_utils_1.rootedFileUrl `1/2/foo.html?baz#bat`, test_utils_1.fileRelativeUrl `#buz`), test_utils_1.rootedFileUrl `1/2/foo.html?baz#buz`);
            chai_1.assert.equal(resolver.resolve(test_utils_1.rootedFileUrl `1/2/foo.html?bar#buz`, test_utils_1.fileRelativeUrl `?fiz`), test_utils_1.rootedFileUrl `1/2/foo.html?fiz`);
            chai_1.assert.equal(resolver.resolve(test_utils_1.rootedFileUrl `1/2/foo.html`, test_utils_1.fileRelativeUrl `?fiz#buz`), test_utils_1.rootedFileUrl `1/2/foo.html?fiz#buz`);
            chai_1.assert.equal(resolver.resolve(test_utils_1.rootedFileUrl `1/2/foo.html?bar`, test_utils_1.fileRelativeUrl `?fiz#buz`), test_utils_1.rootedFileUrl `1/2/foo.html?fiz#buz`);
        });
    });
    suite('relative', () => {
        // We want process.cwd so that on Windows we test Windows paths and on
        // posix we test posix paths.
        const resolver = new package_url_resolver_1.PackageUrlResolver({ packageDir: process.cwd() });
        function relative(from, to) {
            const fromResolved = resolver.resolve(from);
            const toResolved = resolver.resolve(to);
            const result = resolver.relative(fromResolved, toResolved);
            return result;
        }
        test('can get relative urls between urls', () => {
            chai_1.assert.equal(relative('/', '/'), '');
            chai_1.assert.equal(relative('/', '/bar/'), 'bar/');
            chai_1.assert.equal(relative('/foo/', '/foo/'), '');
            chai_1.assert.equal(relative('/foo/', '/bar/'), '../bar/');
            chai_1.assert.equal(relative('foo/', '/'), '../');
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
        test('will keep absolute urls absolute', () => {
            chai_1.assert.equal(relative('foo/', 'http://example.com'), 'http://example.com/');
            chai_1.assert.equal(relative('foo/', 'https://example.com'), 'https://example.com/');
            chai_1.assert.equal(relative('foo/', 'file://host/path/to/file'), 'file://host/path/to/file');
        });
        test('sibling urls work properly', () => {
            // Our basedir, into our dependencies.
            chai_1.assert.equal(relative('foo.html', '../bar/bar.html'), '../bar/bar.html');
            // Our subdir, into dependencies
            chai_1.assert.equal(relative('foo/foo.html', '../bar/bar.html'), '../../bar/bar.html');
            // From one dependency to another
            chai_1.assert.equal(relative('../foo/foo.html', '../bar/bar.html'), '../bar/bar.html');
        });
    });
});
//# sourceMappingURL=package-url-resolver_test.js.map
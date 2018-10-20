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
const fs = require("fs");
const path = require("path");
const html_parser_1 = require("../../html/html-parser");
const package_url_resolver_1 = require("../../url-loader/package-url-resolver");
const test_utils_1 = require("../test-utils");
suite('HtmlParser', () => {
    suite('parse()', () => {
        let parser;
        setup(() => {
            parser = new html_parser_1.HtmlParser();
        });
        suite('on a well-formed document', () => {
            const file = fs.readFileSync(path.resolve(test_utils_1.fixtureDir, 'html-parse-target.html'), 'utf8');
            test('parses a well-formed document', () => {
                const document = parser.parse(file, test_utils_1.resolvedUrl `/static/html-parse-target.html`, new package_url_resolver_1.PackageUrlResolver());
                chai_1.assert.equal(document.url, '/static/html-parse-target.html');
            });
            test('can stringify back a well-formed document', () => {
                const document = parser.parse(file, test_utils_1.resolvedUrl `/static/html-parse-target.html`, new package_url_resolver_1.PackageUrlResolver());
                chai_1.assert.deepEqual(document.stringify(), file);
            });
        });
        test('can properly determine the base url of a document', () => __awaiter(this, void 0, void 0, function* () {
            const { analyzer } = yield test_utils_1.createForDirectory(path.resolve(test_utils_1.fixtureDir, '../'));
            const resolvedPath = analyzer.resolveUrl(`static/base-href/doc-with-base.html`);
            const file = yield analyzer.load(resolvedPath);
            const document = parser.parse(file, resolvedPath, new package_url_resolver_1.PackageUrlResolver());
            chai_1.assert.equal(document.url, resolvedPath);
            chai_1.assert.equal(document.baseUrl, analyzer.resolveUrl('static/'));
        }));
    });
});
//# sourceMappingURL=html-parser_test.js.map
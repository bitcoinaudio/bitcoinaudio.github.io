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
const cancel_token_1 = require("cancel-token");
const chai_1 = require("chai");
const path = require("path");
const vscode_uri_1 = require("vscode-uri");
const analyzer_1 = require("../core/analyzer");
const cancel_token_2 = require("../core/cancel-token");
const index_1 = require("../index");
const model_1 = require("../model/model");
const scan_1 = require("../scanning/scan");
const fs_url_loader_1 = require("../url-loader/fs-url-loader");
const overlay_loader_1 = require("../url-loader/overlay-loader");
const package_url_resolver_1 = require("../url-loader/package-url-resolver");
const code_printer_1 = require("../warning/code-printer");
class UnexpectedResolutionError extends Error {
    constructor(message, resolvedValue) {
        super(message);
        this.resolvedValue = resolvedValue;
    }
}
exports.UnexpectedResolutionError = UnexpectedResolutionError;
function invertPromise(promise) {
    return __awaiter(this, void 0, void 0, function* () {
        let value;
        try {
            value = yield promise;
        }
        catch (e) {
            return e;
        }
        throw new UnexpectedResolutionError('Inverted Promise resolved', value);
    });
}
exports.invertPromise = invertPromise;
/**
 * Used for asserting that warnings or source ranges correspond to the right
 * parts of the source code.
 *
 * Non-test code probably wants WarningPrinter instead.
 */
class CodeUnderliner {
    constructor(urlLoader, urlResolver) {
        const analyzer = new analyzer_1.Analyzer({ urlLoader, urlResolver });
        this._parsedDocumentGetter = model_1.makeParseLoader(analyzer);
    }
    static withMapping(url, contents) {
        const urlLoader = new overlay_loader_1.InMemoryOverlayUrlLoader();
        urlLoader.urlContentsMap.set(url, contents);
        return new CodeUnderliner(urlLoader, new class extends index_1.UrlResolver {
            resolve(firstUrl, secondUrl) {
                return this.brandAsResolved(secondUrl || firstUrl);
            }
            relative() {
                throw new Error('does not do relative');
            }
        }());
    }
    underline(reference) {
        return __awaiter(this, void 0, void 0, function* () {
            if (reference === undefined) {
                return 'No source range given.';
            }
            if ('length' in reference) {
                return Promise.all(reference.map((ref) => this.underline(ref)));
            }
            if (isWarning(reference)) {
                return '\n' + reference.toString({ verbosity: 'code-only', color: false });
            }
            // We have a reference without its parsed document. Go get it.
            const parsedDocument = yield this._parsedDocumentGetter(reference.file);
            return '\n' + code_printer_1.underlineCode(reference, parsedDocument);
        });
    }
}
exports.CodeUnderliner = CodeUnderliner;
function isWarning(wOrS) {
    return 'code' in wOrS;
}
/**
 * Run the given scanner on the given package relative url.
 *
 * The url must be loadable with the given analyzer.
 */
function runScanner(analyzer, scanner, url) {
    return __awaiter(this, void 0, void 0, function* () {
        const context = yield analyzer['_analysisComplete'];
        const resolvedUrl = analyzer.resolveUrl(url);
        const parsedDocumentResult = yield context['_parse'](resolvedUrl, cancel_token_2.neverCancels);
        if (parsedDocumentResult.successful === false) {
            throw new Error(`Error parsing document: ${parsedDocumentResult.error.message}`);
        }
        return scan_1.scan(parsedDocumentResult.value, [scanner]);
    });
}
exports.runScanner = runScanner;
/**
 * Run the given scanner on some file contents as a string.
 *
 * Note that the url's file extension is relevant, because it will affect how
 * the file is parsed.
 */
function runScannerOnContents(scanner, url, contents) {
    return __awaiter(this, void 0, void 0, function* () {
        const overlayLoader = new overlay_loader_1.InMemoryOverlayUrlLoader();
        const analyzer = new analyzer_1.Analyzer({ urlLoader: overlayLoader });
        overlayLoader.urlContentsMap.set(analyzer.resolveUrl(url), contents);
        const { features, warnings } = yield runScanner(analyzer, scanner, url);
        return { features, warnings, analyzer, urlLoader: overlayLoader };
    });
}
exports.runScannerOnContents = runScannerOnContents;
exports.noOpTag = (strings, ...values) => values.reduce((r, v, i) => r + String(v) + strings[i + 1], strings[0]);
function fileRelativeUrl(strings, ...values) {
    return exports.noOpTag(strings, ...values);
}
exports.fileRelativeUrl = fileRelativeUrl;
function packageRelativeUrl(strings, ...values) {
    return exports.noOpTag(strings, ...values);
}
exports.packageRelativeUrl = packageRelativeUrl;
function resolvedUrl(strings, ...values) {
    return exports.noOpTag(strings, ...values);
}
exports.resolvedUrl = resolvedUrl;
/**
 * On posix systems file urls look like:
 *      file:///path/to/foo
 * On windows they look like:
 *      file:///c%3A/path/to/foo
 *
 * This will produce an OS-correct file url. Pretty much only useful for testing
 * url resolvers.
 */
function rootedFileUrl(strings, ...values) {
    const root = vscode_uri_1.default.file(path.resolve('/')).toString();
    const text = exports.noOpTag(strings, ...values);
    return (root + text);
}
exports.rootedFileUrl = rootedFileUrl;
exports.fixtureDir = path.join(__dirname, '../../src/test/static');
function assertIsCancelled(promise) {
    return __awaiter(this, void 0, void 0, function* () {
        const rejection = yield invertPromise(promise);
        chai_1.assert.isTrue(cancel_token_1.isCancel(rejection), `Expected ${rejection} to be a Cancel.`);
    });
}
exports.assertIsCancelled = assertIsCancelled;
/**
 * Returns an analyzer with configuration inferred for the given directory.
 *
 * Currently this just creates a simple analyzer with a Fs loader rooted
 * at the given directory, but in the future it may take configuration from
 * files including polymer.json or similar.
 */
function createForDirectory(dirname) {
    return __awaiter(this, void 0, void 0, function* () {
        const urlLoader = new fs_url_loader_1.FsUrlLoader(dirname);
        const urlResolver = new package_url_resolver_1.PackageUrlResolver({ packageDir: dirname });
        const analyzer = new analyzer_1.Analyzer({ urlLoader, urlResolver });
        const underliner = new CodeUnderliner(analyzer);
        return { urlLoader, urlResolver, analyzer, underliner };
    });
}
exports.createForDirectory = createForDirectory;
//# sourceMappingURL=test-utils.js.map
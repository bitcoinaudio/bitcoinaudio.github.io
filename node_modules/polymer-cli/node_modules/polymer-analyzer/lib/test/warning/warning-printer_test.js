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
const chalk = require("chalk");
const fs = require("fs");
const memoryStreams = require("memory-streams");
const path = require("path");
const javascript_parser_1 = require("../../javascript/javascript-parser");
const model_1 = require("../../model/model");
const package_url_resolver_1 = require("../../url-loader/package-url-resolver");
const warning_printer_1 = require("../../warning/warning-printer");
const test_utils_1 = require("../test-utils");
const parser = new javascript_parser_1.JavaScriptParser();
const url = test_utils_1.resolvedUrl `vanilla-elements.js`;
const vanillaSources = fs.readFileSync(path.join(test_utils_1.fixtureDir, 'vanilla-elements.js'), 'utf-8');
const parsedDocument = parser.parse(vanillaSources, url, new package_url_resolver_1.PackageUrlResolver());
const dumbNameWarning = new model_1.Warning({
    message: 'This is a dumb name for an element.',
    code: 'dumb-element-name',
    severity: model_1.Severity.WARNING,
    sourceRange: { file: url, start: { column: 6, line: 0 }, end: { column: 22, line: 0 } },
    parsedDocument
});
const goodJobWarning = new model_1.Warning({
    message: 'Good job with this observedAttributes getter.',
    code: 'cool-observed-attributes',
    severity: model_1.Severity.INFO,
    sourceRange: { file: url, start: { line: 22, column: 2 }, end: { line: 29, column: 3 } },
    parsedDocument
});
suite('WarningPrinter', () => {
    let output;
    let printer;
    let originalChalkEnabled;
    setup(() => {
        output = new memoryStreams.WritableStream();
        printer = new warning_printer_1.WarningPrinter(output, { color: false });
        originalChalkEnabled = chalk.enabled;
        // tslint:disable-next-line: no-any - chalk typings need enhancement here
        chalk.enabled = true;
    });
    teardown(() => {
        // tslint:disable-next-line: no-any - chalk typings need enhancement here
        chalk.enabled = originalChalkEnabled;
    });
    test('can handle printing no warnings', () => __awaiter(this, void 0, void 0, function* () {
        yield printer.printWarnings([]);
        chai_1.assert.deepEqual(output.toString(), '');
    }));
    test('can format and print a basic warning', () => __awaiter(this, void 0, void 0, function* () {
        yield printer.printWarnings([dumbNameWarning]);
        const actual = output.toString();
        const expected = `

class ClassDeclaration extends HTMLElement {}
      ~~~~~~~~~~~~~~~~

vanilla-elements.js(1,7) warning [dumb-element-name] - This is a dumb name for an element.
`;
        chai_1.assert.deepEqual(actual, expected);
    }));
    test('can format and print one-line warnings', () => __awaiter(this, void 0, void 0, function* () {
        printer = new warning_printer_1.WarningPrinter(output, { verbosity: 'one-line', color: false });
        yield printer.printWarnings([dumbNameWarning]);
        const actual = output.toString();
        const expected = `vanilla-elements.js(1,7) warning [dumb-element-name] - This is a dumb name for an element.\n`;
        chai_1.assert.deepEqual(actual, expected);
    }));
    test('it adds color if configured to do so', () => __awaiter(this, void 0, void 0, function* () {
        printer = new warning_printer_1.WarningPrinter(output, { color: true });
        yield printer.printWarnings([dumbNameWarning]);
        const actual = output.toString();
        const expected = `

class ClassDeclaration extends HTMLElement {}
\u001b[33m      ~~~~~~~~~~~~~~~~\u001b[39m

vanilla-elements.js(1,7) \u001b[33mwarning\u001b[39m [dumb-element-name] - This is a dumb name for an element.
`;
        chai_1.assert.deepEqual(actual, expected);
    }));
    test('it can print a multiline range', () => __awaiter(this, void 0, void 0, function* () {
        yield printer.printWarnings([goodJobWarning]);
        const actual = output.toString();
        const expected = `

  static get observedAttributes() {
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    return [
~~~~~~~~~~~~
      /** @type {boolean} When given the element is totally inactive */
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      'disabled',
~~~~~~~~~~~~~~~~~
      /** @type {boolean} When given the element is expanded */
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      'open', 'foo', 'bar'
~~~~~~~~~~~~~~~~~~~~~~~~~~
    ];
~~~~~~
  }
~~~

vanilla-elements.js(23,3) info [cool-observed-attributes] - Good job with this observedAttributes getter.
`;
        chai_1.assert.deepEqual(actual, expected);
    }));
});
//# sourceMappingURL=warning-printer_test.js.map
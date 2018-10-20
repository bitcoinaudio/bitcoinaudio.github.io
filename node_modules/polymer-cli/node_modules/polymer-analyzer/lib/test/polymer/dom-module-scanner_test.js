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
const dom_module_scanner_1 = require("../../polymer/dom-module-scanner");
const test_utils_1 = require("../test-utils");
suite('DomModuleScanner', () => {
    test('finds local IDs', () => __awaiter(this, void 0, void 0, function* () {
        const contents = `<html><head></head>
        <body>
          <dom-module>
            <template>
              <div id="foo"></div>
              <span id="bar"></div>
              <div id2="nope"></div>
              <template>
                <div id="nada"></div>
              </template>
            </template>
          </dom-module>
        </body>
        </html>`;
        const { features } = yield test_utils_1.runScannerOnContents(new dom_module_scanner_1.DomModuleScanner(), 'test.html', contents);
        chai_1.assert.deepEqual(features.map((f) => f.localIds.map((l) => l.name)), [['foo', 'bar']]);
        chai_1.assert.deepEqual(features.map((f) => f.localIds.map((l) => l.nodeName)), [['div', 'span']]);
    }));
    test('finds databinding expressions IDs', () => __awaiter(this, void 0, void 0, function* () {
        const contents = `<html><head></head>
        <body>
          <dom-module>
            <template>
              <div id="{{foo}}"></div>
              <span id="{{bar(baz, boop)}}"></div>
              <other-elem prop="{{foo bar}}"></other-elem>
            </template>
          </dom-module>
        </body>
        </html>`;
        const { features, analyzer } = yield test_utils_1.runScannerOnContents(new dom_module_scanner_1.DomModuleScanner(), 'test.html', contents);
        const underliner = new test_utils_1.CodeUnderliner(analyzer);
        const domModules = features;
        chai_1.assert.equal(domModules.length, 1);
        chai_1.assert.deepEqual(yield underliner.underline(domModules[0].databindings.map((db) => db.sourceRange)), [
            `
              <div id="{{foo}}"></div>
                         ~~~`,
            `
              <span id="{{bar(baz, boop)}}"></div>
                          ~~~~~~~~~~~~~~`
        ]);
        chai_1.assert.deepEqual(yield underliner.underline(domModules[0].warnings), [`
              <other-elem prop="{{foo bar}}"></other-elem>
                                      ~`]);
    }));
});
//# sourceMappingURL=dom-module-scanner_test.js.map
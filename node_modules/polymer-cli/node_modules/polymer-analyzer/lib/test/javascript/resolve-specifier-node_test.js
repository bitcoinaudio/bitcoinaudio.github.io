"use strict";
/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
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
const path = require("path");
const resolve_specifier_node_1 = require("../../javascript/resolve-specifier-node");
const rootDir = path.resolve(__dirname, '..', '..', '..', 'src', 'test', 'static', 'javascript', 'resolve-specifier-node');
const rootMain = path.join(rootDir, 'root.js');
const componentDir = path.join(rootDir, 'node_modules');
const shallowDepMain = path.join(componentDir, 'shallow', 'shallow.js');
const scopedDepMain = path.join(componentDir, '@scope', 'scoped', 'scoped.js');
const shallowRootComponentInfo = {
    packageName: 'root',
    rootDir,
    componentDir
};
const scopedRootComponentInfo = {
    packageName: '@scope/root',
    rootDir,
    componentDir
};
suite('resolve', () => {
    test('non-component root to path', () => __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.equal(resolve_specifier_node_1.resolve('./root.js', rootMain), './root.js');
    }));
    test('non-component root to shallow dep', () => __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.equal(resolve_specifier_node_1.resolve('shallow', rootMain), './node_modules/shallow/shallow.js');
    }));
    test('non-component root to scoped dep', () => __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.equal(resolve_specifier_node_1.resolve('@scope/scoped', rootMain), './node_modules/@scope/scoped/scoped.js');
    }));
    test('non-component bower dependency', () => __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.equal(resolve_specifier_node_1.resolve('bower_dep', rootMain), './bower_components/bower_dep/bower_dep.js');
    }));
    test('shallow dep to scoped dep', () => __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.equal(resolve_specifier_node_1.resolve('@scope/scoped', shallowDepMain, shallowRootComponentInfo), '../@scope/scoped/scoped.js');
    }));
    test('scoped dep to shallow dep', () => __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.equal(resolve_specifier_node_1.resolve('shallow', scopedDepMain, shallowRootComponentInfo), '../../shallow/shallow.js');
    }));
    test('component-root to path', () => __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.equal(resolve_specifier_node_1.resolve('./root.js', rootMain, shallowRootComponentInfo), './root.js');
    }));
    test('component-root to shallow dep', () => __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.equal(resolve_specifier_node_1.resolve('shallow', rootMain, shallowRootComponentInfo), '../shallow/shallow.js');
    }));
    test('component-root to scoped dep', () => __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.equal(resolve_specifier_node_1.resolve('@scope/scoped', rootMain, shallowRootComponentInfo), '../@scope/scoped/scoped.js');
    }));
    test('scoped-component-root to shallow dep', () => __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.equal(resolve_specifier_node_1.resolve('shallow', rootMain, scopedRootComponentInfo), '../../shallow/shallow.js');
    }));
    test('scoped-component-root to scoped dep', () => __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.equal(resolve_specifier_node_1.resolve('@scope/scoped', rootMain, scopedRootComponentInfo), '../scoped/scoped.js');
    }));
});
//# sourceMappingURL=resolve-specifier-node_test.js.map
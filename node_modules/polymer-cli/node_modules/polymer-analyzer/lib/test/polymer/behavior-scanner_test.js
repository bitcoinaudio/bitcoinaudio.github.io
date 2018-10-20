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
const behavior_1 = require("../../polymer/behavior");
const behavior_scanner_1 = require("../../polymer/behavior-scanner");
const test_utils_1 = require("../test-utils");
suite('BehaviorScanner', () => {
    let behaviors;
    let behaviorsList;
    suiteSetup(() => __awaiter(this, void 0, void 0, function* () {
        const { analyzer } = yield test_utils_1.createForDirectory(test_utils_1.fixtureDir);
        const { features } = yield test_utils_1.runScanner(analyzer, new behavior_scanner_1.BehaviorScanner(), 'js-behaviors.js');
        behaviors = new Map();
        behaviorsList =
            features.filter((e) => e instanceof behavior_1.ScannedBehavior);
        for (const behavior of behaviorsList) {
            if (behavior.className === undefined) {
                throw new Error(`Could not determine className of behavior.`);
            }
            behaviors.set(behavior.className, behavior);
        }
    }));
    test('Finds behavior object assignments', () => {
        chai_1.assert.deepEqual(behaviorsList.map((b) => b.className).sort(), [
            'SimpleBehavior',
            'Polymer.SimpleNamespacedBehavior',
            'AwesomeBehavior',
            'Polymer.AwesomeNamespacedBehavior',
            'Really.Really.Deep.Behavior',
            'CustomBehaviorList',
            'exportedBehavior',
            'default',
        ].sort());
    });
    test('Supports behaviors at local assignments', () => {
        chai_1.assert(behaviors.has('SimpleBehavior'));
        chai_1.assert.equal(behaviors.get('SimpleBehavior').properties.values().next().value.name, 'simple');
    });
    test('Supports behaviors with renamed paths', () => {
        chai_1.assert(behaviors.has('AwesomeBehavior'));
        chai_1.assert(behaviors.get('AwesomeBehavior').properties.has('custom'));
    });
    test('Supports behaviors On.Property.Paths', () => {
        chai_1.assert(behaviors.has('Really.Really.Deep.Behavior'));
        chai_1.assert.equal(behaviors.get('Really.Really.Deep.Behavior').properties.get('deep')
            .name, 'deep');
    });
    test('Supports property array on behaviors', () => {
        let defaultValue;
        behaviors.get('AwesomeBehavior').properties.forEach((prop) => {
            if (prop.name === 'a') {
                defaultValue = prop.default;
            }
        });
        chai_1.assert.equal(defaultValue, 1);
    });
    test('Supports chained behaviors', function () {
        chai_1.assert(behaviors.has('CustomBehaviorList'));
        const childBehaviors = behaviors.get('CustomBehaviorList').behaviorAssignments;
        const deepChainedBehaviors = behaviors.get('Really.Really.Deep.Behavior').behaviorAssignments;
        chai_1.assert.deepEqual(childBehaviors.map((b) => b.identifier), ['SimpleBehavior', 'AwesomeBehavior', 'Really.Really.Deep.Behavior']);
        chai_1.assert.deepEqual(deepChainedBehaviors.map((b) => b.identifier), ['Do.Re.Mi.Fa']);
    });
    test('Does not count methods as properties', function () {
        const behavior = behaviors.get('Polymer.SimpleNamespacedBehavior');
        if (!behavior) {
            throw new Error('Could not find Polymer.SimpleNamespacedBehavior');
        }
        chai_1.assert.deepEqual([...behavior.methods.keys()], ['method', 'shorthandMethod']);
        chai_1.assert.deepEqual([...behavior.properties.keys()], [
            'simple',
            'object',
            'array',
            'attached',
            'templateLiteral',
            'getter',
            'getterSetter'
        ]);
    });
    test('Correctly transforms property types', function () {
        const behavior = behaviors.get('Polymer.SimpleNamespacedBehavior');
        if (!behavior) {
            throw new Error('Could not find Polymer.SimpleNamespacedBehavior');
        }
        chai_1.assert.deepEqual([...behavior.properties.values()].map((p) => ({ name: p.name, type: p.type, readOnly: p.readOnly })), [
            { name: 'simple', type: 'boolean', readOnly: false },
            { name: 'object', type: 'Object', readOnly: false },
            { name: 'array', type: 'Array', readOnly: false },
            { name: 'attached', type: undefined, readOnly: false },
            { name: 'templateLiteral', type: 'string', readOnly: false },
            { name: 'getter', type: undefined, readOnly: true },
            { name: 'getterSetter', type: undefined, readOnly: false }
        ]);
    });
    const testName = 'Supports behaviors that are just arrays of other behaviors';
    test(testName, () => __awaiter(this, void 0, void 0, function* () {
        const { analyzer } = yield test_utils_1.createForDirectory(test_utils_1.fixtureDir);
        const analysis = yield analyzer.analyze(['uses-behaviors.js']);
        const elements = [...analysis.getFeatures({ kind: 'polymer-element' })];
        chai_1.assert.deepEqual(elements.map((e) => e.tagName), [
            'uses-basic-behavior',
            'uses-array-behavior',
            'uses-default-behavior'
        ]);
        // Get the toplevel behaviors.
        chai_1.assert.deepEqual(elements.map((e) => e.behaviorAssignments.map((ba) => ba.identifier)), [
            ['BasicBehavior1'],
            ['ArrayOfBehaviors'],
            ['BasicBehavior1', 'DefaultBehavior']
        ]);
        // Show that ArrayOfBehaviors has been correctly expanded too.
        chai_1.assert.deepEqual(elements.map((e) => [...e.methods.keys()]), [['method1'], ['method1', 'method2'], ['method1', 'method3']]);
    }));
});
//# sourceMappingURL=behavior-scanner_test.js.map
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
const async_work_cache_1 = require("../../core/async-work-cache");
const test_utils_1 = require("../test-utils");
suite('AsyncWorkCache', () => {
    let cache;
    setup(() => {
        cache = new async_work_cache_1.AsyncWorkCache();
    });
    test('it works for the simple happy case', () => __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.equal(yield cache.getOrCompute('key', () => __awaiter(this, void 0, void 0, function* () { return 'cool'; })), 'cool');
        // 'cool' was already cached.
        chai_1.assert.equal(yield cache.getOrCompute('key', () => __awaiter(this, void 0, void 0, function* () { return 'neat'; })), 'cool');
    }));
    test('it handles parallel calls', () => __awaiter(this, void 0, void 0, function* () {
        // Only the first one actually runs
        const promises = [
            cache.getOrCompute('key', () => __awaiter(this, void 0, void 0, function* () { return 'good'; })),
            cache.getOrCompute('key', () => __awaiter(this, void 0, void 0, function* () {
                throw new Error('Should not be called');
            })),
            cache.getOrCompute('key', () => __awaiter(this, void 0, void 0, function* () {
                throw new Error('Should not be called');
            })),
        ];
        chai_1.assert.deepEqual(yield Promise.all(promises), ['good', 'good', 'good']);
        // Errors are cached too
        const failurePromises = [
            cache.getOrCompute('badkey', () => __awaiter(this, void 0, void 0, function* () {
                throw new Error('failed');
            })),
            cache.getOrCompute('badkey', () => __awaiter(this, void 0, void 0, function* () { return 'good'; })),
            cache.getOrCompute('badkey', () => __awaiter(this, void 0, void 0, function* () { return 'good'; })),
        ].map(test_utils_1.invertPromise);
        chai_1.assert.deepEqual((yield Promise.all(failurePromises)).map((e) => e.message), ['failed', 'failed', 'failed']);
    }));
    test('it handles a cancellation followed by a new request', () => __awaiter(this, void 0, void 0, function* () {
        const source = cancel_token_1.CancelToken.source();
        const promise1 = cache.getOrCompute('key', () => __awaiter(this, void 0, void 0, function* () {
            while (true) {
                yield Promise.resolve();
                source.token.throwIfRequested();
            }
        }), source.token);
        source.cancel();
        yield test_utils_1.assertIsCancelled(promise1);
        const source2 = cancel_token_1.CancelToken.source();
        const promise2 = cache.getOrCompute('key', () => __awaiter(this, void 0, void 0, function* () {
            yield Promise.resolve();
            return 'finished!';
        }), source2.token);
        chai_1.assert.equal(yield promise2, 'finished!');
    }));
    const testName = `many parallel calls to getOrCompute, some that cancel,` +
        ` some that don't`;
    test(testName, () => __awaiter(this, void 0, void 0, function* () {
        const cancelledPromises = [];
        for (let i = 0; i < 10; i++) {
            const source = cancel_token_1.CancelToken.source();
            cancelledPromises.push(cache.getOrCompute('key', () => __awaiter(this, void 0, void 0, function* () {
                while (true) {
                    yield Promise.resolve();
                    source.token.throwIfRequested();
                }
            }), source.token));
            source.cancel();
        }
        chai_1.assert.equal(yield cache.getOrCompute('key', () => __awaiter(this, void 0, void 0, function* () {
            return 'cool';
        })), 'cool');
        for (const cancelled of cancelledPromises) {
            yield test_utils_1.assertIsCancelled(cancelled);
        }
    }));
});
//# sourceMappingURL=async-work-cache_test.js.map
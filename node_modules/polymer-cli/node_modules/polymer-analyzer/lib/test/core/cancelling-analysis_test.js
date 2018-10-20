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
const test_utils_1 = require("../test-utils");
suite('cancelling analysis midway through', () => {
    test(`analyze() does not complete when cancelled`, () => __awaiter(this, void 0, void 0, function* () {
        const { analyzer } = yield test_utils_1.createForDirectory(test_utils_1.fixtureDir);
        const cancelSource = cancel_token_1.CancelToken.source();
        const analysisPromise = analyzer.analyze(['vanilla-elements.js'], { cancelToken: cancelSource.token });
        cancelSource.cancel();
        const analysis = yield analysisPromise;
        const result = analysis.getDocument('vanilla-element.js');
        if (result.successful) {
            throw new Error(`Did not expect analysis to succeed when cancelled.`);
        }
    }));
    test('we can handle parallel requests, one canceled one not', () => __awaiter(this, void 0, void 0, function* () {
        const { analyzer } = yield test_utils_1.createForDirectory(test_utils_1.fixtureDir);
        const cancelSource = cancel_token_1.CancelToken.source();
        const url = 'vanilla-elements.js';
        const cancelledAnalysisPromise = analyzer.analyze([url], { cancelToken: cancelSource.token });
        const goodAnalysisPromise = analyzer.analyze([url]);
        cancelSource.cancel();
        const cancelledAnalysis = yield cancelledAnalysisPromise;
        const cancelledResult = cancelledAnalysis.getDocument(url);
        if (cancelledResult.successful) {
            throw new Error(`Expected cancelled analysis not to yield a document.`);
        }
        const goodAnalysis = yield goodAnalysisPromise;
        const goodResult = goodAnalysis.getDocument(url);
        if (!goodResult.successful) {
            throw new Error(`Expected non-cancelled analysis to yield a document.`);
        }
    }));
});
//# sourceMappingURL=cancelling-analysis_test.js.map
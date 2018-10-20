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
import { Analyzer } from '../core/analyzer';
import { FileRelativeUrl, PackageRelativeUrl, ParsedDocument, ResolvedUrl, ScannedFeature, UrlResolver } from '../index';
import { SourceRange, Warning } from '../model/model';
import { Scanner } from '../scanning/scanner';
import { FsUrlLoader } from '../url-loader/fs-url-loader';
import { InMemoryOverlayUrlLoader } from '../url-loader/overlay-loader';
import { PackageUrlResolver } from '../url-loader/package-url-resolver';
import { UrlLoader } from '../url-loader/url-loader';
export declare class UnexpectedResolutionError<V = {} | null | undefined> extends Error {
    resolvedValue: V;
    constructor(message: string, resolvedValue: V);
}
export declare function invertPromise(promise: Promise<{} | null | undefined>): Promise<Partial<Error> | null | undefined>;
export declare type Reference = Warning | SourceRange | undefined;
/**
 * Used for asserting that warnings or source ranges correspond to the right
 * parts of the source code.
 *
 * Non-test code probably wants WarningPrinter instead.
 */
export declare class CodeUnderliner {
    private _parsedDocumentGetter;
    constructor(urlLoader: UrlLoader, urlResolver?: UrlResolver);
    static withMapping(url: ResolvedUrl, contents: string): CodeUnderliner;
    /**
     * Converts one or more warnings/source ranges into underlined text.
     *                                                  ~~~~~~~~~~ ~~~~
     *
     * This has a loose set of types that it will accept in order to make
     * writing tests simple and legible.
     */
    underline(reference: Reference): Promise<string>;
    underline(references: ReadonlyArray<Reference>): Promise<ReadonlyArray<string>>;
}
/**
 * Run the given scanner on the given package relative url.
 *
 * The url must be loadable with the given analyzer.
 */
export declare function runScanner(analyzer: Analyzer, scanner: Scanner<ParsedDocument, {} | null | undefined, {}>, url: string): Promise<{
    features: ScannedFeature[];
    warnings: Warning[];
}>;
/**
 * Run the given scanner on some file contents as a string.
 *
 * Note that the url's file extension is relevant, because it will affect how
 * the file is parsed.
 */
export declare function runScannerOnContents(scanner: Scanner<ParsedDocument, {} | null | undefined, {}>, url: string, contents: string): Promise<{
    features: ScannedFeature[];
    warnings: Warning[];
    analyzer: Analyzer;
    urlLoader: InMemoryOverlayUrlLoader;
}>;
export declare const noOpTag: (strings: TemplateStringsArray, ...values: string[]) => string;
export declare function fileRelativeUrl(strings: TemplateStringsArray, ...values: string[]): FileRelativeUrl;
export declare function packageRelativeUrl(strings: TemplateStringsArray, ...values: string[]): PackageRelativeUrl;
export declare function resolvedUrl(strings: TemplateStringsArray, ...values: string[]): ResolvedUrl;
/**
 * On posix systems file urls look like:
 *      file:///path/to/foo
 * On windows they look like:
 *      file:///c%3A/path/to/foo
 *
 * This will produce an OS-correct file url. Pretty much only useful for testing
 * url resolvers.
 */
export declare function rootedFileUrl(strings: TemplateStringsArray, ...values: string[]): ResolvedUrl;
export declare const fixtureDir: string;
export declare function assertIsCancelled(promise: Promise<{} | null | undefined>): Promise<void>;
/**
 * Returns an analyzer with configuration inferred for the given directory.
 *
 * Currently this just creates a simple analyzer with a Fs loader rooted
 * at the given directory, but in the future it may take configuration from
 * files including polymer.json or similar.
 */
export declare function createForDirectory(dirname: string): Promise<{
    urlLoader: FsUrlLoader;
    urlResolver: PackageUrlResolver;
    analyzer: Analyzer;
    underliner: CodeUnderliner;
}>;

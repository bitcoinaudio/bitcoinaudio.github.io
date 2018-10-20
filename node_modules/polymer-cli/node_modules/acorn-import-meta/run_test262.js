"use strict"

const path = require("path")
const run = require("test262-parser-runner")
const parse = require(".").parse

const unsupportedFeatures = [
  "BigInt",
  "class-fields",
  "class-fields-private",
  "class-fields-public",
  "optional-catch-binding",
  "regexp-lookbehind",
  "regexp-named-groups",
  "regexp-unicode-property-escapes"
]

// See https://github.com/tc39/test262/issues/1342

run(
  (content, options) => parse(content, {sourceType: options.sourceType, ecmaVersion: 9, plugins: { importMeta: true }}),
  {
    testsDirectory: path.dirname(require.resolve("test262/package.json")),
    skip: test => !test.attrs.features || !test.attrs.features.includes("import-meta") || unsupportedFeatures.some(f => test.attrs.features.includes(f)),
  }
)

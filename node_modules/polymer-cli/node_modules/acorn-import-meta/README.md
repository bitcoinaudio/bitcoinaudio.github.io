# Support for import.meta in Acorn

[![NPM version](https://img.shields.io/npm/v/acorn-import-meta.svg)](https://www.npmjs.org/package/acorn-import-meta)

This is a plugin for [Acorn](http://marijnhaverbeke.nl/acorn/) - a tiny, fast JavaScript parser, written completely in JavaScript.

It implements support for import.meta as defined in the [corresponding stage 3 proposal](https://github.com/tc39/proposal-import-meta). The emitted AST follows [ESTree](https://github.com/estree/estree/blob/master/es2015.md#metaproperty).

## Usage

You can use this module directly in order to get an Acorn instance with the plugin installed:

```javascript
var acorn = require('acorn-import-meta');
```

Or you can use `inject.js` for injecting the plugin into your own version of Acorn like this:

```javascript
var acorn = require('acorn-import-meta/inject')(require('./custom-acorn'));
```

Then, use the `plugins` option to enable the plugiin:

```javascript
var ast = acorn.parse(code, {
  plugins: { importMeta: true }
});
```

## License

This plugin is released under the [GNU Affero General Public License version 3 or later](./LICENSE.AGPL) and the [Apache License version 2](LICENSE.Apache).
Please feel free to open an issue if this choice of licenses is a problem for your use-case.

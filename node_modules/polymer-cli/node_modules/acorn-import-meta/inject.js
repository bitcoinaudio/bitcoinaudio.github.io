"use strict"

const skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g

module.exports = function (acorn) {
  const tt = acorn.tokTypes

  const nextTokenIsDot = parser => {
    skipWhiteSpace.lastIndex = parser.pos
    let skip = skipWhiteSpace.exec(parser.input)
    let next = parser.pos + skip[0].length
    return parser.input.slice(next, next + 1) === "."
  }

  acorn.plugins.importMeta = function (instance) {

    instance.extend("parseExprAtom", function (superF) {
      return function(refDestructuringErrors) {
        if (this.type !== tt._import || !nextTokenIsDot(this)) return superF.call(this, refDestructuringErrors)

        if (!this.options.allowImportExportEverywhere && !this.inModule) {
          this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'")
        }

        let node = this.startNode()
        node.meta = this.parseIdent(true)
        this.expect(tt.dot)
        node.property = this.parseIdent(true)
        if (node.property.name !== "meta") {
          this.raiseRecoverable(node.property.start, "The only valid meta property for import is import.meta")
        }
        return this.finishNode(node, "MetaProperty")
      }
    })

    instance.extend("parseStatement", function (superF) {
      return function(declaration, topLevel, exports) {
        if (this.type !== tt._import) return superF.call(this, declaration, topLevel, exports)
        if (!nextTokenIsDot(this)) return superF.call(this, declaration, topLevel, exports)

        let node = this.startNode()
        let expr = this.parseExpression()
        return this.parseExpressionStatement(node, expr)
      }
    })
  }
  return acorn
}

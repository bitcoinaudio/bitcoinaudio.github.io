"use strict"

const assert = require("assert")
const acorn = require("..")

function testFail(text, expectedError, additionalOptions) {
  it(text, function () {
    let failed = false
    try {
      acorn.parse(text, Object.assign({ ecmaVersion: 9, sourceType: "module", plugins: { importMeta: true } }, additionalOptions))
    } catch (e) {
      if (expectedError) assert.equal(e.message, expectedError)
      failed = true
    }
    assert(failed)
  })
}
function test(text, expectedResult, additionalOptions) {
  it(text, function () {
    const result = acorn.parse(text, Object.assign({ ecmaVersion: 9, sourceType: "module", plugins: { importMeta: true } }, additionalOptions))

    assert.deepEqual(result, expectedResult)
  })
  testFail(text, null, { sourceType: "script" })
}

describe("acorn-import-meta", function () {
  test("const response = fetch(import.meta.url);", {
    type: "Program",
    start: 0,
    end: 40,
    body: [
      {
        type: "VariableDeclaration",
        start: 0,
        end: 40,
        declarations: [
          {
            type: "VariableDeclarator",
            start: 6,
            end: 39,
            id: {
              type: "Identifier",
              start: 6,
              end: 14,
              name: "response"
            },
            init: {
              type: "CallExpression",
              start: 17,
              end: 39,
              callee: {
                type: "Identifier",
                start: 17,
                end: 22,
                name: "fetch"
              },
              arguments: [
                {
                  type: "MemberExpression",
                  start: 23,
                  end: 38,
                  object: {
                    type: "MetaProperty",
                    start: 23,
                    end: 34,
                    meta: {
                      type: "Identifier",
                      start: 23,
                      end: 29,
                      name: "import"
                    },
                    property: {
                      type: "Identifier",
                      start: 30,
                      end: 34,
                      name: "meta"
                    }
                  },
                  property: {
                    type: "Identifier",
                    start: 35,
                    end: 38,
                    name: "url"
                  },
                  computed: false
                }
              ]
            }
          }
        ],
        kind: "const"
      }
    ],
    sourceType: "module"
  })
  test("const size = import.meta.scriptElement.dataset.size || 300;", {
    type: "Program",
    start: 0,
    end: 59,
    body: [
      {
        type: "VariableDeclaration",
        start: 0,
        end: 59,
        declarations: [
          {
            type: "VariableDeclarator",
            start: 6,
            end: 58,
            id: {
              type: "Identifier",
              start: 6,
              end: 10,
              name: "size"
            },
            init: {
              type: "LogicalExpression",
              start: 13,
              end: 58,
              left: {
                type: "MemberExpression",
                start: 13,
                end: 51,
                object: {
                  type: "MemberExpression",
                  start: 13,
                  end: 46,
                  object: {
                    type: "MemberExpression",
                    start: 13,
                    end: 38,
                    object: {
                      type: "MetaProperty",
                      start: 13,
                      end: 24,
                      meta: {
                        type: "Identifier",
                        start: 13,
                        end: 19,
                        name: "import"
                      },
                      property: {
                        type: "Identifier",
                        start: 20,
                        end: 24,
                        name: "meta"
                      }
                    },
                    property: {
                      type: "Identifier",
                      start: 25,
                      end: 38,
                      name: "scriptElement"
                    },
                    computed: false
                  },
                  property: {
                    type: "Identifier",
                    start: 39,
                    end: 46,
                    name: "dataset"
                  },
                  computed: false
                },
                property: {
                  type: "Identifier",
                  start: 47,
                  end: 51,
                  name: "size"
                },
                computed: false
              },
              operator: "||",
              right: {
                type: "Literal",
                start: 55,
                end: 58,
                value: 300,
                raw: "300"
              }
            }
          }
        ],
        kind: "const"
      }
    ],
    sourceType: "module"
  })
  test("import.meta.resolve('something')", {
    type: "Program",
    start: 0,
    end: 32,
    body: [
      {
        type: "ExpressionStatement",
        start: 0,
        end: 32,
        expression: {
          type: "CallExpression",
          start: 0,
          end: 32,
          callee: {
            type: "MemberExpression",
            start: 0,
            end: 19,
            object: {
              type: "MetaProperty",
              start: 0,
              end: 11,
              meta: {
                type: "Identifier",
                start: 0,
                end: 6,
                name: "import"
              },
              property: {
                type: "Identifier",
                start: 7,
                end: 11,
                name: "meta"
              }
            },
            property: {
              type: "Identifier",
              start: 12,
              end: 19,
              name: "resolve"
            },
            computed: false
          },
          arguments: [
            {
              type: "Literal",
              start: 20,
              end: 31,
              value: "something",
              raw: "'something'"
            }
          ]
        }
      }
    ],
    sourceType: "module"
  })

  test("import x from 'y'", {
    type: "Program",
    start: 0,
    end: 17,
    body: [
      {
        type: "ImportDeclaration",
        start: 0,
        end: 17,
        specifiers: [
          {
            type: "ImportDefaultSpecifier",
            start: 7,
            end: 8,
            local: {
              type: "Identifier",
              start: 7,
              end: 8,
              name: "x"
            }
          }
        ],
        source: {
          type: "Literal",
          start: 14,
          end: 17,
          value: "y",
          raw: "'y'"
        }
      }
    ],
    sourceType: "module"
  })
  testFail("let x = import.anotherMeta", "The only valid meta property for import is import.meta (1:15)")
})

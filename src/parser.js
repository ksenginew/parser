let Parser = {
    json: $ => $.object()||$.array(),

    object: $ => 
      $.LCurly()&&
      optional(
        $.objectItem() &&
        MANY(() => {
          $.CONSUME(Comma)
          $.SUBRULE2($.objectItem)
        })
      })
      $.CONSUME(RCurly)
    ,

    $.RULE("objectItem", () => {
      $.CONSUME(StringLiteral)
      $.CONSUME(Colon)
      $.SUBRULE($.value)
    })

    $.RULE("array", () => {
      $.CONSUME(LSquare)
      $.OPTION(() => {
        $.SUBRULE($.value)
        $.MANY(() => {
          $.CONSUME(Comma)
          $.SUBRULE2($.value)
        })
      })
      $.CONSUME(RSquare)
    })

    $.RULE("value", () => {
      $.OR([
        { ALT: () => $.CONSUME(StringLiteral) },
        { ALT: () => $.CONSUME(NumberLiteral) },
        { ALT: () => $.SUBRULE($.object) },
        { ALT: () => $.SUBRULE($.array) },
        { ALT: () => $.CONSUME(True) },
        { ALT: () => $.CONSUME(False) },
        { ALT: () => $.CONSUME(Null) }
      ])
    })

    // very important to call this after all the rules have been defined.
    // otherwise the parser may not work correctly as it will lack information
    // derived during the self analysis phase.
    this.performSelfAnalysis()
  }
}

// ----------------- wrapping it all together -----------------

// reuse the same parser instance.
const parser = new JsonParser()

module.exports = {
  jsonTokens: allTokens,

  JsonParser: JsonParser,

  parse: function parse(text) {
    const lexResult = JsonLexer.tokenize(text)
    // setting a new input will RESET the parser instance's state.
    parser.input = lexResult.tokens
    // any top level rule may be used as an entry point
    const cst = parser.json()

    return {
      cst: cst,
      lexErrors: lexResult.errors,
      parseErrors: parser.errors
    }
  }
}
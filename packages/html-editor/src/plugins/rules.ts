// input rules from prosemirror-example-setup
import {
  inputRules,
  textblockTypeInputRule,
  wrappingInputRule,
} from 'prosemirror-inputrules'
import { Plugin } from 'prosemirror-state'

import { EditorSchema } from '../schema'

export const rules = (schema: EditorSchema): Plugin<EditorSchema> =>
  inputRules({
    rules: [
      // block quote
      wrappingInputRule<EditorSchema>(/^\s*>\s$/, schema.nodes.blockquote),

      // ordered list
      wrappingInputRule<EditorSchema>(
        /^(\d+)\.\s$/,
        schema.nodes.list,
        (matches) => ({
          type: 'ordered',
          order: Number(matches[1]),
        }),
        (matches, node) => {
          return node.childCount + node.attrs.order == Number(matches[1])
        }
      ),

      // unordered list
      wrappingInputRule<EditorSchema>(
        /^\s*([-+*])\s$/,
        schema.nodes.list,
        () => ({
          type: 'unordered',
        })
      ),

      // code block
      textblockTypeInputRule<EditorSchema>(/^```$/, schema.nodes.code_block),

      // headings
      textblockTypeInputRule<EditorSchema>(
        new RegExp('^(#{1,6})\\s$'),
        schema.nodes.heading,
        (matches) => ({ level: matches[1].length })
      ),
    ],
  })
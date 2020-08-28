import {
  baseKeymap,
  blockActive,
  blockquote,
  bold,
  bulletList,
  code,
  codeBlock,
  doc,
  DOMParser,
  DOMSerializer,
  Editor,
  EditorContent,
  EditorProps,
  EditorProvider,
  heading,
  history,
  image,
  inputRules,
  isWrapped,
  italic,
  keymap,
  liftListItem,
  listItem,
  listKeymap,
  markActive,
  Node,
  orderedList,
  paragraph,
  placeholder,
  Plugin,
  redo,
  removeFormatting,
  Schema,
  setBlockType,
  setListTypeOrWrapInList,
  sinkListItem,
  strikethrough,
  subscript,
  superscript,
  table,
  tableDataCell,
  tableEditing,
  tableHeaderCell,
  tableRow,
  text,
  textblockTypeInputRule,
  toggleMark,
  toggleWrap,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  underline,
  undo,
  undoInputRule,
  wrapIn,
  wrappingInputRule,
} from '@aeaton/react-prosemirror'
import {
  faBold,
  faCode,
  faHeading,
  faIndent,
  faItalic,
  faListOl,
  faListUl,
  faOutdent,
  faParagraph,
  faQuoteLeft,
  faRemoveFormat,
  faStrikethrough,
  faSubscript,
  faSuperscript,
  faUnderline,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import debounce from 'lodash.debounce'
import React, { useEffect } from 'react'

const schema = new Schema({
  marks: {
    bold,
    code,
    italic,
    strikethrough,
    subscript,
    superscript,
    underline,
  },
  nodes: {
    text,
    doc,
    paragraph,
    heading,
    blockquote,
    codeBlock,
    image,
    bulletList,
    orderedList,
    listItem,
    table,
    tableRow,
    tableDataCell,
    tableHeaderCell,
  },
})

// TODO: nodeViews

const plugins: Plugin[] = [
  keymap({
    'Mod-`': toggleMark(schema.marks.code),
    'Mod-b': toggleMark(schema.marks.bold),
    'Mod-i': toggleMark(schema.marks.italic),
  }),
  keymap({
    'Mod-z': undo,
    'Shift-Mod-z': redo,
  }),
  keymap({
    Backspace: undoInputRule,
  }),
  keymap(listKeymap(schema.nodes.listItem)),
  keymap(baseKeymap),
  inputRules({
    rules: [
      // # heading
      textblockTypeInputRule(
        new RegExp('^(#{1,6})\\s$'),
        schema.nodes.heading,
        (match) => ({ level: match[1].length })
      ),

      // ``` code block
      textblockTypeInputRule(/^```$/, schema.nodes.codeblock),

      // > blockquote
      wrappingInputRule(/^\s*>\s$/, schema.nodes.blockquote),

      // * bullet list
      wrappingInputRule(/^\s*([*])\s$/, schema.nodes.bulletList),

      // 1. ordered list
      wrappingInputRule(
        /^(\d+)\.\s$/,
        schema.nodes.orderedList,
        (match) => ({ start: +match[1] }),
        (match, node) => node.childCount + node.attrs.start === +match[1]
      ),
    ],
  }),
  history(),
  tableEditing(),
  placeholder(),
]

const editorProps: EditorProps = {
  nodeViews: {}, // TODO
}

const parser = DOMParser.fromSchema(schema)
const serializer = DOMSerializer.fromSchema(schema)

const importHTML = (input?: string): Node => {
  const template = document.createElement('template')

  if (input !== undefined) {
    template.innerHTML = input
  }

  return parser.parse(template.content)
}

const exportHTML = (output: Node): string => {
  const container = document.createElement('div')

  container.appendChild(serializer.serializeFragment(output.content))

  return container.innerHTML
}

const editor = new Editor(schema, plugins, editorProps)

export const RichTextEditor = React.memo<{
  autoFocus?: boolean
  delay?: number
  handleChange: (value: string) => void
  value?: string // TODO: initialValue?
}>(({ autoFocus = false, delay = 500, value = '', handleChange }) => {
  useEffect(() => {
    const handler = debounce((event: Event) => {
      const doc = (event as CustomEvent).detail
      const output = exportHTML(doc)

      if (output !== value) {
        handleChange(output)
      }
    }, delay)

    editor.addEventListener('docchange', handler)

    return () => {
      editor.removeEventListener('docchange', handler)
    }
  }, [delay, handleChange, value])

  useEffect(() => {
    editor.setDoc(importHTML(value))
  }, [value])

  return (
    <EditorProvider editor={editor}>
      <Toolbar>
        <ToolbarGroup>
          <ToolbarItem
            title={'Toggle bold'}
            active={markActive(schema.marks.bold)}
            enable={toggleMark(schema.marks.bold)}
            run={toggleMark(schema.marks.bold)}
          >
            <FontAwesomeIcon icon={faBold} />
          </ToolbarItem>
          <ToolbarItem
            title={'Toggle italic'}
            active={markActive(schema.marks.italic)}
            enable={toggleMark(schema.marks.italic)}
            run={toggleMark(schema.marks.italic)}
          >
            <FontAwesomeIcon icon={faItalic} />
          </ToolbarItem>
          <ToolbarItem
            title={'Toggle code'}
            active={markActive(schema.marks.code)}
            enable={toggleMark(schema.marks.code)}
            run={toggleMark(schema.marks.code)}
          >
            <FontAwesomeIcon icon={faCode} />
          </ToolbarItem>
          <ToolbarItem
            title={'Toggle subscript'}
            active={markActive(schema.marks.subscript)}
            enable={toggleMark(schema.marks.subscript)}
            run={toggleMark(schema.marks.subscript)}
          >
            <FontAwesomeIcon icon={faSubscript} />
          </ToolbarItem>
          <ToolbarItem
            title={'Toggle superscript'}
            active={markActive(schema.marks.superscript)}
            enable={toggleMark(schema.marks.superscript)}
            run={toggleMark(schema.marks.superscript)}
          >
            <FontAwesomeIcon icon={faSuperscript} />
          </ToolbarItem>
          <ToolbarItem
            title={'Toggle strikethrough'}
            active={markActive(schema.marks.strikethrough)}
            enable={toggleMark(schema.marks.strikethrough)}
            run={toggleMark(schema.marks.strikethrough)}
          >
            <FontAwesomeIcon icon={faStrikethrough} />
          </ToolbarItem>
          <ToolbarItem
            title={'Toggle underline'}
            active={markActive(schema.marks.underline)}
            enable={toggleMark(schema.marks.underline)}
            run={toggleMark(schema.marks.underline)}
          >
            <FontAwesomeIcon icon={faUnderline} />
          </ToolbarItem>
          <ToolbarItem
            title={'Remove formatting'}
            enable={removeFormatting}
            run={removeFormatting}
          >
            <FontAwesomeIcon icon={faRemoveFormat} />
          </ToolbarItem>
        </ToolbarGroup>

        <ToolbarGroup>
          <ToolbarItem
            title={'Change to paragraph'}
            active={blockActive(schema.nodes.paragraph)}
            enable={setBlockType(schema.nodes.paragraph)}
            run={setBlockType(schema.nodes.paragraph)}
          >
            <FontAwesomeIcon icon={faParagraph} />
          </ToolbarItem>
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarItem
            title={'Change to heading'}
            active={blockActive(schema.nodes.heading)}
            enable={setBlockType(schema.nodes.heading)}
            run={setBlockType(schema.nodes.heading)}
          >
            <FontAwesomeIcon icon={faHeading} />
          </ToolbarItem>
          <ToolbarItem
            title={'Outdent'}
            enable={liftListItem(schema.nodes.listItem)}
            run={liftListItem(schema.nodes.listItem)}
          >
            <FontAwesomeIcon icon={faOutdent} />
          </ToolbarItem>
          <ToolbarItem
            title={'Indent'}
            enable={sinkListItem(schema.nodes.listItem)}
            run={sinkListItem(schema.nodes.listItem)}
          >
            <FontAwesomeIcon icon={faIndent} />
          </ToolbarItem>
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarItem
            title={'Change to ordered list'}
            active={blockActive(schema.nodes.orderedList)}
            enable={setListTypeOrWrapInList(schema.nodes.orderedList)}
            run={setListTypeOrWrapInList(schema.nodes.orderedList)}
          >
            <FontAwesomeIcon icon={faListOl} />
          </ToolbarItem>
          <ToolbarItem
            title={'Change to bullet list'}
            active={blockActive(schema.nodes.bulletList)}
            enable={setListTypeOrWrapInList(schema.nodes.bulletList)}
            run={setListTypeOrWrapInList(schema.nodes.bulletList)}
          >
            <FontAwesomeIcon icon={faListUl} />
          </ToolbarItem>
          <ToolbarItem
            title={'Outdent'}
            enable={liftListItem(schema.nodes.listItem)}
            run={liftListItem(schema.nodes.listItem)}
          >
            <FontAwesomeIcon icon={faOutdent} />
          </ToolbarItem>
          <ToolbarItem
            title={'Indent'}
            enable={sinkListItem(schema.nodes.listItem)}
            run={sinkListItem(schema.nodes.listItem)}
          >
            <FontAwesomeIcon icon={faIndent} />
          </ToolbarItem>
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarItem
            title={'Toggle blockquote wrapper'}
            active={isWrapped(schema.nodes.blockquote)}
            enable={toggleWrap(schema.nodes.blockquote)}
            run={toggleWrap(schema.nodes.blockquote)}
          >
            <FontAwesomeIcon icon={faQuoteLeft} />
          </ToolbarItem>
        </ToolbarGroup>
      </Toolbar>

      {/*<Floater>
        <Toolbar>
          <ToolbarGroup>
            <ToolbarItem
              title={'Remove formatting'}
              enable={removeFormatting}
              run={removeFormatting}
            >
              <FontAwesomeIcon icon={faRemoveFormat} />
            </ToolbarItem>
          </ToolbarGroup>
        </Toolbar>
      </Floater>*/}

      <EditorContent view={editor.view} autoFocus={autoFocus} />
    </EditorProvider>
  )
})
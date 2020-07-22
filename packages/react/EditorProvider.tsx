import { Node, Schema } from 'prosemirror-model'
import { EditorState, Plugin, Transaction } from 'prosemirror-state'
import { EditorProps, EditorView } from 'prosemirror-view'
import React, {
  createContext,
  PropsWithChildren,
  ReactElement,
  useEffect,
  useMemo,
  useState,
} from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Transformer<S extends Schema, T = any> {
  import: (input: T) => Node<S>
  export: (output: Node<S>) => T
}

interface EditorContextProps<S extends Schema> {
  view: EditorView<S>
  state: EditorState<S>
}

// @ts-ignore
export const EditorContext = createContext<EditorContextProps>(undefined)

export const EditorProvider = <S extends Schema, T>({
  children,
  debounce = 500,
  editorProps,
  handleChange,
  plugins,
  schema,
  transformer,
  value,
}: PropsWithChildren<{
  debounce?: number
  editorProps: EditorProps<unknown, S>
  handleChange: (value: T) => void
  plugins: Plugin<S>[]
  schema: S
  transformer: Transformer<S>
  value?: T
}>): ReactElement => {
  // debounce the output transformation if required
  const debouncedHandleChange = useMemo<(outputNode: Node<S>) => void>(() => {
    let timer: number

    return (outputNode) => {
      if (timer) {
        window.clearTimeout(timer)
      }

      timer = window.setTimeout(() => {
        handleChange(transformer.export(outputNode))
      }, debounce)
    }
  }, [debounce, handleChange, transformer])

  const view = useMemo(() => {
    return new EditorView<S>(undefined, {
      state: EditorState.create<S>({ plugins, schema }),
      dispatchTransaction: (tr: Transaction<S>) => {
        const { state, transactions } = view.state.applyTransaction(tr)

        view.updateState(state)

        setState(state)

        if (transactions.some((tr) => tr.docChanged)) {
          debouncedHandleChange(state.doc)
        }
      },
      ...editorProps,
    })
  }, [debouncedHandleChange, editorProps, plugins, schema])

  const [state, setState] = useState<EditorState<S>>(view.state)

  useEffect(() => {
    view.updateState(
      EditorState.create<S>({
        doc: transformer.import(value),
        plugins: view.state.plugins,
        schema: view.state.schema,
        // selection: view.state.selection, // TODO: map selection?
      })
    )
  }, [transformer, value, view])

  return (
    <div className={'pompom-container'}>
      <EditorContext.Provider value={{ view, state }}>
        {children}
      </EditorContext.Provider>
    </div>
  )
}
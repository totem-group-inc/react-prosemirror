import { Extension } from '@pompom/core'
import { Plugin } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

export const focus = ({
  onBlur,
  onFocus,
}: {
  onBlur?: (event: Event) => boolean
  onFocus?: (event: Event) => boolean
}): Extension => {
  const handleDOMEvents: Record<
    string,
    (view: EditorView, event: Event) => boolean
  > = {}

  if (onBlur) {
    handleDOMEvents.blur = (view, event) => onBlur(event)
  }

  if (onFocus) {
    handleDOMEvents.focus = (view, event) => onFocus(event)
  }

  return {
    plugins: () => ({
      focus: new Plugin({
        props: {
          handleDOMEvents,
        },
      }),
    }),
  }
}

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactRenderer } from '@tiptap/react'
import { ImageNodeViewComponent } from './image-node-view'

export interface ImageOptions {
  inline: boolean
  allowBase64: boolean
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    image: {
      /**
       * Add an image
       */
      setImage: (options: {
        src: string
        alt?: string
        title?: string
        width?: number
        height?: number
        align?: 'left' | 'center' | 'right' | 'full-width'
        caption?: string
      }) => ReturnType
    }
  }
}

export const Image = Node.create<ImageOptions>({
  name: 'image',

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
    }
  },

  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? 'inline' : 'block'
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute('src'),
        renderHTML: (attributes) => {
          if (!attributes.src) {
            return {}
          }
          return {
            src: attributes.src,
          }
        },
      },
      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute('alt'),
        renderHTML: (attributes) => {
          if (!attributes.alt) {
            return {}
          }
          return {
            alt: attributes.alt,
          }
        },
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute('title'),
        renderHTML: (attributes) => {
          if (!attributes.title) {
            return {}
          }
          return {
            title: attributes.title,
          }
        },
      },
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.getAttribute('width')
          return width ? parseInt(width, 10) : null
        },
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {}
          }
          return {
            width: attributes.width,
          }
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const height = element.getAttribute('height')
          return height ? parseInt(height, 10) : null
        },
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {}
          }
          return {
            height: attributes.height,
          }
        },
      },
      align: {
        default: 'center',
        parseHTML: (element) => {
          const align = element.getAttribute('data-align') || element.style.textAlign
          if (align === 'left' || align === 'center' || align === 'right' || align === 'full-width') {
            return align
          }
          return 'center'
        },
        renderHTML: (attributes) => {
          if (!attributes.align || attributes.align === 'center') {
            return {}
          }
          return {
            'data-align': attributes.align,
          }
        },
      },
      caption: {
        default: null,
        parseHTML: (element) => {
          const captionEl = element.querySelector('[data-caption]')
          return captionEl ? captionEl.textContent : null
        },
        renderHTML: (attributes) => {
          if (!attributes.caption) {
            return {}
          }
          return {}
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'figure',
        getAttrs: (element) => {
          const img = (element as HTMLElement).querySelector('img')
          if (!img) return false
          
          const captionEl = (element as HTMLElement).querySelector('[data-caption], figcaption')
          const align = (element as HTMLElement).getAttribute('data-align') || 'center'
          
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            width: img.getAttribute('width') ? parseInt(img.getAttribute('width')!, 10) : null,
            height: img.getAttribute('height') ? parseInt(img.getAttribute('height')!, 10) : null,
            align: align === 'left' || align === 'center' || align === 'right' || align === 'full-width' ? align : 'center',
            caption: captionEl ? captionEl.textContent : null,
          }
        },
      },
      {
        tag: this.options.allowBase64
          ? 'img[src]'
          : 'img[src]:not([src^="data:"])',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const { caption, align } = node.attrs
    const imgElement: [string, Record<string, any>] = ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
    
    if (caption) {
      return [
        'figure',
        { 'data-align': align || 'center' },
        imgElement,
        ['figcaption', { 'data-caption': true }, caption],
      ] as const
    }
    
    return imgElement
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const component = new ReactRenderer(ImageNodeViewComponent, {
        props: {
          node,
          updateAttributes: (attrs: Record<string, any>) => {
            const pos = getPos()
            if (pos === undefined) return

            const { tr } = editor.view.state
            const currentNode = editor.view.state.doc.nodeAt(pos)
            if (!currentNode) return

            editor.view.dispatch(
              tr.setNodeMarkup(pos, undefined, {
                ...currentNode.attrs,
                ...attrs,
              })
            )
          },
          deleteNode: () => {
            const pos = getPos()
            if (pos === undefined) return

            const { tr } = editor.view.state
            editor.view.dispatch(tr.delete(pos, pos + node.nodeSize))
          },
          selected: false,
          editor,
        },
        editor,
      })

      return {
        dom: component.element,
        update: (updatedNode: any) => {
          if (updatedNode.type.name !== node.type.name) {
            return false
          }
          component.updateProps({
            node: updatedNode,
          })
          return true
        },
        selectNode: () => {
          component.updateProps({
            selected: true,
          })
        },
        deselectNode: () => {
          component.updateProps({
            selected: false,
          })
        },
        destroy: () => {
          component.destroy()
        },
      }
    }
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})


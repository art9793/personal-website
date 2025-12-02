import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import Highlight from '@tiptap/extension-highlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { common, createLowlight } from 'lowlight'
import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, FileCode,
  List, ListOrdered, ListTodo, Image as ImageIcon, Link as LinkIcon, Quote, 
  Heading1, Heading2, Heading3, Heading4, Minus, Undo, Redo, ChevronDown, Check, ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react"

const lowlight = createLowlight(common)

// Slash command items
const slashCommandItems = [
  {
    title: 'Heading 1',
    icon: Heading1,
    command: (editor: any) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    title: 'Heading 2',
    icon: Heading2,
    command: (editor: any) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: 'Heading 3',
    icon: Heading3,
    command: (editor: any) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    title: 'Bullet List',
    icon: List,
    command: (editor: any) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: 'Numbered List',
    icon: ListOrdered,
    command: (editor: any) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: 'Task List',
    icon: ListTodo,
    command: (editor: any) => editor.chain().focus().toggleTaskList().run(),
  },
  {
    title: 'Quote',
    icon: Quote,
    command: (editor: any) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    title: 'Code Block',
    icon: FileCode,
    command: (editor: any) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    title: 'Divider',
    icon: Minus,
    command: (editor: any) => editor.chain().focus().setHorizontalRule().run(),
  },
]

// Slash command menu component
const SlashCommandMenu = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Reset selection when items change
  useEffect(() => {
    setSelectedIndex(0)
  }, [props.items])

  const selectItem = (index: number) => {
    // Early exit if no items
    if (props.items.length === 0) {
      return
    }
    
    // Clamp index to valid range
    const clampedIndex = Math.max(0, Math.min(index, props.items.length - 1))
    const item = props.items[clampedIndex]
    if (item) {
      props.command(item)
    }
  }

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      // Guard against empty items array
      if (props.items.length === 0) {
        return false
      }

      if (event.key === 'ArrowUp') {
        setSelectedIndex((prev) => (prev + props.items.length - 1) % props.items.length)
        return true
      }

      if (event.key === 'ArrowDown') {
        setSelectedIndex((prev) => (prev + 1) % props.items.length)
        return true
      }

      if (event.key === 'Enter') {
        selectItem(selectedIndex)
        return true
      }

      return false
    },
  }))

  return (
    <div className="bg-background border rounded-lg shadow-lg p-2 min-w-[200px]">
      {props.items.map((item: any, index: number) => {
        const Icon = item.icon
        return (
          <button
            key={index}
            onClick={() => selectItem(index)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted transition-colors",
              index === selectedIndex && "bg-muted"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.title}</span>
          </button>
        )
      })}
    </div>
  )
})

SlashCommandMenu.displayName = 'SlashCommandMenu'

// Slash command extension
const SlashCommand = Extension.create({
  name: 'slashCommand',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        command: ({ editor, range, props }) => {
          // props is the selected item from slashCommandItems
          props.command(editor)
          editor.chain().focus().deleteRange(range).run()
        },
        items: ({ query }) => {
          return slashCommandItems
            .filter(item => item.title.toLowerCase().includes(query.toLowerCase()))
        },
        render: () => {
          let component: ReactRenderer
          let popup: any

          return {
            onStart: (props: any) => {
              component = new ReactRenderer(SlashCommandMenu, {
                props,
                editor: props.editor,
              })

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              })
            },

            onUpdate(props: any) {
              component.updateProps(props)

              popup[0].setProps({
                getReferenceClientRect: props.clientRect,
              })
            },

            onKeyDown(props: any) {
              if (props.event.key === 'Escape') {
                popup[0].hide()
                return true
              }

              return (component.ref as any)?.onKeyDown?.(props) || false
            },

            onExit() {
              popup[0].destroy()
              component.destroy()
            },
          }
        },
      }),
    ]
  },
})

// Link Dialog Component
const LinkDialog = ({ 
  open, 
  onOpenChange, 
  editor 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  editor: any
}) => {
  const [url, setUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [urlError, setUrlError] = useState('')

  // Validate URL format
  const validateUrl = (urlString: string): boolean => {
    if (!urlString.trim()) {
      setUrlError('URL is required')
      return false
    }
    
    // Basic URL validation - accepts http://, https://, mailto:, tel:, or relative paths starting with /
    const urlPattern = /^(https?:\/\/|mailto:|tel:|\/)/i
    if (!urlPattern.test(urlString)) {
      // If it doesn't start with a protocol, try adding https://
      const testUrl = `https://${urlString}`
      try {
        new URL(testUrl)
        // Valid URL format, but we'll keep the original input
        setUrlError('')
        return true
      } catch {
        setUrlError('Please enter a valid URL (e.g., https://example.com or /page)')
        return false
      }
    }
    
    // If it has a protocol, validate it's a proper URL
    if (urlString.match(/^(https?:\/\/)/i)) {
      try {
        new URL(urlString)
        setUrlError('')
        return true
      } catch {
        setUrlError('Please enter a valid URL')
        return false
      }
    }
    
    setUrlError('')
    return true
  }

  // Initialize form when dialog opens
  useEffect(() => {
    if (open && editor) {
      const { from, to } = editor.state.selection
      const selectedText = editor.state.doc.textBetween(from, to, ' ')
      const linkAttributes = editor.getAttributes('link')
      
      setLinkText(selectedText || linkAttributes.text || '')
      setUrl(linkAttributes.href || '')
      setUrlError('')
    }
  }, [open, editor])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateUrl(url)) {
      return
    }

    // Normalize URL - add https:// if no protocol is provided
    let normalizedUrl = url.trim()
    if (normalizedUrl && !normalizedUrl.match(/^(https?:\/\/|mailto:|tel:|\/)/i)) {
      normalizedUrl = `https://${normalizedUrl}`
    }

    if (normalizedUrl) {
      // If there's selected text, use it; otherwise use the link text input
      const { from, to } = editor.state.selection
      const hasSelection = from !== to
      
      if (hasSelection) {
        // Apply link to selected text
        editor.chain().focus().extendMarkRange('link').setLink({ href: normalizedUrl }).run()
      } else if (linkText.trim()) {
        // Insert new text with link
        editor.chain().focus().insertContent(`<a href="${normalizedUrl}">${linkText.trim()}</a>`).run()
      } else {
        // Just insert the URL as a link
        editor.chain().focus().insertContent(`<a href="${normalizedUrl}">${normalizedUrl}</a>`).run()
      }
    }
    
    onOpenChange(false)
  }

  const handleRemove = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    onOpenChange(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setUrl('')
      setLinkText('')
      setUrlError('')
    }
    onOpenChange(newOpen)
  }

  const isEditing = editor?.getAttributes('link').href

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            {isEditing ? 'Edit Link' : 'Insert Link'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the link URL or remove it entirely.'
              : 'Add a link to your content. You can link to external websites or internal pages.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <div className="relative">
                <Input
                  id="link-url"
                  type="text"
                  placeholder="https://example.com or /page"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    setUrlError('')
                  }}
                  onBlur={() => {
                    if (url) {
                      validateUrl(url)
                    }
                  }}
                  className={cn(
                    "pr-10",
                    urlError && "border-destructive focus-visible:ring-destructive"
                  )}
                  autoFocus
                />
                {url && !urlError && (
                  <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                )}
              </div>
              {urlError && (
                <p className="text-sm text-destructive">{urlError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter a full URL (https://example.com) or a relative path (/page)
              </p>
            </div>

            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="link-text">Link Text (Optional)</Label>
                <Input
                  id="link-text"
                  type="text"
                  placeholder="Link text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use the URL as the link text
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemove}
              >
                Remove Link
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!url.trim() || !!urlError}>
              {isEditing ? 'Update Link' : 'Insert Link'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const MenuBar = ({ editor }: { editor: any }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)

  if (!editor) {
    return null
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Step 1: Get presigned upload URL from server
      const uploadResponse = await fetch('/api/objects/upload', {
        method: 'POST',
        credentials: 'include',
      })
      if (!uploadResponse.ok) {
        throw new Error('Failed to get upload URL')
      }
      const { uploadURL } = await uploadResponse.json()

      // Step 2: Upload file to object storage
      const uploadResult = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })
      if (!uploadResult.ok) {
        throw new Error('Failed to upload image')
      }

      // Step 3: Set ACL policy and get normalized path
      const aclResponse = await fetch('/api/article-images', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageURL: uploadURL }),
      })
      if (!aclResponse.ok) {
        throw new Error('Failed to set image permissions')
      }
      const { objectPath } = await aclResponse.json()

      // Step 4: Insert image into editor with normalized path
      editor.chain().focus().setImage({ src: objectPath }).run()
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    }
  }

  // Get current heading level or paragraph
  const getCurrentHeadingLabel = () => {
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1'
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2'
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3'
    if (editor.isActive('heading', { level: 4 })) return 'Heading 4'
    return 'Normal text'
  }

  return (
    <div className="border-b py-2 md:py-2 mb-4 flex flex-wrap gap-1 md:gap-1 bg-background sticky top-16 z-10 opacity-100 transition-opacity duration-300">
      {/* Undo/Redo - First */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
      >
        <Undo className="h-4 w-4 md:h-4 md:w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
      >
        <Redo className="h-4 w-4 md:h-4 md:w-4" />
      </Button>
      
      <div className="w-px h-6 bg-border mx-1 self-center hidden md:block" />
      
      {/* Heading Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 min-h-[44px] md:min-h-0 px-3 md:px-2"
          >
            <span className="text-sm">{getCurrentHeadingLabel()}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[200px]">
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={cn(
              "flex items-center gap-2 py-3 md:py-1.5",
              !editor.isActive('heading') && "bg-muted"
            )}
          >
            <span>Normal text</span>
            {!editor.isActive('heading') && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={cn(
              "flex items-center gap-2 py-3 md:py-1.5",
              editor.isActive('heading', { level: 1 }) && "bg-muted"
            )}
          >
            <Heading1 className="h-4 w-4" />
            <span>Heading 1</span>
            {editor.isActive('heading', { level: 1 }) && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={cn(
              "flex items-center gap-2 py-3 md:py-1.5",
              editor.isActive('heading', { level: 2 }) && "bg-muted"
            )}
          >
            <Heading2 className="h-4 w-4" />
            <span>Heading 2</span>
            {editor.isActive('heading', { level: 2 }) && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={cn(
              "flex items-center gap-2 py-3 md:py-1.5",
              editor.isActive('heading', { level: 3 }) && "bg-muted"
            )}
          >
            <Heading3 className="h-4 w-4" />
            <span>Heading 3</span>
            {editor.isActive('heading', { level: 3 }) && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            className={cn(
              "flex items-center gap-2 py-3 md:py-1.5",
              editor.isActive('heading', { level: 4 }) && "bg-muted"
            )}
          >
            <Heading4 className="h-4 w-4" />
            <span>Heading 4</span>
            {editor.isActive('heading', { level: 4 }) && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <div className="w-px h-6 bg-border mx-1 self-center hidden md:block" />
      
      {/* Text Formatting - B, I, U, Strikethrough (hidden on mobile), Code (hidden on mobile) */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          editor.isActive('bold') ? 'bg-muted' : '',
          "min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
        )}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          editor.isActive('italic') ? 'bg-muted' : '',
          "min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
        )}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn(
          editor.isActive('underline') ? 'bg-muted' : '',
          "min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
        )}
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={cn(
          editor.isActive('strike') ? 'bg-muted' : '',
          "hidden md:inline-flex min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
        )}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={cn(
          editor.isActive('code') ? 'bg-muted' : '',
          "hidden md:inline-flex min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
        )}
      >
        <Code className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-6 bg-border mx-1 self-center hidden md:block" />
      
      {/* Lists */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          editor.isActive('bulletList') ? 'bg-muted' : '',
          "min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
        )}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          editor.isActive('orderedList') ? 'bg-muted' : '',
          "min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
        )}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={cn(
          editor.isActive('taskList') ? 'bg-muted' : '',
          "hidden md:inline-flex min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
        )}
        title="Task List"
      >
        <ListTodo className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-6 bg-border mx-1 self-center hidden md:block" />
      
      {/* Block Elements */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(
          editor.isActive('blockquote') ? 'bg-muted' : '',
          "min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
        )}
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={cn(
          editor.isActive('codeBlock') ? 'bg-muted' : '',
          "hidden md:inline-flex min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
        )}
        title="Code Block"
      >
        <FileCode className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className={cn(
          "hidden md:inline-flex min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
        )}
        title="Horizontal Rule"
      >
        <Minus className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-6 bg-border mx-1 self-center hidden md:block" />
      
      {/* Link and Image */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsLinkDialogOpen(true)}
        className={cn(
          editor.isActive('link') ? 'bg-muted' : '',
          "min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
        )}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      
      <LinkDialog 
        open={isLinkDialogOpen} 
        onOpenChange={setIsLinkDialogOpen}
        editor={editor}
      />
      
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleImageUpload}
      />
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function Editor({ content, onChange }: { content?: string, onChange?: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        hardBreak: {
          keepMarks: true,
        },
        codeBlock: false,
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      Strike,
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'code-block',
        },
      }),
      Highlight.configure({
        multicolor: false,
      }),
      HorizontalRule,
      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list-block',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-item-block',
        },
      }),
      TextStyle,
      Color,
      Image,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Placeholder.configure({
        placeholder: 'Tell your story...',
      }),
      SlashCommand,
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  // Sync content when prop changes (for loading existing articles)
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentContent = editor.getHTML()
      // Only update if content is different to avoid cursor jumping
      if (currentContent !== content) {
        editor.commands.setContent(content, { emitUpdate: false })
      }
    }
  }, [editor, content])

  return (
    <div className="relative min-h-[500px] w-full">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="mt-4" />
    </div>
  )
}

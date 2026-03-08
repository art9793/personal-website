# UX Improvement Plan

Full audit of the personal website — a Next.js 16 portfolio/CMS with a public-facing site (7 pages) and an admin console (dashboard + article editor).

---

## Part 1: User-Facing Site

### Navigation & Wayfinding


1. **No breadcrumbs on article pages** — When reading `/article/[slug]`, the only navigation is a "Back to writing" link at the bottom. Add a subtle breadcrumb or top link (`Home > Writing > Article Title`) so users always know where they are.
2. **Sidebar collapsed by default hides all labels** — New visitors see only icons with no text. Consider starting expanded on first visit (no sessionStorage value), then respecting the user's preference on subsequent visits.
3. **No active state for article pages in sidebar** — When on `/article/some-slug`, the "Writing" nav item doesn't highlight because the path check only matches `/writing`. Update the `isActive` logic to also match `/article/`*.

### Home Page

1. **No clear CTA or introduction for first-time visitors** — The home page shows name + bio + projects + writing, but there's no hook explaining what the visitor will find. Consider a one-liner value prop or welcome line.
2. **Social icons have no labels** — The social icon buttons on the home page only have visual icons, no tooltip or text. Add `<Tooltip>` wrappers so hovering reveals "Twitter", "LinkedIn", etc.
3. **"Selected Projects" shows no tags** — Home page project cards show title + description but not tags (unlike the `/projects` page). Adding 1-2 tags as small pills would give immediate context.

### Writing / Articles

1. **No article excerpt shown on writing list** — The `/writing` page only shows title and date. A one-line excerpt preview would help visitors decide what to read, especially when titles are vague.
2. **No estimated reading time on article list or article page** — The admin tracks word count/reading time, but it's never shown to readers. Add a "5 min read" indicator next to publish date.
3. **Article page has no tag display** — Articles have tags in the database but they're never rendered on the public article page. Showing tags at the top or bottom helps content discoverability.
4. **No "next/previous article" navigation** — After finishing an article, readers hit a dead end with only "Back to writing". Add prev/next article links to keep readers engaged.
5. **No share buttons or copy-link on articles** — There's no way to easily share an article. A minimal "copy link" button would increase shareability.

### Projects

1. **No visual distinction between featured and non-featured projects** — Featured projects show a tiny "Featured" text that's barely visible (`text-muted-foreground/60`). Make it more prominent (subtle background highlight, pin icon, or order featured first).
2. **Tags are nearly invisible** — Project tags use `text-muted-foreground/70` with no background or border, making them look like ghost text. Use subtle pill/badge styling.

### Travel

1. **No list view of visited countries** — The travel page only shows a map and a summary stat. Add a collapsible list of countries grouped by continent below the map for accessibility and detail.
2. **Map has no interactivity feedback on mobile** — The WorldMap component is designed for mouse hover. Consider showing a bottom sheet or list on mobile instead of relying on hover tooltips.

### Work

1. **Description text is plain and unformatted** — Work descriptions use `whitespace-pre-line` plain text. Supporting basic markdown or at least bullet points would make descriptions more scannable.
2. **No company logos or visual anchors** — The work timeline is text-only. Even placeholder company initials (like the admin avatar) would break up the wall of text.

### Reading

1. **No way to filter or search books** — The reading list could become long. Add a simple filter (by status: Reading/Read) or a search input.
2. **Star ratings are tiny and low-contrast** — The rating stars are `h-3 w-3`, which is very small. Bump to `h-3.5 w-3.5` and consider using a warmer color (amber) for filled stars instead of the dark primary.
3. **"Currently Reading" badge is hardcoded blue, inconsistent with design** — The reading status badge uses raw `text-blue-600 bg-blue-50` instead of design system tokens. Use the badge component with a secondary variant for consistency.

### Performance & Polish

1. **No loading skeleton for individual article pages** — Unlike other pages, the article page has no skeleton/loading state while data loads. Add a simple text skeleton.
2. **Page transitions could feel more alive** — Currently using `fade-in-50 slide-in-from-bottom-2`. Consider subtle stagger animations for list items (projects, articles, books) to make pages feel more crafted.
3. **Mobile footer duplicates sidebar social links** — The footer shows Twitter + GitHub links that are also in the mobile sheet menu. Consider consolidating or differentiating.

---

## Part 2: Admin Console

### Dashboard Overview

1. **Overview is too sparse** — Only 3 stat cards and 2 quick action buttons. Add: recent articles list (last 5 edited), top articles by views, recent activity feed, and content health indicators (e.g., "3 drafts older than 30 days").
2. **No analytics trends** — The "Article Views" card shows total all-time views with no trend. Even a simple "vs. last period" comparison or sparkline would be more actionable.
3. **"Add Project" quick action goes to Projects tab, not a create form** — The "Add Project" button navigates to the tab but doesn't open the create sheet. It should trigger the create sheet directly.

### Sidebar & Navigation

1. **No link back to the live site** — There's no quick way to preview your site from the admin. Add a "View Site" link (with external link icon) at the top of the admin sidebar.
2. **Active tab title on mobile header is small and easy to miss** — The mobile header shows the tab title at `text-sm`. Make it slightly more prominent or add an icon.
3. **Command palette (Cmd+K) is underutilized** — It only has "New Article" and tab navigation. Add: "Preview Site", "View Article [name]", search across all content, "Upload Image".

### Writing Tab

1. **No inline preview for articles** — You can only preview an article by saving as published and visiting the public URL. Add a "Preview" button that opens a modal/sheet showing the article rendered in prose style.
2. **Bulk actions bar appears at the bottom, easy to miss** — When articles are selected, the bulk action bar may not be visible. Consider a sticky floating bar or top-pinned banner.
3. **No keyboard shortcut to search articles** — The search input exists but has no focus shortcut. Add `/` or `Cmd+F` to focus the search field.
4. **Article table doesn't show last edited date** — The writing tab table could show "Last edited" to help find recent work-in-progress.

### Article Editor

1. **No way to preview the article in context** — The editor has no preview mode. Add a side-by-side or toggle preview that renders the content with the same prose styles as the public page.
2. **Auto-save indicator is too subtle** — The save status (`opacity-60`) is nearly invisible. Make it slightly more prominent, maybe with a small dot indicator that's always visible.
3. **No revision history** — If you accidentally delete content and auto-save kicks in, the content is lost. Consider adding a simple version history or at minimum an "undo to last saved" button.
4. **Publish sheet is right-side only** — On mobile, the publish settings sheet takes full width but could benefit from being a bottom sheet (drawer) instead for easier thumb reach.
5. **No image gallery/picker in the editor** — To insert images, you presumably upload inline. A "Media Library" picker button in the editor toolbar that pulls from the Media tab would streamline the workflow.

### Projects Tab

1. **No drag-and-drop reordering** — Projects display order seems arbitrary. Add manual ordering or at least a "display order" field.
2. **Featured toggle has no visual feedback beyond the switch** — When toggling featured status, there's no immediate visual change in the table row. Add a star icon or subtle row highlight.

### Settings / Home Page Tab

1. **No live preview of profile changes** — You edit name, bio, and avatar blindly. Add a mini preview card showing how the home page hero will look.
2. **Social link inputs don't validate URL format** — You can enter any text as a Twitter/LinkedIn URL. Add basic URL pattern validation.

### Media Library

1. **No search or filter in media library** — As images accumulate, finding a specific one becomes hard. Add search by filename and filter by file type.
2. **No image details view** — Clicking an image should show dimensions, file size, upload date, and a "copy URL" button.

### SEO Tab

1. **No SEO preview card** — The SEO tab lets you edit meta fields but doesn't show how the page will look in Google search results or social media cards. Add a SERP preview and social card preview.

### General Admin UX

1. **No confirmation toast after bulk operations** — Bulk delete/status-change should show a clear success toast with count ("3 articles moved to draft").
2. **Tables don't persist sort/filter across tab switches** — If you sort the articles table and switch to Projects then back, the sort resets. Persist filter state.
3. **No dark mode for admin** — While the public site intentionally removed dark mode, the admin console is used for longer sessions where dark mode reduces eye strain. Consider adding it admin-only.
4. **No "recently edited" or "continue editing" shortcut** — When returning to the admin, there's no quick way to jump back to the article you were last editing.

---

## Suggested Priority Order

### High impact, low effort

- #1 (add Reading to nav)
- #4 (fix article active state)
- #6 (social icon tooltips)
- #9 (reading time on articles)
- #10 (show tags on article page)
- #28 (admin "View Site" link)

### High impact, medium effort

- #3 (sidebar default expanded for first visit)
- #8 (article excerpts on writing list)
- #11 (next/prev article nav)
- #25 (richer overview dashboard)
- #30 (enhanced command palette)
- #35 (article preview mode)

### Medium impact, low effort

- #7 (tags on home project cards)
- #13 (better featured project styling)
- #14 (project tag pills)
- #20 (bigger star ratings)
- #21 (consistent reading badge)
- #36 (more visible auto-save)

### Nice to have

- #15 (country list on travel)
- #23 (stagger animations)
- #37 (revision history)
- #40 (drag-and-drop ordering)
- #42 (profile live preview)
- #46 (SEO preview card)


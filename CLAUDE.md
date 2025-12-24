# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

## Architecture

This is a Next.js 16 application using the App Router with React 19 and Tailwind CSS 4.

### Key Stack

- **UI Components**: Base-UI (via `@base-ui/react`) with shadcn's "base-maia" style
- **Icons**: Hugeicons (`@hugeicons/react` with `@hugeicons/core-free-icons`)
- **Styling**: Tailwind CSS 4 with `class-variance-authority` for component variants, `tailwind-merge` + `clsx` via `cn()` utility

### Project Structure

- `app/` - Next.js App Router pages and layouts
- `components/ui/` - Reusable UI components (Button, Card, Input, Select, Combobox, etc.)
- `components/` - App-specific composed components
- `lib/utils.ts` - Utility functions including `cn()` for className merging

### Component Patterns

UI components use Base-UI primitives with CVA for variants. Example:

```tsx
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva } from "class-variance-authority"

const buttonVariants = cva("base-classes", { variants: {...} })
```

Path aliases configured: `@/*` maps to project root.

### Styling

- Uses CSS variables defined in `app/globals.css` with OKLCH color space
- Supports dark mode via `.dark` class
- Font: Figtree (primary), Geist (sans/mono)

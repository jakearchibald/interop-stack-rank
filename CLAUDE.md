# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack application built with:

- **Frontend**: Preact + TypeScript + Vite
- **Backend**: Cloudflare Workers
- **Package Manager**: pnpm (v10.15.0)
- **Deployment**: Cloudflare Workers via Wrangler

## Commands

### Development

```bash
# Start development server
pnpm dev

# Build the project
pnpm build

# Preview production build locally
pnpm preview

# Deploy to Cloudflare Workers
pnpm deploy
```

### Cloudflare Workers

```bash
# Generate TypeScript types for Cloudflare Workers
pnpm cf-typegen

# Deploy directly with wrangler
wrangler deploy
```

## Architecture

### Frontend (`app/`)

- **Entry Point**: `app/index.tsx` - Simple Preact app rendering into `#app` div
- **HTML Template**: `index.html` - Basic HTML structure with Vite module script

### Backend (`worker/`)

- **Main Handler**: `worker/index.ts` - Dynamic file-based routing system
- **Routes**: `worker/routes/` - Each `.ts` file becomes a route endpoint
  - Routes must export a default function matching `ExportedHandler<Env>['fetch']`
  - Supports both `/path.ts` and `/path/index.ts` patterns
  - Automatic trailing slash redirects for directory routes

### Configuration

- **Cloudflare Workers**: `wrangler.jsonc` - Worker configuration with observability enabled
- **Vite**: `vite.config.ts` - Preact preset with Cloudflare plugin and experimental headers/redirects support
- **TypeScript**: Multiple tsconfig files for different contexts (app, node, worker)

### Route System

The worker uses dynamic imports with `import.meta.glob` to automatically register routes:

- URL paths map directly to file paths in `worker/routes/`
- Missing trailing slashes are automatically redirected
- Route modules are lazy-loaded on demand
- Each route file must export a default fetch handler function

### Key Files

- `worker-configuration.d.ts`: Large generated types file for Cloudflare Workers runtime
- `pnpm-workspace.yaml`: Workspace configuration limiting certain dependencies to built versions

## Overall project goal

The aim is to create a web app that allows users to stack rank items, and save the results. The ranked items are global for all users of the app. For now, these can be "one" "two" "three" "four" "five".

The user doesn't have to rank all items. They can exist in a "no opinion" section, and this is their default position.

Ranking should be possible with drag and drop, but also via buttons. Dragging should only be active using a designated handle within each item. It should be clear that the top of the stack is the most important.

The results will be stored via cloudflare durable objects, using SQL as a backend.

The web app will require login via github or Google. A user's stack is associated with their account, hopefully in a way that treats login via github and google as the same user.

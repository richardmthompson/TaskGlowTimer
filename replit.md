# Focus Timer - Productivity Task Tracker

## Overview

A productivity-focused timer application designed to help users track work sessions with a clean, minimal interface. The app features a sticky-note style task input, a 30-minute circular timer with pie-fill animation, completed task history with chronological display, customizable color themes, and a task queue system with drag-and-drop reordering. Built with a focus on clarity and distraction-free workflow, drawing inspiration from Linear and Apple HIG design principles.

## User Preferences

Preferred communication style: Simple, everyday language.

## Keyboard Shortcuts

**Task Input & Timer Control:**
- `t` - Focus main task sticky note for editing
- `Enter` (from sticky note) - Start the clock
- `Space` - Pause and resume clock (toggle)
- `Cmd+Enter` - Complete current task and add to completed list

**Task Navigation:**
- `c` - Select first completed task
- `Q` (capital) - Select first queued task
- `Arrow Up/Down` - Navigate through selected task list (completed or queued)

**General:**
- `Escape` - Deselect any input field, deselect completed/queued task highlights

## System Architecture

### Frontend Architecture

**Framework & Core Libraries**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching

**UI Component System**
- Shadcn/ui component library (New York style variant) for consistent, accessible components
- Radix UI primitives as the foundation for interactive components (dialogs, popovers, tooltips, etc.)
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for managing component variants

**Design System**
- Custom color system using CSS variables for theme customization (5 customizable colors in settings panel)
- Typography: Inter font family for UI text, JetBrains Mono for monospace timer displays
- Three-column layout: Completed tasks (left 1/4), Main timer (center flex-1), Task Queue (right 1/4)
- Purposeful animations using Tailwind's animation utilities
- Spacing primitives based on Tailwind's scale (2, 4, 6, 8, 12, 16 units)

**State Management**
- Component-level state using React hooks (useState, useEffect, useRef)
- Timer logic with interval-based updates for elapsed time tracking
- Local state for color settings, task management (completed tasks, queued tasks), and UI panel visibility
- HTML5 drag-and-drop API for queue reordering
- No global state management library (Redux/Zustand) - keeping state local to components

**Key Features**
- **Sticky Note Input**: Yellow sticky-style textarea for entering current task with 5-second glow animation
- **Circular Timer**: 30-minute countdown with animated pie-fill visualization
- **Play/Pause/Done Controls**: Start, pause, and complete tasks with intuitive buttons
- **Status Indicator**: Shows "Working on..." with animated dots when active, "paused" when stopped
- **Completed Tasks**: Left panel (28% width) showing chronological history (newest at bottom) with calendar-style timestamps
- **Task Queue**: Top-right area (25% height) with input field and draggable task list for planning upcoming work
- **Task Selection**: Click completed or queued tasks to view details; queued tasks show lighter blue when selected with quick-start Play button
- **Color Settings**: Collapsible bottom-right overlay with 5 customizable color pickers (sticky, completed, clock default, clock elapsed, outline)
- **Drag-and-Drop**: Reorder queued tasks by dragging with grip handle
- **Keyboard Shortcuts**: Full keyboard navigation for efficient workflow (see below)

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for HTTP server and API routes
- Custom middleware for request/response logging with duration tracking
- Vite integration in development mode for HMR and SSR capabilities

**API Design**
- RESTful API structure with `/api` prefix for all endpoints
- Separation of concerns: routes defined in `server/routes.ts`, storage abstraction in `server/storage.ts`
- Storage interface pattern (`IStorage`) allowing for pluggable storage implementations

**Storage Layer**
- In-memory storage implementation (`MemStorage`) as the current active storage
- Storage interface defines CRUD operations for User entities
- Designed for easy migration to persistent storage (Postgres via Drizzle ORM)

### Data Storage

**Database Preparation**
- Drizzle ORM configured for PostgreSQL with schema definitions
- Schema defines Users table with auto-generated UUIDs, username, and password fields
- Drizzle-Zod integration for runtime validation of insert operations
- Migration system configured (output to `./migrations` directory)

**Current State**
- Application currently uses in-memory storage (non-persistent)
- Database schema defined but not yet connected to Postgres
- Ready for Postgres provisioning via `DATABASE_URL` environment variable

**Schema Design**
- User authentication foundation with username/password fields
- UUID-based primary keys using PostgreSQL's `gen_random_uuid()`
- Unique constraint on username field
- Zod schemas derived from Drizzle schemas for type-safe validation

### External Dependencies

**Third-Party UI Libraries**
- @radix-ui/* (v1.x): Comprehensive set of accessible component primitives
- lucide-react: Icon library for consistent iconography
- date-fns: Date manipulation and formatting utilities
- cmdk: Command palette interface component
- embla-carousel-react: Touch-friendly carousel component
- vaul: Drawer component for mobile interfaces

**Development Tools**
- @replit/vite-plugin-runtime-error-modal: Development error overlay
- @replit/vite-plugin-cartographer: Replit-specific development integration
- @replit/vite-plugin-dev-banner: Development mode banner
- esbuild: Fast bundler for server-side code

**Backend Dependencies**
- @neondatabase/serverless: Serverless-compatible Postgres driver
- connect-pg-simple: PostgreSQL session store (configured but not yet implemented)
- drizzle-kit: Migration generation and database push utilities

**Build & Tooling**
- TypeScript for full-stack type safety
- ESM module system throughout (type: "module" in package.json)
- Path aliases configured (@/, @shared/, @assets/) for clean imports
- PostCSS with Tailwind CSS and Autoprefixer for CSS processing

**Planned Integrations**
- PostgreSQL database (pending provisioning via Replit)
- Session management via connect-pg-simple for user authentication
- Potential task persistence layer (schema not yet defined)
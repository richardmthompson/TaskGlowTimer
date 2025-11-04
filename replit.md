# VoxPlan Web-Mini - Productivity Timer with Time-Tracking Rewards

## Overview

A productivity-focused timer application designed to help users track work sessions with a clean, minimal interface. Branded as "VoxPlan Web-Mini" with an NES-style power-up badge logo positioned above the app border in the top-left corner. The app features a sticky-note style task input, a 30-minute circular timer with pie-fill animation, completed task history with chronological display, time-tracking reward system (medals and diamonds), goals management, customizable color themes, and a task queue system with drag-and-drop reordering. Built with a focus on clarity and distraction-free workflow, drawing inspiration from Linear and Apple HIG design principles.

## User Preferences

Preferred communication style: Simple, everyday language.

## Keyboard Shortcuts

**Task Input & Timer Control:**
- `t` - Focus main task sticky note for editing
- `q` (lowercase) - Focus queue input field for adding tasks to queue
- `Enter` (from sticky note) - Start the clock
- `Enter` (when queued task is selected) - Move queued task to sticky note and remove from queue (only if sticky is empty; shows red shake animation if not)
- `Space` - Pause and resume clock (toggle)
- `Cmd+Enter` or `Ctrl+Enter` - Complete current task and add to completed list (works even if timer hasn't started)
- `T` (capital) - Move completed task back to sticky note (only if sticky is empty; shows red shake animation if not)

**Goal Management:**
- `g` (lowercase) - Focus goal input field for adding new goals to the stack
- `G` (capital) - Select first goal in the Goals stack
- `Enter` (when goal is selected) - Promote selected goal to "Current Goal" (displayed above sticky note)
- `Arrow Up/Down` or `k/j` - Navigate through selected goal list

**Task Navigation:**
- `c` - Select first completed task (shows green glow)
- `Q` (capital) - Select first queued task (shows lighter blue)
- `Arrow Up/Down` or `k/j` - Navigate through selected task list (completed, queued, or goals)

**Task Management:**
- `d` - Delete selected task from completed or queued list

**General:**
- `Shift+M` - Toggle dark/light theme
- `Escape` - Deselect any input field, deselect completed/queued/goal highlights

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
- Fixed 1200px centered layout with pale beige background (#faf8f5)
- Layout structure: Three-column design - Left: Goals stack (28% width), Center-left: Completed tasks (28% width split from left panel), Right: Queue/Sticky/Timer area (flex-1)
- Purposeful animations using Tailwind's animation utilities
- Spacing primitives based on Tailwind's scale (1, 2, 4, 6, 8, 12, 16 units); minimal gap-1 (4px) used for compact vertical spacing in goal/sticky area

**State Management**
- Component-level state using React hooks (useState, useEffect, useRef)
- Timer logic with interval-based updates for elapsed time tracking
- Local state for color settings, task management (completed tasks, queued tasks), and UI panel visibility
- HTML5 drag-and-drop API for queue reordering
- No global state management library (Redux/Zustand) - keeping state local to components

**Branding & Layout**
- **Brand Badge**: Gold coin medallion design positioned above app border in top-left corner; features radial gradient with warm gold tones (#d4af37 to #f4e4c1); smaller "VoxPlan Web-Mini" text to the right
- **Reserved Space**: Right side of header area reserved for future authentication features
- **Layout Positioning**: Badge anchored to the bordered card container (not viewport), maintaining consistent offset across responsive breakpoints
- **Layout Width**: Expanded to 1200px to provide more breathing room for all panels and components

**Key Features**
- **Theme Toggle**: Switch between light and dark modes via button (center top) or Shift+M keyboard shortcut; theme preference saved in localStorage
- **Sticky Note Input**: Yellow sticky-style textarea (dark: clean slate #334155) for entering current task with 5-second glow animation; shows red shake animation if attempting to overwrite existing content
- **Visual Grouping**: Sticky note and circular timer are wrapped in a subtle transparent container (30% opacity background, 50% opacity border, rounded corners) to visually group the task entry and timing controls
- **Circular Timer**: 30-minute countdown with animated pie-fill visualization; timer and controls positioned together (timer above, play/done buttons below)
- **Play/Pause/Done Controls**: Blue play/pause and green done buttons positioned directly below circular timer
- **Status Indicator**: Shows "Working on..." with animated dots when active, "paused" when stopped
- **Completed Tasks**: Center-left panel showing chronological history (newest at bottom) with calendar-style timestamps; displays goal abbreviation badges (first 3 letters in caps) with theme-aware goal color for quick visual identification
- **Goals System**: Left panel with goal stack; users add goals, promote one to "Current Goal" (displayed above sticky), tasks auto-assign to current goal; theme-aware coloring with deep purple (#581c87) in dark mode and orange in light mode
- **Current Goal**: Displays above sticky note when active with reduced padding (py-1.5 px-3) and minimal spacing (gap-1, 4px) to status indicator; clicking ✕ returns goal to stack; SVG connections draw from goals to assigned tasks; text and buttons adapt to theme for proper contrast
- **Bidirectional Selection**: Clicking a completed task automatically highlights its associated goal in the Goals stack, enhancing visual connection between tasks and their goals
- **Task Queue**: Top-right area with input field and draggable task list for planning upcoming work
- **Task Selection**: Click completed or queued tasks to view details in expanded 2-column task details panel below timer; selected completed tasks show green ring glow and highlight associated goal; queued tasks show lighter blue when selected with quick-start Play button
- **Task Details Panel**: Spans full width below sticky note and timer; 2-column grid layout with task title/type on left, start/end times and goal badge on right; compact spacing (mt-4) from timer; improved dark mode text readability (gray-200/300/400 scale)
- **SVG Goal Connections**: Positioned at main card root level (z-index 0) to prevent clipping; draws curved lines from goals to associated completed tasks; remains visible during scrolling
- **Error Prevention**: Moving queued tasks to non-empty sticky note triggers red shake animation (0.5s) to prevent accidental overwrites
- **Goal Promotion**: Select goal via 'G' or click, then press Enter to promote to current; supports both keyboard-only and click+Enter workflows
- **Auto-Assignment**: Tasks and queue items automatically inherit current goal when created; displayed in completed task cards with theme-aware goal badges
- **Color Settings**: Collapsible bottom-right overlay with 5 customizable color pickers (sticky, completed, clock default, clock elapsed, outline); colors automatically adapt for dark mode
- **Help Panel**: Collapsible bottom-left overlay displaying all keyboard shortcuts and their actions
- **Theme-Aware Goal Colors**: Comprehensive theme system where all goal surfaces (goal cards, current goal, task badges, details panel) dynamically adapt colors based on active theme; light mode uses warm orange, dark mode uses deep purple (#581c87); text and buttons automatically switch to light colors in dark mode for proper contrast
- **Dark Mode Colors**: Refined dark mode palette - completed tasks: dark emerald, goals: deep purple (#581c87), queue: dark blue-gray, sticky: clean slate (#334155); clock uses gray-700 background with light blue progress (#60a5fa) and dark gray outline; buttons use blue-500 and emerald-500 for visibility
- **Drag-and-Drop**: Reorder queued tasks by dragging with grip handle
- **Keyboard Shortcuts**: Full keyboard navigation for efficient workflow (see Keyboard Shortcuts section or Help panel)
- **Time-Tracking Rewards**: Earn gold medals every 30 minutes of work; two medals automatically consolidate into a purple diamond (representing 1 hour); rewards stack vertically beside timer; reward summaries displayed on completed task cards

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
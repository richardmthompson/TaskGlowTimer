# Design Guidelines: Productivity Timer App

## Design Approach

**Selected Approach:** Design System - Linear/Apple HIG inspired minimal productivity interface

**Rationale:** This is a utility-focused productivity tool where clarity, efficiency, and distraction-free focus are paramount. Drawing inspiration from Linear's clean aesthetics and Apple's emphasis on functional minimalism.

**Core Principles:**
- Clarity over decoration
- Purposeful animations that enhance understanding
- Spatial organization that guides workflow
- Consistent visual language across all components

---

## Typography

**Font Family:**
- Primary: Inter (via Google Fonts CDN)
- Monospace: JetBrains Mono (for timer display)

**Hierarchy:**
- Task Input (Sticky): text-lg font-medium (18px, 500 weight)
- Timer Display: text-4xl font-mono font-bold (36px, monospace, 700 weight)
- Completed Task Title: text-sm font-medium (14px, 500 weight)
- Timestamp Labels: text-xs font-mono (12px, monospace, 400 weight)
- Settings Panel Headers: text-sm font-semibold uppercase tracking-wide (14px, 600 weight)

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, and 16 consistently throughout
- Micro spacing: p-2, gap-2
- Standard spacing: p-4, gap-4, m-4
- Section spacing: p-8, mb-8
- Large spacing: p-12, gap-12

**Grid Structure:**
Three-column layout with fixed positioning:
- Left Column (25% width): Completed tasks stack with timeline
- Center Column (50% width): Active sticky note, controls, circular timer
- Right Column (25% width): Settings panel

**Responsive Behavior:**
- Desktop (lg:): Three-column layout as described
- Tablet (md:): Stack settings below, two-column for tasks/active
- Mobile: Single column, settings in slide-out drawer

---

## Component Library

### 1. Active Sticky Note Component
**Structure:**
- Textarea with auto-grow behavior
- Minimum height: h-32
- Rounded corners: rounded-xl
- Border width: border-2
- Padding: p-6
- Shadow: shadow-lg

**States:**
- Idle: Standard border, no animation
- Active (timer running): Pulsing glow animation using box-shadow
- Focused: Increased border thickness, subtle lift (transform translateY)

**Animation:**
```
Glow pulse: 2s ease-in-out infinite
Scale: 100% → 102% → 100%
Shadow spread: 0px → 12px → 0px
```

### 2. Circular Clock Face
**Dimensions:** 
- Size: w-48 h-48 (192px diameter)
- Border: border-4
- Shape: rounded-full

**Inner Elements:**
- SVG circle for base clock face
- Animated SVG path for countdown pie fill (stroke-dashoffset animation)
- Centered timer display using absolute positioning

**Countdown Visualization:**
- 30-minute total duration
- Pie fills clockwise from 12 o'clock position
- Smooth transition-all duration-1000 for second increments

**Timer Display Inside:**
- Format: HH:MM:SS
- Centered: absolute inset-0 flex items-center justify-center
- Font: text-4xl font-mono font-bold

### 3. Control Buttons
**Play/Pause Button:**
- Size: w-16 h-16
- Shape: rounded-full
- Icon: Heroicons play/pause icons (size: w-8 h-8)
- Positioned: Below sticky, centered horizontally with gap-4 from sticky

**Done Button:**
- Size: w-16 h-16
- Shape: rounded-full
- Icon: Heroicons check icon (size: w-8 h-8)
- Positioned: Below sticky, to the right of Play/Pause with gap-4

**Button Layout:**
Flexbox container: `flex gap-4 justify-center mt-6`

### 4. Completed Tasks Stack (Left Column)
**Container:**
- Width: Full column width
- Flex direction: flex-col
- Gap: gap-2
- Overflow: overflow-y-auto with custom scrollbar styling

**Individual Task Card:**
- Structure: Flat button appearance
- Padding: pl-16 pr-4 py-3 (left padding for timeline)
- Border: border-2 rounded-lg
- Hover: transform translateX(2px) transition-transform duration-200

**Timeline Indicators:**
- Position: Absolute positioned to left of card
- Start Time: Top-left corner, text-xs font-mono
- End Time: Bottom-left corner, text-xs font-mono
- Visual Line: 2px vertical line connecting times (absolute positioned, left-14)

**Layout Pattern:**
```
[08:30] ━━━━━━━━━━━━━━━━━
│       [Complete Task Title Here]
[09:15] ━━━━━━━━━━━━━━━━━
```

### 5. Settings Panel (Right Column)
**Structure:**
- Fixed width: w-72
- Padding: p-6
- Border-left: border-l-2
- Sticky positioning: sticky top-0
- Max height: max-h-screen overflow-y-auto

**Color Pickers:**
Each setting as a labeled group with gap-3:
- Label: text-sm font-semibold mb-2
- Input: Native HTML5 color picker, styled with w-full h-12 rounded-lg cursor-pointer

**Settings List:**
1. Sticky Background Color
2. Completed Items Background Color
3. Clock Face Default Color
4. Clock Face Elapsed Color
5. Outline Color (universal)

**Spacing:** gap-6 between each color picker group

### 6. Overall Layout Container
**Main Container:**
- Max width: max-w-screen-2xl
- Horizontal padding: px-8
- Vertical padding: py-12
- Margin: mx-auto (centered)

**Three-Column Grid:**
```
grid grid-cols-12 gap-8
- Left: col-span-3 (completed tasks)
- Center: col-span-6 (active sticky + controls)
- Right: col-span-3 (settings)
```

---

## Animations

**Sticky Glow Effect (Active State):**
- Implementation: Keyframe animation using box-shadow
- Duration: 2000ms
- Easing: ease-in-out
- Infinite loop
- Properties: shadow spread and opacity

**Countdown Pie Fill:**
- SVG stroke-dashoffset animation
- Linear progression over 30 minutes
- Update every second with transition-all duration-1000

**Task Completion Transition:**
- Fade out: opacity 100 → 0 (300ms)
- Slide left: translateX 0 → -100% (300ms)
- Stagger appearance in completed stack

**Control Button Interactions:**
- Hover: scale-105 transform duration-150
- Active: scale-95 transform duration-100

---

## Accessibility

- All interactive elements have min-height of h-12 for touch targets
- Color pickers include visible labels and descriptions
- Timer display uses high contrast monospace font
- Focus states: ring-2 ring-offset-2 for keyboard navigation
- ARIA labels for Play/Pause/Done buttons
- Live region announcements for timer state changes

---

## Icons

**Library:** Heroicons (via CDN)
**Required Icons:**
- Play (outline): play icon
- Pause (outline): pause icon  
- Check (solid): check icon for Done button

Icon sizing: Consistent w-6 h-6 for controls, w-8 h-8 for primary actions

---

## Images

**Not applicable** - This is a productivity tool with no hero section or decorative imagery. Interface is entirely functional UI components.
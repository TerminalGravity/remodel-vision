# Task 2: Frontend Styling, Icons, and Layout Baseline

This plan executes **Task 2**, establishing the design system and layout foundation.

## 1. Tailwind & Design System Setup
- **Theme Configuration**:
  - Update `index.html` with a robust Tailwind script configuration extending the theme (colors: `slate`, `blue`, `purple` as primary; fonts: `Inter`).
  - Define strictly typed design tokens if possible, or just use Tailwind classes.

## 2. Shared UI Package (`packages/ui`)
- **Structure**:
  - `src/components/`:
    - `Button.tsx`: Variants (primary, ghost, outline), sizes.
    - `Card.tsx`: Container with standardized border/bg/shadow.
    - `Badge.tsx`: Status indicators.
    - `Icon.tsx`: Wrapper for Lucide icons.
  - Export all from `src/index.ts`.

## 3. Layout Architecture (`apps/web`)
- **Components** (`src/components/layout/`):
  - `AppShell.tsx`: Main grid container (Sidebar + Content).
  - `MainContent.tsx`: Scrollable area with proper padding/overflow.
  - `Header.tsx`: Global header (if separate from Dashboard).
- **Refactoring**:
  - Refactor `Sidebar.tsx` to use `AppShell` layout context or CSS structure.
  - Refactor `App.tsx` to wrap `Dashboard` and `Workspace` in `AppShell` where appropriate.

## 4. Implementation Steps
1.  **Tailwind**: Enhance `index.html` with custom theme config.
2.  **UI Lib**: Create `Button`, `Card`, `Badge` in `packages/ui`.
3.  **Layout**: Create `AppShell` components in `apps/web`.
4.  **Integration**: Update `App.tsx` and `Dashboard.tsx` to use new primitives.


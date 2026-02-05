# Task 10: Floor Plan to 3D Workflow

This task implements the user-facing workflow for the "Tier 3" data acquisition pipeline built in Task 9. Users will be able to upload floor plan images, which are processed by Gemini Vision to extract room layouts and immediately generating a 3D dollhouse model.

## 1. Store Updates
Add actions to manage the floor plan processing state and update property rooms.
- **File**: `[apps/web/src/store/useStore.ts](apps/web/src/store/useStore.ts)`
- **Action**: Add `isProcessingFloorPlan` state.
- **Action**: Add `updatePropertyRooms(rooms: RoomContext[])` action to merge new layouts into the active context.

## 2. Floor Plan Wizard Component
Create a dedicated component for the upload and review flow.
- **File**: `[apps/web/src/components/workspace/FloorPlanWizard.tsx](apps/web/src/components/workspace/FloorPlanWizard.tsx)` (New)
- **Features**:
    - File upload (Image)
    - Preview area
    - "Generate 3D Model" button
    - Progress indicator (Analyzing -> Generating Geometry)
    - Success/Failure feedback

## 3. UI Integration
Expose the wizard in the main workspace interface.
- **File**: `[apps/web/src/components/ui/Sidebar.tsx](apps/web/src/components/ui/Sidebar.tsx)`
- **Action**: Add a "Upload Floor Plan" button/tab, likely near the "Project Settings" or as a primary action for empty projects.

## 4. Integration Logic
Connect the UI to the `floorPlanService`.
- **Logic**:
    1. User uploads image -> Convert to Base64.
    2. Call `floorPlanService.extractRoomLayout(base64)`.
    3. Receive `RoomLayout[]`.
    4. Convert/Enrich into full `RoomContext[]` (adding UUIDs, default heights if missing).
    5. Call `updatePropertyRooms`.
    6. `DollhouseScene` updates automatically (reactive).

## Dependencies
- `floorPlanService` (Task 9)
- `useStore`
- `Gemini Vision` (via service)


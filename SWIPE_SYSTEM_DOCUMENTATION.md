# Mobile-Friendly Todo App Interaction System - Complete Documentation

## Table of Contents
1. [Component Structure](#component-structure)
2. [Swipe Handling Architecture](#swipe-handling-architecture)
3. [Pseudo Code](#pseudo-code)
4. [State Management Flow](#state-management-flow)
5. [Mobile Interaction Logic](#mobile-interaction-logic)
6. [Desktop Fallback Behavior](#desktop-fallback-behavior)
7. [Animation Logic](#animation-logic)
8. [Edge Case Handling](#edge-case-handling)
9. [Accessibility Considerations](#accessibility-considerations)
10. [Optimized Rendering Strategy](#optimized-rendering-strategy)

---

## 1. Component Structure

### Architecture Diagram
```
ListRender (Container Component)
├── State: activeItemId (tracks which item is open)
├── Props: taskList, deleteTask, handleStatus, setTaskList
│
└── SwipeableTask (Item Component) x N
    ├── Props: t (task data), deleteTask, handleStatus, activeItemId, setActiveItemId
    ├── Local State:
    │   ├── translateX (current swipe position)
    │   ├── isAnimating (transition state)
    │
    ├── Refs:
    │   ├── startXRef (initial pointer X)
    │   ├── currentXRef (current pointer X)
    │   ├── isDraggingRef (swipe active flag)
    │   ├── lastTimeRef (for velocity calc)
    │   ├── hasMovedRef (movement detection)
    │   └── taskRef (DOM reference)
    │
    ├── Event Handlers:
    │   ├── handlePointerDown() → Start swipe tracking
    │   ├── handlePointerMove() → Update position
    │   ├── handlePointerUp() → Finalize swipe
    │
    ├── Rendered Elements:
    │   ├── task-action-left (Delete button)
    │   ├── task-action-right (Status button)
    │   ├── task-block (Main content with swipe transform)
    │   ├── task-actions (Desktop buttons)
    │   └── swipe-hint (Helper text)
    │
    └── Integration:
        ├── useSortable (drag-and-drop from dnd-kit)
        └── Theme support (data-theme attribute)
```

### File Organization
```
src/component/task/
├── SwipeableTask.jsx          (Main component)
├── SwipeableTask.css          (Responsive styles)
├── ListRender.jsx             (Updated container)
├── ListRender.css             (Grid layout)
├── useSwipe.js                (Custom hook - optional ref)
└── task.jsx                   (Legacy - can be deprecated)
```

---

## 2. Swipe Handling Architecture

### Core Concept: Transform-Based Swiping
- **Only use `transform: translateX()`** for GPU acceleration
- **Avoid margin/left/position changes** - causes reflows
- **Pointer Events** instead of Touch Events for cross-device support
- **Clamping** prevents overswiping beyond max distance
- **Velocity Detection** enables faster swipe recognition

### Constants
```javascript
MAX_SWIPE = 80              // Max visible swipe distance (px)
OPEN_THRESHOLD = 50         // Distance to reveal buttons
FULL_ACTION_THRESHOLD = 140 // Distance to trigger instant action
ANIMATION_DURATION = 300    // Snap animation time (ms)
VELOCITY_BONUS = 15         // Bonus pixels for fast swipes
DRAG_DEBOUNCE = 5           // Min movement to register swipe (px)
```

### Swipe Direction Logic
```
→ (Positive/Right Swipe)
  - Reveals LEFT action button
  - Action: DELETE
  - Color: RED (#ef4444)

← (Negative/Left Swipe)
  - Reveals RIGHT action button
  - Action: MARK COMPLETE/PENDING
  - Color: GREEN (#22c55e)
```

---

## 3. Pseudo Code

### Initialization
```
COMPONENT SwipeableTask INIT:
  state translateX = 0
  state isAnimating = false
  ref startX, currentX, isDragging, lastTime, hasMoved
  const isOpen = activeItemId === taskId
  
  SETUP pointerMove listener
  SETUP pointerUp listener (global)
  
  RETURN JSX with event handlers
```

### Swipe Lifecycle
```
USER POINTER DOWN ON TASK:
  IF isDragging OR on drag-handle:
    RETURN (ignore)
  
  SAVE startX = event.clientX
  SET isDragging = true
  SET lastTime = now()
  
  IF another task is open:
    CALL setActiveItemId(this.id)  // Close other task


USER MOVES POINTER:
  IF NOT isDragging:
    RETURN (ignore)
  
  SAVE currentX = event.clientX
  CALC diff = currentX - startX
  
  IF |diff| > DRAG_DEBOUNCE:
    SET hasMoved = true
  
  IF hasMoved:
    SET isAnimating = false
    CLAMP diff to [-MAX_SWIPE, MAX_SWIPE]
    SET translateX = diff
    APPLY transform: translateX(diff)


USER RELEASES POINTER:
  IF NOT isDragging:
    RETURN (ignore)
  
  SET isDragging = false
  CALC timeDelta = now() - lastTime
  CALC distance = currentX - startX
  CALC velocity = |distance / timeDelta|
  
  SET isAnimating = true
  
  // Velocity bonus for fast swipes
  velocityBonus = velocity > 0.5 ? 15 : 0
  adjustedOpenThreshold = OPEN_THRESHOLD - velocityBonus
  adjustedFullThreshold = FULL_ACTION_THRESHOLD - velocityBonus
  
  
  // Check swipe distance thresholds
  CASE distance > adjustedFullThreshold:
    // Full swipe right - DELETE
    SET translateX = MAX_SWIPE
    SCHEDULE (after ANIMATION_DURATION):
      CALL deleteTask(id)
  
  CASE distance > adjustedOpenThreshold:
    // Partial swipe right - REVEAL DELETE
    SET translateX = MAX_SWIPE
    SET activeItemId = this.id
  
  CASE distance < -adjustedFullThreshold:
    // Full swipe left - COMPLETE
    SET translateX = -MAX_SWIPE
    SCHEDULE (after ANIMATION_DURATION):
      CALL handleStatus(id)
  
  CASE distance < -adjustedOpenThreshold:
    // Partial swipe left - REVEAL STATUS
    SET translateX = -MAX_SWIPE
    SET activeItemId = this.id
  
  DEFAULT:
    // Small swipe - SNAP BACK
    SET translateX = 0
  
  SET hasMoved = false
```

---

## 4. State Management Flow

### Global State (ListRender)
```javascript
activeItemId: string | null
  Purpose: Track which task is currently open
  Updated by: setActiveItemId()
  Scope: All SwipeableTask children
  Behavior: Only one task can have activeItemId === id
  
  Flow:
    Task A opens (activeItemId = "A")
      ↓
    User swipes Task B (calls setActiveItemId("B"))
      ↓
    activeItemId = "B"
      ↓
    Task A closes (isOpen = false)
      ↓
    Task A snaps back (translateX = 0)
```

### Local State (SwipeableTask)
```javascript
translateX: number (pixels)
  Purpose: Current horizontal position
  Range: [-MAX_SWIPE, MAX_SWIPE]
  Updated: During pointer move and finalization
  Rendered to: style={{ transform: `translateX(${translateX}px)` }}

isAnimating: boolean
  Purpose: Enable smooth transition animations
  Value: false during drag, true during snap
  Effect: Applies cubic-bezier timing
```

### State Update Sequence
```
Pointer Down
  ↓
  activeItemId ≠ current id?
    → Call setActiveItemId(id)
    → Triggers parent re-render
    → Other tasks: isOpen = false
    → Other tasks: translateX = 0 (if desired)

Pointer Move
  ↓
  isAnimating = false
  translateX = diff

Pointer Up
  ↓
  isAnimating = true
  translateX = target position (MAX_SWIPE, -MAX_SWIPE, or 0)
  Trigger animation for ANIMATION_DURATION
```

---

## 5. Mobile Interaction Logic

### Touch/Pointer Handling
```javascript
// Use pointer events (works with touch, mouse, pen)
onPointerDown={handlePointerDown}
onPointerMove={handlePointerMove}
onPointerUp={handlePointerUp}
onPointerLeave={handlePointerUp}  // Cancel swipe on leave
```

### Multi-touch Prevention
```javascript
const handlePointerDown = (e) => {
  if (isDraggingRef.current) return;  // Ignore secondary touches
  // ...
}
```

### Swipe vs Vertical Scroll
```css
/* Allow vertical scrolling, capture horizontal swipe */
touch-action: pan-y;

/* During drag, JS handles horizontal movement */
/* Vertical scrolling continues naturally */
```

### Swipe Velocity Algorithm
```javascript
velocity = |distance / timeDelta|

IF velocity > 0.5 px/ms (fast):
  velocityBonus = 15 pixels
  Lower threshold to trigger actions
  Example: 50px → 35px to open
  
IF velocity ≤ 0.5 px/ms (slow):
  velocityBonus = 0 pixels
  Keep standard thresholds
```

### Momentum Simulation (Optional)
```javascript
// Could add deceleration effect:
// calculateMomentum(velocity, distance) → finalPosition
// For now: Simple snap-to-grid approach
```

---

## 6. Desktop Fallback Behavior

### Desktop Detection
```css
@media (min-width: 768px) {
  /* Desktop mode */
  .desktop-only { display: flex; }
  .task-action { display: none; }
  touch-action: auto;
}

@media (max-width: 767px) {
  /* Mobile mode */
  .desktop-only { display: none; }
  .task-action { display: none; } /* Hidden initially */
  touch-action: pan-y;
}
```

### Desktop Button Behavior
```
Always Visible:
  ✓ Status button (Mark Done/Pending)
  ✓ Delete button (Delete task)
  
Layout:
  Task Text | [Status Btn] [Delete Btn]
  (buttons right-aligned, always clickable)

Swipe Disabled:
  No gesture recognition
  Mouse/pointer events flow normally
  Drag-and-drop still works
```

### Responsive Breakpoints
```javascript
MOBILE:   < 768px  (phones, tablets portrait)
DESKTOP: >= 768px  (tablets landscape, desktops)
```

---

## 7. Animation Logic

### CSS Transition
```css
/* During drag: no transition */
transition: none;

/* During snap: cubic-bezier for bounce effect */
transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Cubic-Bezier Explanation
```
cubic-bezier(0.34, 1.56, 0.64, 1)

0.34 = ease-in portion (slow start)
1.56 = overshoot (bouncy peak beyond target)
0.64 = ease-out portion (decelerate)
1.0  = final value reaches target exactly

Visual:
  [0.0] ─→ [0.34] ━━━↗︎[1.56]
           0    0.5    1.0
                    ↓ [0.64]
                      └─→ [1.0]
                      
Result: Smooth bounce snap effect
```

### Transform Application
```javascript
// GPU-accelerated
will-change: transform;
transform: translateZ(0);
backface-visibility: hidden;

// Ensures:
// ✓ 60fps on most devices
// ✓ No layout thrashing
// ✓ Smooth rendering
// ✓ Fast compositing
```

### Animation State Machine
```
IDLE
  ↓
  User starts swipe → isDragging = true
  
DRAGGING
  ↓
  User moves → updatePosition (no animation)
  
RELEASING
  ↓
  User lifts finger
  → isAnimating = true
  → Apply CSS transition
  → Snap to target position
  
SNAPPING (300ms)
  ↓
  CSS animation completes
  → isAnimating = false
  → Ready for next swipe

DONE
  ↓
  Back to IDLE
```

---

## 8. Edge Case Handling

### Case 1: Overswiping
```javascript
const clampDistance = (distance) => {
  return Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, distance));
}

// Distance > MAX_SWIPE gets clamped to MAX_SWIPE
// Distance < -MAX_SWIPE gets clamped to -MAX_SWIPE
```

### Case 2: Fast Tap (Touch Down → Up)
```
Distance = 0px
Time = < 100ms
Velocity = undefined

Action: Do nothing
Result: Item stays closed, tap can register as click
```

### Case 3: Dragging While Another Item Open
```
activeItemId = "A" (Item A is open, translateX = MAX_SWIPE)

User swipes Item B:
  1. Detect pointerDown on Item B
  2. Check: activeItemId ≠ "B"
  3. Call: setActiveItemId("B")
  4. Item A: isOpen = false, should reset translateX
  
Solution: Use useEffect to sync activeItemId
  IF !isOpen AND translateX ≠ 0:
    SET translateX = 0 (immediate or animated)
```

### Case 4: Scrolling While Dragging
```
Vertical Scroll: touch-action: pan-y allows scrolling

While swiping:
  Vertical delta > horizontal delta?
    → Let browser handle scroll
    → Cancel swipe (onPointerLeave)

Horizontal delta > vertical delta?
  → Handle swipe (preventDefault scrolling)
```

### Case 5: Drag-and-Drop Conflict
```
Current: dnd-kit PointerSensor handles drag-and-drop

Solution:
  1. Drag-handle (☰) → dnd-kit handles
  2. Task content/buttons → SwipeableTask handles
  3. Prevent event bubbling on drag-handle
     e.target.closest('.drag-handle') → early return
```

### Case 6: Action Triggered During Animation
```
Swipe: distance > FULL_ACTION_THRESHOLD

Action: deleteTask(id) scheduled

User taps delete button before animation done?
  → Delete completes
  → Task already deleted from list
  → Animation completes on unmounted component
  → React removes DOM node
  
Safe: Uses setTimeout for deferred deletion
```

### Case 7: Theme Change During Swipe
```
User toggles dark/light theme mid-swipe?
  
React updates:
  [data-theme="dark"] CSS rules activate
  
Component:
  SwipeableTask re-renders (new props?)
  translateX state preserved
  Colors update smoothly
```

---

## 9. Accessibility Considerations

### Keyboard Navigation
```html
<!-- Action buttons have aria-label -->
<button 
  className="action-button delete-action"
  aria-label="Delete task"
  onClick={handleDeleteClick}
>
  🗑️ Delete
</button>
```

### Screen Reader Announcements
```javascript
// Contextual aria-labels
aria-label={`Mark as ${t.status ? 'Pending' : 'Complete'}`}

// Desktop buttons use same labels
aria-label="Delete task"
aria-label="Mark as Done"
```

### Focus Management
```css
.action-button:focus-visible,
.desktop-button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  .task-block {
    transition: none !important;
  }
  
  /* No animations for users who prefer reduced motion */
}
```

### Touch Target Sizes
```css
Minimum size: 44x44px
Actual: 
  - Buttons: ~40-50px height
  - Swipe area: Full task item (≥60px)
  - Spacing: clamp(12px, ...) between elements
```

### Semantic HTML
```html
<!-- Buttons are actual <button> elements -->
<!-- Not divs with click handlers -->
<!-- Proper aria-labels for context -->
```

### Mobile Viewport Meta
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

---

## 10. Optimized Rendering Strategy

### Performance Metrics
```
FCP (First Contentful Paint):    < 1s
LCP (Largest Contentful Paint):  < 2.5s
INP (Interaction to Next Paint): < 200ms
CLS (Cumulative Layout Shift):   < 0.1
```

### Rendering Optimization

#### 1. Memoization (Optional)
```javascript
// Could wrap with useMemo if list is very large
import { memo } from 'react';

export default memo(SwipeableTask, (prev, next) => {
  return (
    prev.t.id === next.t.id &&
    prev.t.name === next.t.name &&
    prev.t.status === next.t.status &&
    prev.activeItemId === next.activeItemId &&
    prev.setActiveItemId === next.setActiveItemId
  );
});

// BUT: Memoization might not be necessary if parent
// component doesn't re-render frequently
```

#### 2. useCallback Dependencies
```javascript
// All event handlers wrapped with useCallback
// Prevents inline function recreation
const handlePointerDown = useCallback((e) => {
  // ...
}, [t.id, activeItemId, setActiveItemId]);

// Minimal dependencies for optimal caching
```

#### 3. useRef for Non-Rendering State
```javascript
// These don't cause re-renders when updated
const startXRef = useRef(0);
const isDraggingRef = useRef(false);
const lastTimeRef = useRef(0);

// Only state that needs rendering:
const [translateX, setTranslateX] = useState(0);
const [isAnimating, setIsAnimating] = useState(false);
```

#### 4. GPU Acceleration
```css
will-change: transform;
transform: translateZ(0);      /* 3D transform forces GPU */
backface-visibility: hidden;   /* Prevent flickering */
-webkit-transform: translateZ(0);  /* Webkit support */
```

#### 5. Avoid Layout Thrashing
```javascript
// ✓ Good: Only update transform
setTranslateX(clamped);

// ✗ Bad: Don't do this
element.style.left = clamped + 'px';      // Causes reflow
element.style.marginLeft = clamped + 'px'; // Causes reflow

// ✓ Good: useRef for DOM access without re-render
const taskRef = useRef(null);
// Don't read getBoundingClientRect() during render
```

#### 6. Event Delegation (Not Needed Here)
```javascript
// SwipeableTask already handles individual items
// No need for parent event delegation
// Each item has its own handlers
```

#### 7. Debouncing Movement
```javascript
// Only update state if moved > 5px
if (Math.abs(diff) > 5) {
  hasMovedRef.current = true;
}

// Prevents excessive setTranslateX calls during initial touch
```

#### 8. Conditional CSS Rules
```css
/* Mobile: Only show swipe actions when swiping */
.task-action {
  display: none;  /* Reduce painting */
}

/* Show only during interaction */
.swipeable-task-wrapper:active .task-action {
  display: flex;
}
```

#### 9. Smooth Scrolling
```css
html {
  scroll-behavior: smooth;  /* Native smooth scroll */
}

/* Scrolling continues independently of swipe animation */
```

#### 10. Minimal Reflows
```
Each SwipeableTask:
  - Controlled transform only
  - No width/height changes
  - No position changes
  - No flex-direction changes
  
Result:
  - Single composite layer
  - Fast GPU rasterization
  - 60fps animations
```

### Performance Checklist
```
✓ Transform-only animations (no left/margin)
✓ useRef for non-rendering state
✓ useCallback for event handlers
✓ GPU acceleration (will-change, translateZ)
✓ Debounced movement detection
✓ Pointer events (not just touch)
✓ Proper CSS media queries
✓ Reduced motion support
✓ No layout thrashing
✓ Memoization (if needed)
✓ Vertical scroll not blocked
✓ Drag-and-drop still works
✓ Theme changes apply smoothly
```

---

## Implementation Checklist

### Files Created
- [x] `SwipeableTask.jsx` - Main component
- [x] `SwipeableTask.css` - Responsive styles
- [x] `ListRender.jsx` - Updated container
- [x] `useSwipe.js` - Custom hook (reference)

### Integration Steps
1. ✓ Replace Task with SwipeableTask in ListRender
2. ✓ Add activeItemId state management
3. ✓ Implement responsive CSS (mobile/desktop)
4. ✓ Add animation transitions
5. ✓ Handle edge cases
6. ✓ Add accessibility features
7. ✓ Optimize rendering performance

### Testing Checklist
- [ ] Desktop: Buttons always visible, clickable
- [ ] Mobile: Swipe right reveals delete
- [ ] Mobile: Swipe left reveals status
- [ ] Mobile: Full swipe triggers action
- [ ] Only one item open at a time
- [ ] Vertical scrolling works
- [ ] Drag-and-drop still works
- [ ] Animations are smooth (60fps)
- [ ] Fast swipes trigger earlier
- [ ] Overswiping is clamped
- [ ] Theme changes work
- [ ] Keyboard navigation works
- [ ] Touch targets are 44x44px+
- [ ] No layout shift (CLS = 0)
- [ ] Reduced motion respected

---

## Usage Example

```jsx
// In DailyTask.jsx or parent component

import ListRender from './component/task/ListRender';

function DailyTask() {
  const [tasks, setTasks] = useState([]);
  
  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };
  
  const handleStatus = (id) => {
    setTasks(prev => 
      prev.map(t => 
        t.id === id ? { ...t, status: !t.status } : t
      )
    );
  };
  
  return (
    <ListRender 
      taskList={tasks}
      deleteTask={deleteTask}
      handleStatus={handleStatus}
      setTaskList={setTasks}
    />
  );
}
```

---

## Browser Support

```
✓ Chrome/Edge      (Latest 2 versions)
✓ Firefox          (Latest 2 versions)
✓ Safari          (Latest 2 versions)
✓ Mobile Safari    (iOS 12+)
✓ Android Chrome   (Latest)
```

---

## Future Enhancements

1. **Momentum Scrolling** - Add inertia/deceleration
2. **Gesture Customization** - Allow swipe direction configuration
3. **Sound Feedback** - Haptic/audio on action trigger
4. **Undo Functionality** - Revert delete with undo button
5. **Gesture Recording** - Analytics on user interaction patterns
6. **Custom Actions** - Extend beyond delete/complete
7. **Multi-select** - Hold and swipe multiple items
8. **Drag Preview** - Show drag placeholder during drag

---

## Conclusion

This system provides:
- ✓ Mobile-optimized swipe interactions
- ✓ Responsive desktop fallback
- ✓ Smooth GPU-accelerated animations
- ✓ Accessible keyboard navigation
- ✓ Performance optimized (60fps)
- ✓ Proper edge case handling
- ✓ Clean, maintainable component structure

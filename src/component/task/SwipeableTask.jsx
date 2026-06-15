import { useRef, useState, useCallback, useEffect, useContext } from "react";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskEditter from "./editTask";
import "./SwipeableTask.css";
import Timer from "../helpingComponent/CountDown";
import { TaskFunContext } from "../../context/taskFunContext";

export default function SwipeableTask({
  t,
  deleteTask,
  handleStatus,
  activeItemId,
  setActiveItemId,
}) {

  // Drag and drop state
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: t.id,
    });

  const { now } = useContext(TaskFunContext);

  // Swipe state
  const [translateX, setTranslateX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Tracking refs
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastTimeRef = useRef(0);
  const hasMovedRef = useRef(false);
  const taskRef = useRef(null);

  // conditional rendering for notes
  const [isEditing, setIsEditing] = useState(false);

  // Constants
  const MAX_SWIPE = 80;
  const FULL_ACTION_THRESHOLD = 80;
  const ANIMATION_DURATION = 300;

  // Check if this item is currently open
  const isOpen = activeItemId === t.id;

  const timerTimestamp = t.timer ? new Date(t.timer).getTime() : null;
  const isExpired =
    timerTimestamp !== null &&
    !Number.isNaN(timerTimestamp) &&
    typeof now === "number" &&
    timerTimestamp <= now;

  /**
   * Calculate velocity to enable faster swipe detection
   */
  const getVelocity = useCallback((distance, time) => {
    if (time === 0) return 0;
    return Math.abs(distance / time);
  }, []);

  /**
   * Clamp swipe distance to prevent overswiping
   */
  const clampDistance = useCallback((distance) => {
    return Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, distance));
  }, []);

  /**
   * Pointer down - start swipe
   */
  const handlePointerDown = useCallback(
    (e) => {
      // Don't start swipe if using drag handle or already dragging
      if (isDraggingRef.current || e.target.closest(".drag-handle")) return;

      startXRef.current = e.clientX;
      currentXRef.current = e.clientX;
      isDraggingRef.current = true;
      lastTimeRef.current = Date.now();
      hasMovedRef.current = false;

      // Mark this item as active (close others)
      if (activeItemId !== t.id && activeItemId !== null) {
        setActiveItemId(t.id);
      }
    },
    [t.id, activeItemId, setActiveItemId],
  );

  /**
   * Pointer move - update swipe position
   */
  const handlePointerMove = useCallback(
    (e) => {
      if (!isDraggingRef.current) return;

      currentXRef.current = e.clientX;
      const diff = e.clientX - startXRef.current;

      // Mark as moved if distance > 5px (debounce)
      if (Math.abs(diff) > 5) {
        hasMovedRef.current = true;
      }

      // Update position without animation
      if (hasMovedRef.current) {
        setIsAnimating(false);
        const clamped = clampDistance(diff);
        setTranslateX(clamped);
      }
    },
    [clampDistance],
  );
  

  /**
   * Pointer up - finalize swipe
   */
  const handlePointerUp = useCallback(
    (e) => {
      if (!isDraggingRef.current) return;

      isDraggingRef.current = false;
      const timeDelta = Date.now() - lastTimeRef.current;
      const distance = currentXRef.current - startXRef.current;
      const velocity = getVelocity(distance, timeDelta);

      // Velocity bonus for fast swipes
      const velocityBonus = velocity > 0.5 ? 15 : 0;
      const adjustedFullThreshold = FULL_ACTION_THRESHOLD - velocityBonus;

      setIsAnimating(true);

      if (distance > adjustedFullThreshold) {
        // Full swipe right - instant delete
        setTranslateX(MAX_SWIPE);
        setTimeout(() => {
          deleteTask(t.id);
        }, ANIMATION_DURATION);
      } else if (distance < -adjustedFullThreshold) {
        // Full swipe left - instant complete
        setTranslateX(-MAX_SWIPE);
        setTimeout(() => {
          handleStatus(t.id);
          setTranslateX(0);
        }, ANIMATION_DURATION);
      } else {
        // Any partial swipe snaps back to the start
        setTranslateX(0);
      }

      hasMovedRef.current = false;
    },
    [
      t.id,
      deleteTask,
      handleStatus,
      getVelocity,
      setActiveItemId,
      clampDistance,
    ],
  );

  /**
   * Close this item
   */
  const handleClose = useCallback(() => {
    setIsAnimating(true);
    setTranslateX(0);
  }, []);

  /**
   * Handle action button clicks
   */
  const handleDeleteClick = useCallback(() => {
    setIsAnimating(true);
    setTranslateX(0);
    setTimeout(() => {
      deleteTask(t.id);
    }, ANIMATION_DURATION);
  }, [t.id, deleteTask]);

  const handleStatusClick = useCallback(() => {
    setIsAnimating(true);
    setTranslateX(0);
    setTimeout(() => {
      handleStatus(t.id);
    }, ANIMATION_DURATION);
  }, [t.id, handleStatus]);

  // Close other items when this one is being swiped open
  useEffect(() => {
    if (isOpen && translateX !== 0) {
      // Item is open
    }
  }, [isOpen, translateX]);

  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const swipeStyle = {
    transform: `translateX(${translateX}px)`,
    transition: isAnimating
      ? `transform ${ANIMATION_DURATION}ms cubic-bezier(0.34, 1.56, 0.64, 1)`
      : "none",
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        taskRef.current = node;
      }}
      style={dndStyle}
      className="swipeable-task-wrapper"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Left action (Delete) - revealed on swipe right */}
      <div className="task-action task-action-left">
        <button
          className="action-button delete-action"
          onClick={handleDeleteClick}
          aria-label="Delete task"
        >
          🗑️ Delete
        </button>
      </div>

      {/* Right action (Status) - revealed on swipe left */}
      <div className="task-action task-action-right">
        <button
          className="action-button status-action"
          onClick={handleStatusClick}
          aria-label={`Mark as ${t.status ? "Pending" : "Complete"}`}
        >
          {t.status ? "⏳ Pending" : "✓ Complete"}
        </button>
      </div>

      {/* Main task content with swipe animation */}
      <div
        className={`${isEditing ? "edit" : "task-block"} ${t.status ? "completed" : ""} ${isExpired ? "expired" : ""}`}
        style={swipeStyle}
        onDoubleClick={() => setIsEditing(true)}
      >
        
        {!isEditing && (
          <div className="task-content">
            <span className="drag-handle" {...attributes} {...listeners}>
              ☰
            </span>
            <div className="task-text">{t.name}</div>
            {t.timer && <Timer Till={t.timer} className="task-timer" compact />} 
          </div>
        )}
        {/* Codtional rendering for the edit and note */}
        {isEditing && <TaskEditter id={t.id} setIsEditing={setIsEditing} />}
      </div>

      {/* Close hint text (shown when item is open) */}
      {isOpen && translateX !== 0 && (
        <div className="swipe-hint">
          {translateX > 0 ? "← Swipe to delete" : t.status? "Swipe to Complete →": "Swipe to Pending →"}
        </div>
      )}
    </div>
  );
}

import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for handling swipe gestures on todo items
 * Manages:
 * - Swipe tracking and calculation
 * - Threshold detection
 * - Velocity calculation
 * - Animation snapping
 * - Interaction with global active item state
 */

const CONSTANTS = {
  MAX_SWIPE: 80,           // Maximum swipe distance in pixels
  OPEN_THRESHOLD: 50,      // Distance to trigger reveal
  FULL_ACTION_THRESHOLD: 140, // Distance to trigger instant action
  ANIMATION_DURATION: 300, // Snap animation duration (ms)
};

export function useSwipe(itemId, onCloseOther) {
  // Swipe state
  const [translateX, setTranslateX] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [openDirection, setOpenDirection] = useState(null); // 'left' or 'right'
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Tracking state
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastTimeRef = useRef(0);
  const hasMovedRef = useRef(false);

  /**
   * Calculate velocity of the swipe
   * Used to trigger open state earlier on fast swipes
   */
  const getVelocity = useCallback((distance, time) => {
    if (time === 0) return 0;
    return Math.abs(distance / time);
  }, []);

  /**
   * Clamp swipe distance to prevent overswiping
   */
  const clampDistance = useCallback((distance) => {
    return Math.max(-CONSTANTS.MAX_SWIPE, Math.min(CONSTANTS.MAX_SWIPE, distance));
  }, []);

  /**
   * Handle pointer down - start swipe tracking
   */
  const handlePointerDown = useCallback((e) => {
    // Ignore if already dragging (prevents multi-touch issues)
    if (isDraggingRef.current) return;

    startXRef.current = e.clientX;
    currentXRef.current = e.clientX;
    isDraggingRef.current = true;
    lastTimeRef.current = Date.now();
    hasMovedRef.current = false;

    // Close any other open items
    if (onCloseOther) {
      onCloseOther(itemId);
    }
  }, [itemId, onCloseOther]);

  /**
   * Handle pointer move - update swipe position
   */
  const handlePointerMove = useCallback((e) => {
    if (!isDraggingRef.current) return;

    // Prevent default to avoid text selection
    e.preventDefault?.();

    currentXRef.current = e.clientX;
    const diff = e.clientX - startXRef.current;

    // Mark as moved if distance > 5px (debounce small movements)
    if (Math.abs(diff) > 5) {
      hasMovedRef.current = true;
    }

    // Only update if actually moved
    if (hasMovedRef.current) {
      setIsAnimating(false);
      const clamped = clampDistance(diff);
      setTranslateX(clamped);
    }
  }, [clampDistance]);

  /**
   * Handle pointer up - finalize swipe and animate
   */
  const handlePointerUp = useCallback((e) => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    const timeDelta = Date.now() - lastTimeRef.current;
    const distance = currentXRef.current - startXRef.current;
    const velocity = getVelocity(distance, timeDelta);

    // Adjust threshold based on velocity (faster swipes require less distance)
    const velocityBonus = velocity > 0.5 ? 15 : 0; // Bonus pixels for fast swipes
    const adjustedOpenThreshold = CONSTANTS.OPEN_THRESHOLD - velocityBonus;
    const adjustedFullThreshold = CONSTANTS.FULL_ACTION_THRESHOLD - velocityBonus;

    setIsAnimating(true);

    // Determine action based on swipe distance
    if (distance > adjustedFullThreshold) {
      // Full swipe right - delete action
      setOpenDirection('delete');
      setIsOpen(true);
      setTranslateX(CONSTANTS.MAX_SWIPE);
    } else if (distance > adjustedOpenThreshold) {
      // Partial swipe right - reveal delete
      setOpenDirection('delete');
      setIsOpen(true);
      setTranslateX(CONSTANTS.MAX_SWIPE);
    } else if (distance < -adjustedFullThreshold) {
      // Full swipe left - complete action
      setOpenDirection('status');
      setIsOpen(true);
      setTranslateX(-CONSTANTS.MAX_SWIPE);
    } else if (distance < -adjustedOpenThreshold) {
      // Partial swipe left - reveal status
      setOpenDirection('status');
      setIsOpen(true);
      setTranslateX(-CONSTANTS.MAX_SWIPE);
    } else {
      // Small swipe - snap back to center
      closeItem();
    }

    hasMovedRef.current = false;
  }, [getVelocity]);

  /**
   * Close the item and snap back to center
   */
  const closeItem = useCallback(() => {
    setTranslateX(0);
    setIsOpen(false);
    setOpenDirection(null);
  }, []);

  return {
    // State
    translateX,
    isOpen,
    openDirection,
    isAnimating,
    
    // Handlers
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    closeItem,
    
    // Constants
    CONSTANTS,
  };
}

/**
 * Hook to manage global active swipe item
 * Only one item should be open at a time
 */
export function useSwipeManager() {
  const [activeItemId, setActiveItemId] = useState(null);

  const closeOtherItems = useCallback((itemId) => {
    setActiveItemId(itemId);
  }, []);

  return {
    activeItemId,
    setActiveItemId,
    closeOtherItems,
  };
}


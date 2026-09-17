'use client';

import { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';

const DEFAULT_SNAP_POINTS = [0.4, 0.75];

export interface MobileDrawerRef {
  resetScroll: () => void;
}

interface MobileDrawerProps {
  children: React.ReactNode;
  snapPoints?: number[];
}

const MobileDrawer = forwardRef<MobileDrawerRef, MobileDrawerProps>(({ children, snapPoints = DEFAULT_SNAP_POINTS }, ref) => {
  const [activeSnap, setActiveSnap] = useState(snapPoints[0]);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentHeight = activeSnap * 100;

  // Expose scroll reset to parent
  useImperativeHandle(ref, () => ({
    resetScroll: () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    },
  }));

  const handleDragStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    if (drawerRef.current) {
      drawerRef.current.dataset.startY = String(clientY);
    }
  }, []);

  const handleDrag = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const startY = parseFloat(drawerRef.current?.dataset.startY || '0');
    const deltaVh = ((startY - clientY) / window.innerHeight) * 100;
    setDragOffset(deltaVh);
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    const targetHeight = currentHeight + dragOffset;
    const targetFraction = targetHeight / 100;

    // Find closest snap point (never go below minimum)
    let closest = snapPoints[0];
    let minDist = Math.abs(targetFraction - snapPoints[0]);
    for (const sp of snapPoints) {
      const dist = Math.abs(targetFraction - sp);
      if (dist < minDist) {
        minDist = dist;
        closest = sp;
      }
    }

    setActiveSnap(closest);
    setDragOffset(0);
  }, [isDragging, currentHeight, dragOffset]);

  return (
    <div
      ref={drawerRef}
      style={{
        height: isDragging
          ? `${Math.max(10, Math.min(90, currentHeight + dragOffset))}vh`
          : `${currentHeight}vh`,
        transition: isDragging ? 'none' : 'height 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
      }}
      className="fixed bottom-0 left-0 right-0 bg-[#FBFAF8] rounded-t-[16px] shadow-2xl z-40 flex flex-col overflow-hidden"
    >
      {/* Drag Handle */}
      <div
        onMouseDown={handleDragStart}
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDrag}
        onTouchEnd={handleDragEnd}
        className="flex-shrink-0 cursor-grab select-none touch-none py-3"
      >
        <div className="w-9 h-1 bg-gray-300 rounded-full mx-auto" />
      </div>

      {/* Scrollable Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
});

MobileDrawer.displayName = 'MobileDrawer';

export default MobileDrawer;

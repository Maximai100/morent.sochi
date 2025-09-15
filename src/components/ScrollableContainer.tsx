import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ScrollableContainerProps {
  children: ReactNode;
  className?: string;
  maxHeight?: string;
  hideScrollbar?: boolean;
}

export const ScrollableContainer: React.FC<ScrollableContainerProps> = ({
  children,
  className,
  maxHeight = 'calc(100vh - 120px)',
  hideScrollbar = true,
}) => {
  return (
    <div
      className={cn(
        'overflow-y-auto overflow-x-hidden',
        'overscroll-behavior-y-auto overscroll-behavior-x-none',
        '-webkit-overflow-scrolling-touch',
        hideScrollbar && 'hide-scrollbar',
        className
      )}
      style={{
        maxHeight,
        WebkitOverflowScrolling: 'touch',
        overscrollBehaviorY: 'auto',
        overscrollBehaviorX: 'none',
      }}
    >
      {children}
    </div>
  );
};

export default ScrollableContainer;

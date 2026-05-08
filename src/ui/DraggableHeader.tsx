import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from './icons';

interface DraggableHeaderCellProps {
  id: string;
  isLocked: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  colSpan?: number;
}

/**
 * Wraps a <th> with dnd-kit sortable behaviour.
 * When `isLocked` is true (sticky column) it renders a plain, non-draggable <th>.
 */
export const DraggableHeaderCell = ({
  id,
  isLocked,
  children,
  style,
  className,
  colSpan,
}: DraggableHeaderCellProps) => {
  /** 
   * @id - a unique identifier (the column ID) so the system knows WHAT is being moved.
   * @disabled - if true (e.g., for a fixed checkbox column), dragging won't work.
   */
  const {
    attributes,   // ARIA attributes for accessibility
    listeners,    // Event handlers (like onMouseDown) to start the drag
    setNodeRef,   // A 'ref' to the actual HTML element
    transform,    // The X/Y movement data while dragging
    transition,   // The CSS transition for smooth movement
    isDragging,   // Are we currently dragging this item?
  } = useSortable({ id, disabled: isLocked });

  const draggableStyle: React.CSSProperties = isLocked
    ? (style ?? {})
    : {
        ...style,
        // CSS.Transform.toString(transform) converts the drag data 
        // into a real CSS 'translate3d(x, y, z)' string.
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1, // Make it semi-transparent while dragging
        // Keep z-index high while being dragged so it floats above neighbours
        zIndex: isDragging ? 999 : style?.zIndex,
        cursor: isDragging ? 'grabbing' : undefined,
      };

  return (
    <th
      ref={isLocked ? undefined : setNodeRef}
      colSpan={colSpan}
      style={draggableStyle}
      className={className}
      {...(isLocked ? {} : attributes)}
    >
      {/* Drag handle — only rendered for non-locked columns */}
      {!isLocked && (
        <span
          // {...listeners} attaches the 'drag start' events to this icon
          {...listeners}
          className="
            drag-handle
            absolute left-0 top-1/2 -translate-y-1/2
            flex items-center justify-center
            w-4 h-full
            text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400
            cursor-grab active:cursor-grabbing
            opacity-0 group-hover/th:opacity-100
            transition-opacity
            select-none touch-none
            z-10
          "
          title="Drag to reorder"
          aria-label="Drag to reorder column"
        >
          <GripVertical className="h-3 w-3" />
        </span>
      )}
      {children}
    </th>
  );
};

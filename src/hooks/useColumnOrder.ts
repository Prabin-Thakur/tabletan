import { useState, useCallback, useEffect } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

interface UseColumnOrderProps {
  initialOrder: string[];
  lockedIds?: string[];
  onOrderChange?: (newOrder: string[]) => void;
}

export function useColumnOrder({ initialOrder, lockedIds = [], onOrderChange }: UseColumnOrderProps) {
  const [columnOrder, setColumnOrder] = useState<string[]>(initialOrder);
  
  // Sync state if initialOrder changes (important when switching between demos)
  useEffect(() => {
    setColumnOrder(initialOrder);
  }, [initialOrder]);

  /**
   * handleDragEnd is triggered by @dnd-kit when you let go of a dragged item.
   * 
   * @param event - contains information about the 'active' (dragged) and 'over' (target) items.
   */
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      // If we dropped over a valid target AND it's a different item than what we started with
      if (over && active.id !== over.id) {
        setColumnOrder((items) => {
          // Find the current positions of the dragged column and the target column
          const oldIndex = items.indexOf(String(active.id));
          const newIndex = items.indexOf(String(over.id));

          if (oldIndex === -1 || newIndex === -1) return items;
          
          // Safety Check: If either column is 'locked' (like a sticky checkbox), 
          // we don't allow the move.
          if (lockedIds.includes(String(active.id)) || lockedIds.includes(String(over.id))) return items;

          // 'arrayMove' is a helper that swaps the items in the array for us!
          const newOrder = arrayMove(items, oldIndex, newIndex);
          
          // Notify any listeners (like the parent component or persistence layer)
          if (onOrderChange) onOrderChange(newOrder);
          
          return newOrder;
        });
      }
    },
    [lockedIds, onOrderChange]
  );

  return { columnOrder, handleDragEnd };
}

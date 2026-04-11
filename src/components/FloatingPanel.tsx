import { useState, useEffect, useRef, useCallback } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, SlidersHorizontal } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const POS_KEY = 'tageplan_panel_position';
const MIN_KEY = 'tageplan_panel_minimized';
const WIDTH_KEY = 'tageplan_panel_width';

const DEFAULT_POS = { x: 16, y: 16 };
const MIN_WIDTH = 220;
const MAX_WIDTH = 360;
const DEFAULT_WIDTH = 280;
const HANDLE_HEIGHT = 36;

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function FloatingPanel({ children }: { children: React.ReactNode }) {
  const [position, setPosition] = useState(() => loadJSON(POS_KEY, DEFAULT_POS));
  const [minimized, setMinimized] = useState(() => loadJSON(MIN_KEY, false));
  const [width, setWidth] = useState(() => loadJSON(WIDTH_KEY, DEFAULT_WIDTH));
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null!);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);

  // Persist state
  useEffect(() => {
    try { localStorage.setItem(POS_KEY, JSON.stringify(position)); } catch {}
  }, [position]);

  useEffect(() => {
    try { localStorage.setItem(MIN_KEY, JSON.stringify(minimized)); } catch {}
  }, [minimized]);

  useEffect(() => {
    try { localStorage.setItem(WIDTH_KEY, JSON.stringify(width)); } catch {}
  }, [width]);

  const handleDragStop = (_e: DraggableEvent, data: DraggableData) => {
    setPosition({ x: data.x, y: data.y });
    setDragging(false);
  };

  // Resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = width;

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - resizeStartX.current;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, resizeStartWidth.current + delta));
      setWidth(newWidth);
    };

    const onUp = () => {
      setResizing(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [width]);

  const restorePanel = () => {
    setPosition(DEFAULT_POS);
    setMinimized(false);
  };

  return (
    <>
      <Draggable
        nodeRef={nodeRef}
        handle=".panel-drag-handle"
        bounds="parent"
        position={position}
        onStart={() => setDragging(true)}
        onStop={handleDragStop}
        disabled={resizing}
      >
        <div
          ref={nodeRef}
          className="absolute z-50 flex flex-col"
          style={{
            width,
            maxHeight: 'calc(100vh - 72px)',
            borderRadius: 14,
            border: '1px solid hsl(var(--border) / 0.3)',
            background: 'hsl(var(--card))',
            boxShadow: dragging
              ? '0 16px 48px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.04) inset'
              : '0 8px 32px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.04) inset',
            backdropFilter: 'blur(12px)',
            transition: dragging ? 'none' : 'box-shadow 0.2s ease',
          }}
        >
          {/* Drag handle bar */}
          <div
            className="panel-drag-handle flex items-center justify-between px-3 border-b border-border/30 rounded-t-[14px] select-none shrink-0"
            style={{
              height: HANDLE_HEIGHT,
              cursor: dragging ? 'grabbing' : 'grab',
              background: 'hsl(var(--card))',
            }}
          >
            <div className="flex items-center gap-2">
              {/* macOS-style dots */}
              <div className="flex items-center gap-1">
                <span className="w-[10px] h-[10px] rounded-full bg-red-500/70" />
                <span className="w-[10px] h-[10px] rounded-full bg-yellow-500/70" />
                <span className="w-[10px] h-[10px] rounded-full bg-green-500/70" />
              </div>
              <span className="text-xs font-semibold text-foreground ml-1.5 tracking-tight">Trip It!</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setMinimized(m => !m);
              }}
              className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              {minimized ? <Plus className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            </button>
          </div>

          {/* Panel content */}
          <AnimatePresence initial={false}>
            {!minimized && (
              <motion.div
                key="panel-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div
                  className="overflow-y-auto overflow-x-hidden"
                  style={{ maxHeight: 'calc(100vh - 108px)' }}
                >
                  {children}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resize handle on right edge */}
          {!minimized && (
            <div
              className="absolute top-[36px] right-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary/20 transition-colors rounded-r-[14px]"
              onMouseDown={handleResizeStart}
            />
          )}
        </div>
      </Draggable>

      {/* Quick reopen button — only visible when minimized */}
      {minimized && (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={restorePanel}
                className="fixed bottom-5 left-5 z-[60] bg-primary rounded-full w-10 h-10 flex items-center justify-center shadow-lg cursor-pointer text-primary-foreground hover:scale-105 transition-transform"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">Open controls</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  );
}

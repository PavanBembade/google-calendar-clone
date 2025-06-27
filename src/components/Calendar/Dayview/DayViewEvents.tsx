import type { CalendarEvent } from "@/types";
import { format } from "date-fns";
interface DayViewEventsProps {
  eventsForDay: CalendarEvent[];
  getPxPerMinute: () => number;
  setSelectedEvent: (event: CalendarEvent) => void;
  setIsModalOpen: (open: boolean) => void;
}

const DayViewEvents: React.FC<DayViewEventsProps> = ({
  eventsForDay,
  getPxPerMinute,
  setSelectedEvent,
  setIsModalOpen,
}) => {
  // Helper to check overlap
  const isOverlap = (a: CalendarEvent, b: CalendarEvent) =>
    a.start < b.end && b.start < a.end;

  // Build groups of overlapping events
  const positionedEvents: Array<
    CalendarEvent & { col: number; colCount: number }
  > = [];
  const used: boolean[] = Array(eventsForDay.length).fill(false);

  for (let i = 0; i < eventsForDay.length; i++) {
    if (used[i]) continue;
    const group = [eventsForDay[i]];
    used[i] = true;
    for (let j = i + 1; j < eventsForDay.length; j++) {
      if (!used[j] && group.some((ev) => isOverlap(ev, eventsForDay[j]))) {
        group.push(eventsForDay[j]);
        used[j] = true;
      }
    }
    // Assign columns
    group.forEach((ev, idx) => {
      positionedEvents.push({
        ...ev,
        col: idx,
        colCount: group.length,
      });
    });
  }

  return (
    <>
      {positionedEvents.map((event) => {
        const startMinutes =
          event.start.getHours() * 60 + event.start.getMinutes();
        const endMinutes = event.end.getHours() * 60 + event.end.getMinutes();
        const pxPerMinute = getPxPerMinute();
        const top = startMinutes * pxPerMinute;
        const height = Math.max((endMinutes - startMinutes) * pxPerMinute, 24);

        // Calculate width and left offset for side-by-side display
        const widthPercent = 100 / event.colCount;
        const leftPercent = event.col * widthPercent;

        return (
          <button
            key={event.id}
            className="absolute bg-blue-500 text-white text-xs p-2 rounded shadow overflow-hidden cursor-pointer hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 z-10 hover:z-20"
            style={{
              top,
              height,
              left: `calc(${leftPercent}% + 0.5rem)`,
              width: `calc(${widthPercent}% - 1rem)`,
              zIndex: 10,
            }}
            title={event.description || ""}
            tabIndex={0}
            aria-label={`Event: ${event.title} at ${format(
              event.start,
              "HH:mm"
            )}`}
            onClick={() => {
              setSelectedEvent(event);
              setIsModalOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setSelectedEvent(event);
                setIsModalOpen(true);
              }
            }}
          >
            <span className="block truncate">{event.title}</span>
          </button>
        );
      })}
    </>
  );
};

export default DayViewEvents;

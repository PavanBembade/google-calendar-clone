import { useMemo, useState } from "react";
import {
  startOfWeek,
  addDays,
  format,
  isToday,
  startOfDay,
  addHours,
  endOfDay,
  min,
  max,
  isBefore,
  isAfter,
} from "date-fns";
import { useCalendar } from "../../context/CalendarContext/useCalendar";
import EventDetailsModal from "./EventDetailsModal";
import EventFormModal from "./EventFormModal";
import type { PositionedEvent } from "@/types";

// Types can be moved to a shared types file for DRYness

const CELL_HEIGHT = 48; // px, matches h-12

const WeekView = () => {
  const { currentDate, events, setView, setCurrentDate } = useCalendar();
  const [selectedEvent, setSelectedEvent] = useState<PositionedEvent | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [eventFormDate, setEventFormDate] = useState<Date | null>(null);

  // Memoized values for performance
  const start = useMemo(
    () => startOfWeek(currentDate, { weekStartsOn: 0 }),
    [currentDate]
  );
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(start, i)),
    [start]
  );
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const referenceDate = useMemo(() => startOfDay(new Date(2000, 0, 1)), []);

  // Helper: Get events for a day, split multi-day events
  const getEventsForDay = (day: Date): PositionedEvent[] => {
    return events
      .filter((event) => {
        const isSameDay =
          event.start.getFullYear() === event.end.getFullYear() &&
          event.start.getMonth() === event.end.getMonth() &&
          event.start.getDate() === event.end.getDate();
        return (
          isSameDay &&
          isBefore(event.start, addDays(startOfDay(day), 1)) &&
          isAfter(event.end, startOfDay(day))
        );
      })
      .map((event) => {
        const eventStart = max([event.start, startOfDay(day)]);
        const eventEnd = min([event.end, endOfDay(day)]);
        return {
          ...event,
          day,
          eventStart,
          eventEnd,
          col: 0,
          colCount: null,
        };
      });
  };

  // Helper: Stack overlapping events
  const getPositionedEvents = (
    eventsForDay: PositionedEvent[]
  ): PositionedEvent[] => {
    const sorted = [...eventsForDay].sort(
      (a, b) => a.eventStart.getTime() - b.eventStart.getTime()
    );
    const positioned: PositionedEvent[] = [];
    const columns: Date[] = [];

    sorted.forEach((event) => {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        if (isAfter(event.eventStart, columns[i])) {
          columns[i] = event.eventEnd;
          positioned.push({ ...event, col: i, colCount: null });
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push(event.eventEnd);
        positioned.push({ ...event, col: columns.length - 1, colCount: null });
      }
    });

    const maxCol = columns.length;
    return positioned.map((e) => ({ ...e, colCount: maxCol }));
  };

  // Helper: Get multi-day events for the week
  const getMultiDayEvents = () => {
    return events.filter((event) => {
      const eventStart = startOfDay(event.start);
      const eventEnd = startOfDay(event.end);
      const weekStart = startOfDay(days[0]);
      const weekEnd = startOfDay(days[6]);
      const isMultiDay =
        format(event.start, "yyyy-MM-dd") !== format(event.end, "yyyy-MM-dd");
      const overlaps =
        isBefore(eventStart, addDays(weekEnd, 1)) &&
        isAfter(eventEnd, addDays(weekStart, -1));
      return isMultiDay && overlaps;
    });
  };

  // Helper: Get index of a day in the week
  const getDayIndex = (date: Date) => {
    return days.findIndex(
      (day) =>
        day.getFullYear() === date.getFullYear() &&
        day.getMonth() === date.getMonth() &&
        day.getDate() === date.getDate()
    );
  };

  // Helper: Get stacked multi-day events for the week
  const stackedMultiDayEvents = useMemo(() => {
    const multiDayEvents = getMultiDayEvents();
    const rows: PositionedEvent[][] = [];

    multiDayEvents.forEach((event) => {
      const startIdx = getDayIndex(event.start);
      const endIdx = getDayIndex(event.end);

      if (
        (endIdx < 0 && event.end < days[0]) ||
        (startIdx > 6 && event.start > days[6])
      )
        return;

      const eventStartIdx = Math.max(startIdx, 0);
      const eventEndIdx = Math.min(endIdx === -1 ? 6 : endIdx, 6);

      let placed = false;
      for (const row of rows) {
        const hasOverlap = row.some(
          (e) =>
            !(
              eventEndIdx < (e.startIdx ?? 0) || eventStartIdx > (e.endIdx ?? 0)
            )
        );
        if (!hasOverlap) {
          row.push({
            ...event,
            day: event.start,
            eventStart: event.start,
            eventEnd: event.end,
            col: eventStartIdx,
            colCount: eventEndIdx - eventStartIdx + 1,
            startIdx: eventStartIdx,
            endIdx: eventEndIdx,
          });
          placed = true;
          break;
        }
      }
      if (!placed) {
        rows.push([
          {
            ...event,
            day: event.start,
            eventStart: event.start,
            eventEnd: event.end,
            col: eventStartIdx,
            colCount: eventEndIdx - eventStartIdx + 1,
            startIdx: eventStartIdx,
            endIdx: eventEndIdx,
          },
        ]);
      }
    });

    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, days]);

  const handleEventClick = (event: PositionedEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  // Handler to open event form modal with clicked date/time
  const handleTimeCellClick = (day: Date, hour: number) => {
    const date = new Date(day);
    date.setHours(hour, 0, 0, 0);
    setEventFormDate(date);
    setIsEventFormOpen(true);
  };

  return (
    <div className="w-full relative ">
      {/* Header Row */}
      <div
        className="grid grid-cols-8 sticky top-0 z-30 min-w-[700px] sm:min-w-[900px] mb-2"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div
          className="border-r border-b px-2 py-2 text-xs font-medium text-gray-600 sticky left-0 "
          style={{ backgroundColor: "var(--background)" }}
        >
          Time
        </div>
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={`flex flex-col text-center px-2 py-2 text-xs font-semibold ${
              isToday(day)
                ? "text-blue-700 border-2 border-blue-500 bg-blue-50"
                : "border-r border-b"
            }`}
          >
            <span className="text-[11px] font-normal">
              {format(day, "EEE").toUpperCase()}
            </span>
            <span>
              <span
                className={`text-[24px] font-normal rounded-full px-2 py-1 cursor-pointer transition-colors duration-150 ${
                  isToday(day)
                    ? "text-blue-500 bg-blue-100"
                    : "hover:bg-gray-100 focus:bg-gray-200"
                }`}
                aria-label={isToday(day) ? "Today" : undefined}
                aria-current={isToday(day) ? "date" : undefined}
                title={format(day, "EEEE, MMMM d, yyyy")}
                tabIndex={0}
                onClick={() => {
                  setView("day");
                  setCurrentDate(day);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setView("day");
                    setCurrentDate(day);
                  }
                }}
              >
                {format(day, "d")}
              </span>
            </span>
          </div>
        ))}
      </div>

      {/* Multi-day/all-day events row */}
      <div
        className="grid grid-cols-8 min-w-[700px] sm:min-w-[900px] relative"
        style={{ height: `${stackedMultiDayEvents.length * 28}px` }}
      >
        <div /> {/* Empty cell for time label */}
        <div className="col-span-7 relative">
          {stackedMultiDayEvents.map((row, rowIndex) =>
            row.map((event) => (
              <div
                key={event.id}
                className="absolute flex items-center bg-blue-100 text-blue-700 font-medium text-xs shadow px-2 py-1 rounded-[6px] shadow hover:bg-blue-600 transition-colors duration-150 cursor-pointer"
                style={{
                  left: `calc(${((event.startIdx ?? 0) * 100) / 7}% + 2px)`,
                  width: `calc(${
                    (((event.endIdx ?? 0) - (event.startIdx ?? 0) + 1) * 100) /
                    7
                  }% - 4px)`,
                  top: rowIndex * 22,
                  height: 20,
                  zIndex: 10,
                  minWidth: 0,
                  maxWidth: "100%",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
                title={event.description || event.title}
                aria-label={event.title}
                tabIndex={0}
                onClick={() => {
                  handleEventClick(event);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleEventClick(event);
                  }
                }}
              >
                {event.start < days[0] && <span className="mr-1">←</span>}
                <span className="truncate">{event.title}</span>
                <span className="ml-2 text-[10px] font-normal">
                  {format(event.start, "MMM d")} - {format(event.end, "MMM d")}
                </span>
                {event.end > days[6] && <span className="ml-1">→</span>}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Time Grid */}
      <div className="grid grid-cols-8 min-w-[700px] sm:min-w-[900px] relative">
        {/* Time labels */}
        <div
          className="flex flex-col sticky left-0 z-20"
          style={{ backgroundColor: "var(--background)" }}
        >
          {hours.map((hour) => (
            <div
              key={hour}
              className="border-r border-b text-right pr-2 text-xs font-medium h-12 py-2 border-gray-200"
              style={{ height: CELL_HEIGHT }}
            >
              {format(addHours(referenceDate, hour), "h a")}
            </div>
          ))}
        </div>
        {/* Day columns */}
        {days.map((day) => {
          const eventsForDay = getEventsForDay(day);
          const positionedEvents = getPositionedEvents(eventsForDay);

          return (
            <div
              key={day.toISOString()}
              className="border-r border-b relative"
              style={{ backgroundColor: "var(--background)" }}
            >
              {/* Hour grid lines */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 border-b border-gray-100"
                  style={{
                    top: hour * CELL_HEIGHT,
                    height: CELL_HEIGHT,
                    pointerEvents: "none",
                  }}
                />
              ))}
              {/* Clickable time cells */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 cursor-pointer"
                  style={{
                    top: hour * CELL_HEIGHT,
                    height: CELL_HEIGHT,
                    zIndex: 1,
                  }}
                  onClick={() => handleTimeCellClick(day, hour)}
                  title={`Add event at ${format(day, "yyyy-MM-dd")} ${hour}:00`}
                  aria-label={`Add event at ${format(
                    day,
                    "yyyy-MM-dd"
                  )} ${hour}:00`}
                />
              ))}
              {/* Events */}
              {positionedEvents.map((event) => {
                const startMinutes =
                  (event.eventStart.getHours() +
                    event.eventStart.getMinutes() / 60) *
                  60;
                const endMinutes =
                  (event.eventEnd.getHours() +
                    event.eventEnd.getMinutes() / 60) *
                  60;
                const top = (startMinutes / 60) * CELL_HEIGHT;
                const height = ((endMinutes - startMinutes) / 60) * CELL_HEIGHT;

                const colCount = event.colCount ?? 1;
                const width = `calc(${100 / colCount}% - 4px)`;
                const left = `calc(${(event.col * 100) / colCount}% + 2px)`;

                return (
                  <div
                    key={event.id}
                    className="absolute bg-blue-500 text-white text-xs p-1 rounded shadow overflow-hidden whitespace-nowrap text-ellipsis cursor-pointer hover:bg-blue-600 transition-colors duration-150"
                    style={{
                      top,
                      height: Math.max(height, 20),
                      left,
                      width,
                      minWidth: 0,
                      zIndex: 10 + event.col,
                    }}
                    title={event.description || event.title}
                    aria-label={event.title}
                    tabIndex={0}
                    onClick={() => {
                      handleEventClick(event);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleEventClick(event);
                      }
                    }}
                  >
                    <span className="block">{event.title}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && selectedEvent && (
        <EventDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedEvent.title}
          start={selectedEvent.eventStart}
          end={selectedEvent.eventEnd}
          description={selectedEvent.description}
        />
      )}

      {/* Event Form Modal */}
      {isEventFormOpen && (
        <EventFormModal
          isOpen={isEventFormOpen}
          onClose={() => setIsEventFormOpen(false)}
          defaultDate={eventFormDate ?? undefined}
        />
      )}
    </div>
  );
};

export default WeekView;

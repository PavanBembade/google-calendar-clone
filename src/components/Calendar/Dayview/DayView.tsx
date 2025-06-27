import { useEffect, useMemo, useState } from "react";
import { useCalendar } from "../../../context/CalendarContext/useCalendar";
import {
  format,
  isToday,
  differenceInMinutes,
  startOfDay,
  isAfter,
  isBefore,
  isEqual,
} from "date-fns";
import type { CalendarEvent } from "@/types";
import EventDetailsModal from "../EventDetailsModal";
import DayViewEvents from "./DayViewEvents";

const HOUR_HEIGHT_MOBILE = 48;
const HOUR_HEIGHT_DESKTOP = 64;

// Helper to format hour in 12-hour AM/PM
const formatHour = (hour: number) => {
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 ? "AM" : "PM";
  return `${displayHour}:00 ${ampm}`;
};

const DayView = () => {
  const { currentDate, events = [] } = useCalendar();
  const [nowOffset, setNowOffset] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  // Responsive px per minute
  const getPxPerMinute = () =>
    window.innerWidth < 640
      ? HOUR_HEIGHT_MOBILE / 60
      : HOUR_HEIGHT_DESKTOP / 60;

  // Memoized events for the day
  const eventsForDay = useMemo(
    () =>
      events.filter(
        (event: CalendarEvent) =>
          format(event.start, "yyyy-MM-dd") ===
            format(currentDate, "yyyy-MM-dd") &&
          format(event.start, "yyyy-MM-dd") === format(event.end, "yyyy-MM-dd")
      ),
    [events, currentDate]
  );

  // Memoized multi-day events
  const multiDayEvents = useMemo(() => {
    const current = startOfDay(currentDate);
    return events.filter((event: CalendarEvent) => {
      const start = startOfDay(event.start);
      const end = startOfDay(event.end);
      return (
        (isEqual(current, start) || isAfter(current, start)) &&
        (isEqual(current, end) || isBefore(current, end)) &&
        format(event.start, "yyyy-MM-dd") !== format(event.end, "yyyy-MM-dd")
      );
    });
  }, [events, currentDate]);

  // Current time indicator
  useEffect(() => {
    const updateTime = () => {
      if (isToday(currentDate)) {
        const minutesSinceMidnight = differenceInMinutes(
          new Date(),
          startOfDay(new Date())
        );
        setNowOffset(minutesSinceMidnight * getPxPerMinute());
      } else {
        setNowOffset(null);
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    window.addEventListener("resize", updateTime);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", updateTime);
    };
  }, [currentDate]);

  return (
    <div className="w-full relative px-2 sm:px-4">
      {/* Top date header */}
      <div className="flex sticky bg-white top-0 z-20 w-full p-2 mb-2 border-b border-gray-200">
        <div className="w-14 sm:w-16" />
        <div className="w-fit flex flex-col items-center">
          <span className="text-[11px] font-medium text-gray-500">
            {format(currentDate, "EEE").toUpperCase()}
          </span>
          <span className="flex h-full">
            <span className="px-[9px] text-[26px] rounded-full font-normal cursor-pointer inline-block transition">
              {format(currentDate, "d")}
            </span>
          </span>
        </div>
      </div>

      {/* Multi-day events at the top */}
      <div className="flex flex-col gap-1 mb-2">
        {multiDayEvents.map((event) => (
          <div className="flex" key={event.id} title={event.description || ""}>
            <div className="w-14 sm:w-16" />
            <div className="bg-blue-100 text-blue-700 font-medium text-xs px-2 py-1 rounded-[6px] shadow w-full max-w-full truncate">
              <span className="truncate">{event.title}</span>
              <span className="ml-2 text-[10px] font-normal">
                {format(event.start, "MMM d")} - {format(event.end, "MMM d")}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="relative rounded overflow-x-auto p-2">
        <div className="flex min-w-[320px] sm:min-w-0 relative">
          {/* Hours column */}
          <div className="flex flex-col w-14 sm:w-16 bg-white z-10">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-12 sm:h-16 flex items-start justify-end pr-2 text-[10px] sm:text-xs font-medium pt-1 border-t border-gray-200"
              >
                {formatHour(hour)}
              </div>
            ))}
          </div>
          {/* Vertical border */}
          <div className="w-px bg-gray-200" />
          {/* Main content column */}
          <div className="flex-1 flex flex-col relative overflow-y-auto min-h-[600px]">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-12 sm:h-16 border-t border-gray-200 relative"
              />
            ))}
            {eventsForDay.length === 0 && multiDayEvents.length === 0 && (
              <div className="absolute left-0 right-0 top-1/6 -translate-y-1/6 text-center text-gray-400 text-sm">
                No events for this day.
              </div>
            )}
            {/* Renders the events for a single day within the DayView calendar */}
            <DayViewEvents
              eventsForDay={eventsForDay}
              getPxPerMinute={getPxPerMinute}
              setSelectedEvent={setSelectedEvent}
              setIsModalOpen={setIsModalOpen}
            />
            {/* ⏱️ Current time indicator */}
            {nowOffset !== null && (
              <div
                className="absolute left-0 right-0 h-0.5 bg-red-500 pointer-events-none z-10 shadow"
                style={{
                  top: `${nowOffset}px`,
                  marginLeft: window.innerWidth < 640 ? "0.5rem" : "1rem",
                }}
              >
                <div className="w-2 h-2 bg-red-500 rounded-full absolute -top-1 left-0 border border-white shadow" />
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Event details modal */}
      {isModalOpen && selectedEvent && (
        <EventDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedEvent.title}
          start={selectedEvent.start}
          end={selectedEvent.end}
          description={selectedEvent.description}
        />
      )}
    </div>
  );
};

export default DayView;

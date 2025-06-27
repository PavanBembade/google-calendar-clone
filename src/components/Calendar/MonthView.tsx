// src/components/Calendar/MonthView.tsx
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { useCalendar } from "../../context/CalendarContext/useCalendar";
import { useState } from "react";
import EventDetailsModal from "./EventDetailsModal";
import EventFormModal from "./EventFormModal";
import type { SelectedEvent } from "@/types";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MAX_EVENTS_DISPLAY = 2;

const MonthView = () => {
  const { currentDate, events } = useCalendar();

  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Add state for EventFormModal
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [eventFormDefaults, setEventFormDefaults] = useState<{
    date: Date;
  } | null>(null);

  const start = startOfWeek(startOfMonth(currentDate));
  const end = endOfWeek(endOfMonth(currentDate));

  const days: Date[] = [];
  let day = start;
  while (day <= end) {
    days.push(day);
    day = addDays(day, 1);
  }
  return (
    <div className="relative grid grid-cols-7 bg-white  transition-colors">
      {/* Weekday headers */}
      <div className="hidden md:grid absolute top-2 w-full z-10 grid-cols-7 text-[0.7rem] md:text-xs text-[#444746] font-medium text-center pointer-events-none">
        {WEEKDAYS.map((d, i) => (
          <div key={i}>
            <span>{d}</span>
          </div>
        ))}
      </div>
      {/* Weekday headers (show above calendar in mobile) */}
      <div className="grid md:hidden col-span-7 w-full grid-cols-7 text-[0.7rem] text-[#444746] font-medium text-center mb-1">
        {WEEKDAYS.map((d, i) => (
          <div key={i}>
            <span>{d.slice(0, 3)}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {days.map((date) => {
        const dayEvents = events.filter((event) =>
          isSameDay(new Date(event.start), date)
        );
        const extraEvents = dayEvents.length - MAX_EVENTS_DISPLAY;

        return (
          <div
            key={date.toISOString()}
            className={`p-1 text-xs sm:text-sm relative border flex flex-col transition-colors
              ${isSameDay(date, new Date()) ? "" : "border-[#dde3ea]"}
              ${
                !isSameMonth(date, currentDate)
                  ? "bg-gray-100 text-gray-400 opacity-70"
                  : ""
              }
              min-h-[80px] sm:min-h-[100px]`}
            tabIndex={0}
            aria-label={format(date, "EEEE, MMMM d")}
            onClick={() => {
              setEventFormDefaults({ date });
              setIsEventFormOpen(true);
            }}
          >
            {/* Day number */}
            <div className="flex items-start justify-end p-1">
              <span
                className={`rounded-full w-7 h-7 flex items-center justify-center font-medium text-[0.7rem] sm:text-xs
                  ${isSameDay(date, new Date()) ? "bg-blue-600 text-white" : ""}
                  ${!isSameMonth(date, currentDate) ? "text-gray-400" : ""}
                `}
              >
                {format(date, "d")}
              </span>
            </div>

            {/* Event List */}
            <div
              className="space-y-1 overflow-y-auto max-h-20"
              onClick={(e) => e.stopPropagation()}
            >
              {dayEvents.slice(0, MAX_EVENTS_DISPLAY).map((event) => (
                <button
                  key={event.id}
                  className="w-full text-left cursor-pointer bg-blue-100 text-blue-700 font-medium text-xs rounded-[6px] shadow px-1 py-0.5 hover:bg-blue-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                  tabIndex={0}
                  aria-label={`Event: ${event.title} at ${format(
                    new Date(event.start),
                    "HH:mm"
                  )}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent({
                      ...event,
                      eventStart: new Date(event.start),
                      eventEnd: new Date(event.end),
                    });
                    setIsModalOpen(true);
                  }}
                >
                  <span className="font-semibold">
                    {format(new Date(event.start), "HH:mm")}
                  </span>{" "}
                  {event.title}
                </button>
              ))}
              {extraEvents > 0 && (
                <div
                  className="text-blue-500 text-xs cursor-pointer hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  +{extraEvents} more
                </div>
              )}
            </div>
          </div>
        );
      })}
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
      {isEventFormOpen && eventFormDefaults && (
        <EventFormModal
          isOpen={isEventFormOpen}
          onClose={() => setIsEventFormOpen(false)}
          defaultDate={eventFormDefaults.date}
        />
      )}
    </div>
  );
};

export default MonthView;

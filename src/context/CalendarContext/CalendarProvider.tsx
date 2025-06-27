// src/context/CalendarContext.tsx
import { useState } from "react";
import type { ReactNode } from "react";
import type { CalendarEvent, ViewType } from "../../types";
import CalendarContext from "./CalendarContext";
import { mockEvents } from "../../constants/constant";

const CalendarProvider = ({ children }: { children: ReactNode }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>("month");
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);

  const addEvent = (event: CalendarEvent) => {
    setEvents((prev) => [...prev, event]);
  };

  const editEvent = (updated: CalendarEvent) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === updated.id ? updated : ev))
    );
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  return (
    <CalendarContext.Provider
      value={{
        currentDate,
        setCurrentDate,
        view,
        setView,
        events,
        addEvent,
        editEvent,
        deleteEvent,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export default CalendarProvider;

// src/hooks/useCalendar.ts
import { useContext } from "react";
import {} from "./CalendarProvider";
import CalendarContext from "./CalendarContext";

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context)
    throw new Error("useCalendar must be used inside CalendarProvider");
  return context;
};

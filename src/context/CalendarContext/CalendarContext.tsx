import { createContext } from "react";
import type { CalendarContextType } from "../../types";

const CalendarContext = createContext<CalendarContextType | null>(null);

export default CalendarContext;

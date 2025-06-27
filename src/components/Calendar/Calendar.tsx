import { useCalendar } from "../../context/CalendarContext/useCalendar";
import CalendarHeader from "./CalendarHeader";
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import DayView from "./Dayview/DayView";
import { useState, useEffect } from "react";

const Calendar = () => {
  const { view } = useCalendar();
  const [currentView, setCurrentView] = useState(view);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    setFade(false);
    const timeout = setTimeout(() => {
      setCurrentView(view);
      setFade(true);
    }, 100);
    return () => clearTimeout(timeout);
  }, [view]);

  return (
    <>
      <main role="main" className="w-full h-full flex flex-col overflow-hidden">
        <CalendarHeader />
        <div className="w-full h-[calc(100vh-100px)] overflow-auto bg-white dark:bg-gray-900 shadow-md rounded-[1.75rem] z-10">
          <div
            className={`transition-opacity duration-300 ${
              fade ? "opacity-100" : "opacity-0"
            }`}
            key={currentView}
          >
            {currentView === "month" && <MonthView />}
            {currentView === "week" && <WeekView />}
            {currentView === "day" && <DayView />}
          </div>
        </div>
      </main>
    </>
  );
};

export default Calendar;

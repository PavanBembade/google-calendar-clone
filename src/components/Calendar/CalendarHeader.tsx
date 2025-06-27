import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfWeek,
} from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { useCalendar } from "../../context/CalendarContext/useCalendar";
import { useState } from "react";
import EventFormModal from "./EventFormModal";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

const VIEWS = ["day", "week", "month"] as const;
type CalendarView = (typeof VIEWS)[number];
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const CalendarHeader = () => {
  const { currentDate, setCurrentDate, view, setView } = useCalendar();
  const [showEventModal, setShowEventModal] = useState(false);

  const handlePrev = () => {
    switch (view) {
      case "month":
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case "week":
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case "day":
        setCurrentDate(subDays(currentDate, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (view) {
      case "month":
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case "week":
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case "day":
        setCurrentDate(addDays(currentDate, 1));
        break;
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getWeekLabel = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const end = addDays(start, 6);
    return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
  };

  return (
    <header className="sticky top-0 z-20  shadow-sm px-2 py-2 mb-2 border-b border-gray-100">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            className="flex items-center justify-center rounded-full bg-blue-600 text-white font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
            style={{
              width: 36,
              height: 36,
              fontSize: 20,
              lineHeight: "36px",
              userSelect: "none",
            }}
            aria-label="Go to today"
            onClick={handleToday}
          >
            {format(new Date(), "d")}
          </button>
          <span className="text-xl font-semibold tracking-tight">Calendar</span>
        </div>

        {/* Center: Navigation & Date */}
        <div className="flex flex-row items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToday}
              className="px-4 py-2 rounded-full border border-gray-300  hover:bg-gray-100 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
              aria-label="Go to today"
            >
              Today
            </button>
            <button
              onClick={handlePrev}
              className="p-2 rounded-full hover:bg-gray-100 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
              aria-label="Previous"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <polyline
                  points="15 18 9 12 15 6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-full hover:bg-gray-100 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
              aria-label="Next"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <polyline
                  points="9 6 15 12 9 18"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div className="text-base md:text-lg font-medium truncate max-w-[180px] sm:max-w-none px-2">
            {view === "month" && format(currentDate, "MMMM yyyy")}
            {view === "week" && getWeekLabel()}
            {view === "day" && format(currentDate, "EEEE, MMM d, yyyy")}
          </div>
        </div>

        {/* Right: View Switcher & Create Event */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Desktop Tabs */}
          <Tabs
            value={view}
            onValueChange={(value) => setView(value as CalendarView)}
            className="hidden md:block"
          >
            <TabsList className="bg-gray-100 rounded-full p-1 flex gap-2">
              {VIEWS.map((v) => (
                <TabsTrigger
                  key={v}
                  value={v}
                  className="px-4 py-2 rounded-full cursor-pointer text-sm font-medium capitalize data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-700 transition-colors"
                >
                  {capitalize(v)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {/* Mobile Dropdown */}
          <div className="w-full block md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between capitalize"
                  aria-label="Select calendar view"
                >
                  {capitalize(view)}
                  <svg
                    className="ml-2 h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M6 8l4 4 4-4"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={4}
                className="min-w-[140px] w-auto rounded-md bg-white shadow-lg py-1"
              >
                {VIEWS.map((v) => (
                  <DropdownMenuItem
                    key={v}
                    onSelect={() => setView(v)}
                    className="capitalize px-4  z-50 py-2 cursor-pointer hover:bg-gray-100 focus:bg-gray-200 text-gray-800 transition-colors"
                  >
                    {capitalize(v)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button
            onClick={() => setShowEventModal(true)}
            className="ml-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-full transition flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
            aria-label="Create event"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 4v16m8-8H4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="hidden sm:inline">Create Event</span>
            <span className="sm:hidden">New</span>
          </Button>
          <EventFormModal
            isOpen={showEventModal}
            onClose={() => setShowEventModal(false)}
          />
        </div>
      </div>
    </header>
  );
};

export default CalendarHeader;

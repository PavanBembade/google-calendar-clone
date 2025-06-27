import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { useCalendar } from "@/context/CalendarContext/useCalendar";
import type {
  CalendarEvent,
  EventFormModalProps as BaseEventFormModalProps,
} from "@/types";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface EventFormModalProps extends BaseEventFormModalProps {
  defaultDate?: Date;
}

// Event type for DRYness

function getDefaultTimes(dateOverride?: Date) {
  const now = dateOverride ? new Date(dateOverride) : new Date();
  const minutes = now.getMinutes();
  const roundedMinutes = minutes < 30 ? 0 : 30;
  const start = new Date(now);
  start.setMinutes(roundedMinutes, 0, 0);

  const end = new Date(start);
  end.setMinutes(start.getMinutes() + 30);

  const pad = (n: number) => n.toString().padStart(2, "0");
  const startTime = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
  const endTime = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
  const dateStr = now.toLocaleDateString("en-CA"); // yyyy-mm-dd

  return { startDate: dateStr, endDate: dateStr, startTime, endTime };
}

const generateTimeOptions = () => {
  const times: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour24 = h.toString().padStart(2, "0");
      const min = m.toString().padStart(2, "0");
      const value = `${hour24}:${min}`;
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? "AM" : "PM";
      const label = `${hour12}:${min} ${ampm}`;
      times.push({ value, label });
    }
  }
  return times;
};

const timeOptions = generateTimeOptions();

// Helper to generate a unique id (simple version)
const generateId = () => Date.now().toString();

function EventFormModal({ isOpen, onClose, defaultDate }: EventFormModalProps) {
  const defaults = getDefaultTimes(defaultDate);
  const { addEvent } = useCalendar();

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(defaults.startDate);
  const [startTime, setStartTime] = useState(defaults.startTime);
  const [endDate, setEndDate] = useState(defaults.endDate);
  const [endTime, setEndTime] = useState(defaults.endTime);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);

    if (end <= start) {
      setError("End time must be after start time.");
      return;
    }

    const newEvent: CalendarEvent = {
      id: generateId(),
      title,
      description,
      start,
      end,
    };

    addEvent(newEvent);

    setTitle("");
    setStartDate(defaults.startDate);
    setStartTime(defaults.startTime);
    setEndDate(defaults.endDate);
    setEndTime(defaults.endTime);
    setDescription("");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-full max-w-md sm:max-w-[700px] rounded-2xl p-0 bg-gradient-to-br from-white via-blue-50 to-blue-100 border border-blue-200 shadow-2xl"
        aria-labelledby="event-form-title"
        aria-describedby="event-form-desc"
      >
        <form onSubmit={handleSubmit} autoComplete="off">
          <DialogHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-2 border-b">
            <DialogTitle asChild>
              <VisuallyHidden>
                <h2 id="event-form-title">Add Event</h2>
              </VisuallyHidden>
            </DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            <div id="event-form-desc" className="sr-only">
              Fill out the form to add a new event to your calendar.
            </div>
          </DialogDescription>

          <div className="px-4 pt-4 pb-2 sm:px-6">
            <label htmlFor="event-title" className="sr-only">
              Title
            </label>
            <Input
              id="event-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Add title"
              className="mb-4 text-lg font-medium bg-gray-100 border-0 rounded w-full focus:ring-2 focus:ring-blue-500"
              autoFocus
              aria-invalid={!!error}
              aria-describedby={error ? "event-title-error" : undefined}
            />

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
              {/* Start Date & Time */}
              <div className="flex flex-col sm:flex-row gap-2 flex-1">
                <label htmlFor="event-start-date" className="sr-only">
                  Start date
                </label>
                <Input
                  id="event-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full bg-gray-100 border-0 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="event-start-time" className="sr-only">
                  Start time
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-gray-100 border-0 rounded px-2 py-2 text-left min-w-[80px] sm:min-w-[120px] text-sm sm:text-base w-full sm:w-auto"
                      type="button"
                      id="event-start-time"
                      aria-label="Select start time"
                    >
                      {timeOptions.find((t) => t.value === startTime)?.label ||
                        startTime}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-h-60 overflow-y-auto bg-white w-full border border-gray-200 rounded shadow-lg z-50">
                    {timeOptions.map((t) => (
                      <DropdownMenuItem
                        key={t.value}
                        onSelect={() => setStartTime(t.value)}
                        className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                          t.value === startTime ? "bg-blue-100" : ""
                        }`}
                        aria-selected={t.value === startTime}
                        role="option"
                      >
                        {t.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* End Date & Time */}
              <div className="flex flex-col sm:flex-row gap-2 flex-1">
                <label htmlFor="event-end-date" className="sr-only">
                  End date
                </label>
                <Input
                  id="event-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full bg-gray-100 border-0 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="event-end-time" className="sr-only">
                  End time
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-gray-100 border-0 rounded px-2 py-2 text-left min-w-[80px] sm:min-w-[120px] text-sm sm:text-base w-full sm:w-auto"
                      type="button"
                      id="event-end-time"
                      aria-label="Select end time"
                    >
                      {timeOptions.find((t) => t.value === endTime)?.label ||
                        endTime}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-h-60 overflow-y-auto bg-white w-full border border-gray-200 rounded shadow-lg z-50">
                    {timeOptions.map((t) => (
                      <DropdownMenuItem
                        key={t.value}
                        onSelect={() => setEndTime(t.value)}
                        className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                          t.value === endTime ? "bg-blue-100" : ""
                        }`}
                        aria-selected={t.value === endTime}
                        role="option"
                      >
                        {t.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <label htmlFor="event-description" className="sr-only">
              Description
            </label>
            <Textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description"
              className="mb-4 bg-gray-100 border-0 rounded focus:ring-2 focus:ring-blue-500 w-full text-sm sm:text-base"
            />

            {error && (
              <div id="event-title-error" className="text-red-600 text-sm mb-2">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-4 pb-4 pt-2 border-t sm:px-6">
            <Button
              variant="outline"
              onClick={onClose}
              type="button"
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              disabled={
                !title.trim() ||
                new Date(`${endDate}T${endTime}`) <=
                  new Date(`${startDate}T${startTime}`)
              }
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EventFormModal;

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
}

export type ViewType = "month" | "week" | "day";

export type SelectedEvent = CalendarEvent & {
  eventStart: Date;
  eventEnd: Date;
};

export interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  start: Date | string;
  end: Date | string;
  description?: string;
  id?: string;
}

export interface CalendarContextType {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  view: ViewType;
  setView: (view: ViewType) => void;
  events: CalendarEvent[];
  addEvent: (event: CalendarEvent) => void;
  editEvent: (event: CalendarEvent) => void;
  deleteEvent: (id: string) => void;
}

export interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  start: Date | string;
  end: Date | string;
  description?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
}

export interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
}

export interface PositionedEvent extends CalendarEvent {
  day: Date;
  eventStart: Date;
  eventEnd: Date;
  col: number;
  colCount: number | null;
  startIdx?: number;
  endIdx?: number;
}

# Google Calendar Clone

A modern, responsive Google Calendar clone built with React, TypeScript, Vite, and Tailwind CSS. This project demonstrates a calendar application with month, week, and day views, event management, and a clean UI inspired by Google Calendar.

## 🚀 Setup & Running Instructions

1. **Install dependencies:**
   
   npm install
  
2. **Start the development server:**
   
   npm run dev
  
   The app will be available at `http://localhost:5173` (or as indicated in your terminal).

3. **Build for production:**
  
   npm run build
  

4. **Run tests:**
   
   npm test
  

## 🏗️ Architecture & Design Decisions

- **Component Structure:**
  - The app is split into logical components: `CalendarHeader`, `MonthView`, `WeekView`, `DayView`, `EventFormModal`, and `EventDetailsModal`.
  - UI primitives (Button, Dialog, Dropdown, etc.) are abstracted in `src/components/ui` for reusability and consistency.

- **State Management:**
  - Uses React Context (`CalendarContext`) to manage global calendar state (current date, view, and events).
  - Context is provided at the root (`CalendarProvider`), making state accessible throughout the app.

- **Styling:**
  - Tailwind CSS is used for rapid, utility-first styling.
  - Radix UI components are used for accessible dialogs, dropdowns, and popovers.

- **Date Handling:**
  - `date-fns` is used for robust date manipulation and formatting.

- **Testing:**
  - Jest and React Testing Library are set up for unit and integration tests.

## ⚠️ Known Issues, Limitations & Assumptions

- **Persistence:** Events are not persisted; they reset on page reload (uses in-memory state only).
- **No authentication or multi-user support.**
- **No recurring events or reminders.**

## 🌟 Bonus Features Attempted/Completed

- Smooth transitions between views (month/week/day).
- Modal dialogs for event creation and details, with accessible keyboard navigation.
- Drag-and-drop and resizing of events are **not** implemented (future work).
- Clean, modern UI inspired by Google Calendar.


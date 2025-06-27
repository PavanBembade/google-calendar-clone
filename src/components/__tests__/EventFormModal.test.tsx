import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import EventFormModal from "../Calendar/EventFormModal";
import CalendarProvider from "../../context/CalendarContext/CalendarProvider";

describe("EventFormModal", () => {
  it("renders and allows input", () => {
    render(
      <CalendarProvider>
        <EventFormModal isOpen={true} onClose={() => {}} />
      </CalendarProvider>
    );
    expect(screen.getByPlaceholderText(/add title/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/add title/i), {
      target: { value: "Test Event" },
    });
    expect(screen.getByDisplayValue("Test Event")).toBeInTheDocument();
  });
});

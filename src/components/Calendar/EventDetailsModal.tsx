import type { EventDetailsModalProps } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";

const formatDateTime = (date: Date | string) => {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "PPpp");
};

function EventDetailsModal(props: EventDetailsModalProps) {
  const { isOpen, onClose, title, start, end, description } = props;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-full max-w-md sm:max-w-lg rounded-2xl p-0 bg-gradient-to-br from-white via-blue-50 to-blue-100 border border-blue-200 shadow-2xl"
        aria-labelledby="event-details-title"
      >
        <DialogHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-2 border-b">
          <div className="flex items-center gap-3">
            <span className="bg-blue-100 text-blue-500 rounded-full p-2">
              {/* Calendar Icon */}
              <svg
                width="28"
                height="28"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="16"
                  rx="3"
                  fill="#3B82F6"
                  opacity="0.15"
                />
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="16"
                  rx="3"
                  stroke="#3B82F6"
                  strokeWidth="1.5"
                />
                <rect x="7" y="2" width="2" height="4" rx="1" fill="#3B82F6" />
                <rect x="15" y="2" width="2" height="4" rx="1" fill="#3B82F6" />
              </svg>
            </span>
            <DialogTitle asChild>
              <h2
                id="event-details-title"
                className="text-2xl font-bold text-blue-700"
              >
                {title}
              </h2>
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="px-6 sm:px-8 pb-8 pt-4 overflow-y-auto max-h-[60vh]">
          <DialogDescription asChild>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="font-semibold text-gray-600">Start:</span>
                <span className="text-gray-800">{formatDateTime(start)}</span>
              </div>
              <div className="mb-2 flex items-center gap-2">
                <span className="font-semibold text-gray-600">End:</span>
                <span className="text-gray-800">{formatDateTime(end)}</span>
              </div>
              {description && (
                <div className="mt-4">
                  <span className="font-semibold text-gray-600">
                    Description:
                  </span>
                  <div className="mt-1 text-gray-700 whitespace-pre-line">
                    {description}
                  </div>
                </div>
              )}
            </div>
          </DialogDescription>
        </div>
        <DialogFooter className="px-6 pb-4" />
      </DialogContent>
    </Dialog>
  );
}

export default EventDetailsModal;

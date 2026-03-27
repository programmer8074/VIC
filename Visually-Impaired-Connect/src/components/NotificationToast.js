import React, { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Toast notification that auto-dismisses after 5 seconds.
 *
 * Usage:
 *   <NotificationToast notification={notification} onClose={clearNotification} />
 */
const NotificationToast = ({ notification, onClose }) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const colors = {
    new_request: "border-purple-500 bg-purple-50",
    matched: "border-green-500  bg-green-50",
    started: "border-blue-500   bg-blue-50",
    completed: "border-yellow-500 bg-yellow-50",
  };

  return (
    <div
      className={`fixed top-6 right-6 z-50 max-w-sm w-full border-l-4 rounded-xl shadow-2xl p-4 flex items-start gap-3 animate-fade-in ${colors[notification.type] || "border-gray-400 bg-white"}`}
    >
      <div className="flex-1">
        <p className="font-bold text-gray-900">{notification.title}</p>
        <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-700 mt-0.5"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default NotificationToast;

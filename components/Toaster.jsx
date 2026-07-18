"use client";

/**
 * Global toast system — dependency-free replacement for alert().
 *
 * Usage anywhere (client code):
 *   import { toast } from "@/components/Toaster";
 *   toast.success("Saved!");
 *   toast.error("Something went wrong");
 *   toast.info("Please wait…");
 *   toast.confirm("Delete this?", { confirmLabel: "Delete", onConfirm: () => {…} });
 *
 * confirm toasts stay until the user picks a button (the ✕ counts as
 * Cancel); only one confirm is shown at a time.
 *
 * <Toaster /> is mounted once in the root layout. Toasts stack top-center:
 * full-width (minus margins) on phones, capped at 420px on larger screens.
 * Styles live in globals.css (.toaster / .toast…); animations respect
 * prefers-reduced-motion there.
 */

import { useSyncExternalStore } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

const EXIT_MS = 180; // keep in sync with the toast-out animation duration
const MAX_VISIBLE = 4;

// Server/hydration snapshot — must be the SAME reference on every call or
// React assumes the store changed and re-renders forever.
const EMPTY = [];

let toasts = EMPTY;
const listeners = new Set();
let counter = 0;

function notify() {
  for (const l of listeners) l();
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function dismissToast(id) {
  const t = toasts.find((x) => x.id === id);
  if (!t || t.leaving) return;
  toasts = toasts.map((x) => (x.id === id ? { ...x, leaving: true } : x));
  notify();
  setTimeout(() => {
    toasts = toasts.filter((x) => x.id !== id);
    notify();
  }, EXIT_MS);
}

function addToast(type, message, options = {}) {
  const id = ++counter;
  // Only one pending question at a time — a new confirm replaces the old.
  if (type === "confirm") toasts = toasts.filter((t) => t.type !== "confirm");
  toasts = [
    ...toasts,
    {
      id,
      type,
      message: String(message),
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
      confirmLabel: options.confirmLabel,
      cancelLabel: options.cancelLabel,
    },
  ];
  // Cap the stack so rapid-fire errors never wallpaper the screen (never
  // evict a pending confirm — it's waiting on the user).
  const active = toasts.filter((t) => !t.leaving);
  if (active.length > MAX_VISIBLE) {
    const victim = active.find((t) => t.type !== "confirm") ?? active[0];
    dismissToast(victim.id);
  }
  notify();

  if (type !== "confirm") {
    const duration = options.duration ?? (type === "error" ? 6000 : 4000);
    setTimeout(() => dismissToast(id), duration);
  }
  return id;
}

export const toast = {
  success: (message, options) => addToast("success", message, options),
  error: (message, options) => addToast("error", message, options),
  info: (message, options) => addToast("info", message, options),
  confirm: (message, options) => addToast("confirm", message, options),
  dismiss: dismissToast,
};

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  confirm: AlertTriangle,
};

function resolveConfirm(t, confirmed) {
  dismissToast(t.id);
  if (confirmed) t.onConfirm?.();
  else t.onCancel?.();
}

export default function Toaster() {
  const items = useSyncExternalStore(
    subscribe,
    () => toasts,
    () => EMPTY
  );

  if (items.length === 0) return null;

  return (
    <div className="toaster">
      {items.map((t) => {
        const Icon = ICONS[t.type] ?? Info;
        const isConfirm = t.type === "confirm";
        return (
          <div
            key={t.id}
            role={isConfirm ? "alertdialog" : t.type === "error" ? "alert" : "status"}
            aria-live={t.type === "error" || isConfirm ? "assertive" : "polite"}
            className={`toast toast--${t.type} ${t.leaving ? "toast--leaving" : ""}`}
          >
            <Icon className="toast-icon" aria-hidden="true" />
            <div className="toast-body">
              <p className="toast-message">{t.message}</p>
              {isConfirm && (
                <div className="toast-actions">
                  <button
                    type="button"
                    className="toast-btn toast-btn--primary"
                    onClick={() => resolveConfirm(t, true)}
                  >
                    {t.confirmLabel ?? "Confirm"}
                  </button>
                  <button
                    type="button"
                    className="toast-btn"
                    autoFocus
                    onClick={() => resolveConfirm(t, false)}
                  >
                    {t.cancelLabel ?? "Cancel"}
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              className="toast-close"
              onClick={() => (isConfirm ? resolveConfirm(t, false) : dismissToast(t.id))}
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

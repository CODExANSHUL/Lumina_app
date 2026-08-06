import { AlertTriangle, Clapperboard, LoaderCircle, X } from "lucide-react";
export const PageLoader = () => (
  <div className="grid min-h-[50vh] place-items-center">
    <LoaderCircle className="animate-spin text-coral" size={36} />
    <span className="sr-only">Loading</span>
  </div>
);
export const SkeletonGrid = ({ count = 6 }) => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
    {Array.from({ length: count }, (_, i) => (
      <div key={i}>
        <div className="shimmer aspect-[2/3] rounded-2xl" />
        <div className="shimmer mt-3 h-4 w-3/4 rounded" />
      </div>
    ))}
  </div>
);
export function ErrorState({
  message = "We could not load this page.",
  retry,
}) {
  return (
    <div className="panel mx-auto my-16 max-w-lg p-8 text-center">
      <AlertTriangle className="mx-auto text-coral" />
      <h2 className="mt-4 text-xl font-semibold">Something went off-script</h2>
      <p className="mt-2 text-sm text-mist">{message}</p>
      {retry && (
        <button className="btn-primary mt-6" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
export function EmptyState({
  title = "Nothing here yet",
  message = "Check back soon for something worth watching.",
}) {
  return (
    <div className="py-20 text-center">
      <Clapperboard className="mx-auto text-mist" size={40} />
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-mist">{message}</p>
    </div>
  );
}
export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="panel max-h-[90vh] w-full max-w-lg overflow-auto p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            className="rounded-full p-2 hover:bg-white/10"
            onClick={onClose}
            aria-label="Close"
          >
            <X />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
export function ConfirmDialog({ open, onClose, onConfirm, title, body, busy }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-mist">{body}</p>
      <div className="mt-7 flex justify-end gap-3">
        <button className="btn-secondary" onClick={onClose}>
          Keep it
        </button>
        <button className="btn-primary" disabled={busy} onClick={onConfirm}>
          {busy ? "Working…" : "Confirm"}
        </button>
      </div>
    </Modal>
  );
}

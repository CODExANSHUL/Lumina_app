export function FormField({ label, error, children }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {error && (
        <span className="mt-1 block text-xs text-red-400" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
export const Input = (props) => (
  <input {...props} className={`field ${props.className || ""}`} />
);

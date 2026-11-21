import { useEffect, useRef } from "react";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function snapToStep(value, min, step) {
  const stepValue = Number(step);
  if (!Number.isFinite(stepValue) || stepValue <= 0) return value;

  const snapped = Math.round((value - min) / stepValue) * stepValue + min;
  const precision = (String(step).split(".")[1] || "").length;
  return Number(snapped.toFixed(precision));
}

export function Knob({ label, min, max, value, onChange, unit = "", step = "0.1", className = "", accent = "orange", decimals = 1, disabled = false, title = "" }) {
  const safeValue = Number.isFinite(value) ? value : min;
  const normalized = (safeValue - min) / (max - min);
  const rotation = -140 + normalized * 280;
  const dragState = useRef(null);
  const shellRef = useRef(null);
  const wheelHandlerRef = useRef(null);
  const range = max - min;

  const updateValue = (next) => {
    const clamped = clamp(next, min, max);
    onChange(snapToStep(clamped, min, step));
  };

  const beginDrag = (event) => {
    if (disabled) return;
    event.preventDefault();
    dragState.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startX: event.clientX,
      startValue: value,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const continueDrag = (event) => {
    if (!dragState.current || dragState.current.pointerId !== event.pointerId) return;
    const deltaY = dragState.current.startY - event.clientY;
    const deltaX = event.clientX - dragState.current.startX;
    const delta = deltaY + deltaX * 0.5;
    const sensitivity = range / 180;
    updateValue(dragState.current.startValue + delta * sensitivity);
  };

  const endDrag = (event) => {
    if (!dragState.current || dragState.current.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragState.current = null;
  };

  const handleWheel = (event) => {
    if (disabled) return;
    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;
    const fineStep = Number(step) || range / 100;
    updateValue(safeValue + direction * fineStep);
  };

  // Keep the latest props in the wheel listener without re-attaching it on every change.
  useEffect(() => {
    wheelHandlerRef.current = handleWheel;
  });

  // React registers wheel listeners passively, so attach a native non-passive one
  // on the shell to be able to stop the pedalboard from scrolling while stepping.
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return undefined;

    const handler = (event) => {
      wheelHandlerRef.current?.(event);
    };

    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  const handleKeyDown = (event) => {
    if (disabled) return;
    const fineStep = Number(step) || range / 100;
    const coarseStep = range / 10;

    switch (event.key) {
      case "ArrowUp":
      case "ArrowRight":
        event.preventDefault();
        updateValue(value + fineStep);
        break;
      case "ArrowDown":
      case "ArrowLeft":
        event.preventDefault();
        updateValue(value - fineStep);
        break;
      case "PageUp":
        event.preventDefault();
        updateValue(value + coarseStep);
        break;
      case "PageDown":
        event.preventDefault();
        updateValue(value - coarseStep);
        break;
      case "Home":
        event.preventDefault();
        updateValue(min);
        break;
      case "End":
        event.preventDefault();
        updateValue(max);
        break;
      default:
        break;
    }
  };

  return (
    <div className={`knob-wrap knob-${accent} ${className} ${disabled ? "is-disabled" : ""}`.trim()}>
      <div
        className="knob-shell"
        ref={shellRef}
        title={title || undefined}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={safeValue}
        aria-valuetext={(String(safeValue) + (unit ? " " + unit : "")).trim()}
        aria-disabled={disabled}
        onPointerDown={beginDrag}
        onPointerMove={continueDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={handleKeyDown}
      >
        <div className="knob-face" style={{ transform: `rotate(${rotation}deg)` }}>
          <div className="knob-pointer" />
        </div>
      </div>
      <div className="knob-label">{label}</div>
      <div className="knob-value">
        {Number.isFinite(value) ? value.toFixed(decimals) : "—"}
        {unit ? ` ${unit}` : ""}
      </div>
    </div>
  );
}

export function BypassButton({ label, enabled, onToggle, className = "", effect = "", ariaLabel = "" }) {
  const isPower = className.includes("pedal-power");
  const accessibleName = ariaLabel || (effect ? `${effect} ${label.toLowerCase()}` : label);

  return (
    <button
      className={`bypass-button ${!enabled ? "active" : ""} ${className}`.trim()}
      type="button"
      onClick={onToggle}
      aria-label={accessibleName}
      aria-pressed={!enabled}
      title={accessibleName}
    >
      {isPower ? (
        <svg
          className="power-icon"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 3v9" />
          <path d="M6.2 6.5a8 8 0 1 0 11.6 0" />
        </svg>
      ) : (
        <span>{label}</span>
      )}
    </button>
  );
}

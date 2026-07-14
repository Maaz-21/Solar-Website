"use client";

import { Check } from "lucide-react";
import { useDesignStore, STEPS } from "./store/useDesignStore";

/** Which step a user may jump to, given current data. */
function stepAvailable(step, s) {
  if (step === 1) return true;
  if (!s.location) return false;
  if (step >= 3 && !s.roof.polygon) return false;
  if (step >= 6 && !s.design) return false;
  return step <= Math.max(s.maxStepReached, s.step);
}

export default function WizardStepper() {
  const step = useDesignStore((s) => s.step);
  const store = useDesignStore();

  return (
    <div className="sd-stepper">
      {STEPS.map((item, idx) => {
        const isCompleted = item.num < step;
        const isActive = item.num === step;
        const clickable = !isActive && stepAvailable(item.num, store);

        const stateClass = isCompleted
          ? "sd-stepper-node--completed"
          : isActive
          ? "sd-stepper-node--active"
          : "sd-stepper-node--upcoming";

        return (
          <div key={item.num} className="sd-stepper-item">
            <button
              className={`sd-stepper-node ${stateClass} ${clickable ? "clickable" : ""}`}
              onClick={() => clickable && store.goToStep(item.num)}
              disabled={!clickable && !isActive}
              title={`Step ${item.num}: ${item.label}`}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="sd-stepper-num">
                {isCompleted ? <Check size={12} strokeWidth={3} /> : item.num}
              </span>
              <span className="sd-stepper-label">{item.label}</span>
            </button>

            {idx < STEPS.length - 1 && (
              <span
                className={`sd-stepper-connector ${
                  isCompleted ? "sd-stepper-connector--completed" : ""
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

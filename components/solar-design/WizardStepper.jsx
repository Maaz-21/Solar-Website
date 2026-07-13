"use client";

import { Check } from "lucide-react";

const STEPS = [
  { num: 1, label: "Location", icon: "📍" },
  { num: 2, label: "Satellite", icon: "🛰️" },
  { num: 3, label: "Roof", icon: "🏠" },
  { num: 4, label: "Measurements", icon: "📐" },
  { num: 5, label: "Usage", icon: "⚡" },
  { num: 6, label: "Obstacles", icon: "🚧" },
  { num: 7, label: "Layout", icon: "☀️" },
  { num: 8, label: "3D Review", icon: "🏗️" },
  { num: 9, label: "Proposal", icon: "📄" },
];

export default function WizardStepper({ currentStep, onStepClick }) {
  return (
    <div className="sd-stepper">
      {STEPS.map((step, idx) => {
        const isCompleted = step.num < currentStep;
        const isActive = step.num === currentStep;
        const isUpcoming = step.num > currentStep;

        const stateClass = isCompleted
          ? "sd-stepper-node--completed"
          : isActive
          ? "sd-stepper-node--active"
          : "sd-stepper-node--upcoming";

        return (
          <div key={step.num} className="sd-stepper-item">
            <button
              className={`sd-stepper-node ${stateClass} ${isCompleted ? "clickable" : ""}`}
              onClick={() => isCompleted && onStepClick?.(step.num)}
              disabled={isUpcoming}
              title={`Step ${step.num}: ${step.label}`}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="sd-stepper-num">
                {isCompleted ? <Check size={12} strokeWidth={3} /> : step.num}
              </span>
              <span className="sd-stepper-label">{step.label}</span>
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

// src/components/voting/ProgressStepper.tsx
import React from 'react';

interface StepperProps {
  currentStep: number; // 1, 2, or 3
}

export default function ProgressStepper({ currentStep }: StepperProps) {
  const steps = [
    { id: 1, label: 'องค์การ' },
    { id: 2, label: 'สโมสร' },
    { id: 3, label: 'สภา' },
  ];

  return (
    <div className="w-full py-4 px-6 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step Circle */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  currentStep >= step.id
                    ? 'bg-slate-800 text-white scale-110 shadow-md'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step.id}
              </div>
              <span className={`text-[10px] font-bold ${currentStep === step.id ? 'text-slate-800' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-[2px] mx-2 bg-slate-100 relative -top-3">
                <div
                  className="absolute h-full bg-slate-800 transition-all duration-500"
                  style={{ width: currentStep > step.id ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
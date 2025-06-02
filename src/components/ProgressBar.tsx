
import React from 'react';
import { OnboardingStep } from '@/types/merchant';

interface ProgressBarProps {
  currentStep: OnboardingStep;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  const steps: OnboardingStep[] = [
    'welcome',
    'name',
    'businessName',
    'email',
    'existingCustomer',
    'mobileNumber',
    'kycConfirmation',
    'completed'
  ];
  
  const currentIndex = steps.indexOf(currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;
  
  return (
    <div className="w-full mb-6">
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span>Merchant Onboarding</span>
        <span>{Math.round(progress)}% Complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-600 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

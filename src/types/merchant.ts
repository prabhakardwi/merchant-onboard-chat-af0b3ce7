
export interface MerchantData {
  name: string;
  businessName: string;
  email: string;
  isExistingCustomer: boolean;
  mobileNumber?: string;
  kycData?: KYCData;
  confirmLinking?: boolean;
}

export interface KYCData {
  fullName: string;
  businessName: string;
  registrationNumber: string;
  address: string;
  accountNumber: string;
  status: 'verified' | 'pending' | 'rejected';
}

export interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  options?: string[];
}

export type OnboardingStep = 
  | 'welcome'
  | 'name'
  | 'businessName'
  | 'email'
  | 'existingCustomer'
  | 'mobileNumber'
  | 'kycConfirmation'
  | 'completed';

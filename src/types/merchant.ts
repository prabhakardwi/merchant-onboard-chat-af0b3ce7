
export interface MerchantData {
  name: string;
  businessName: string;
  email: string;
  isExistingCustomer: boolean;
  mobileNumber?: string;
  kycData?: KYCData;
  confirmLinking?: boolean;
  businessCategory?: string;
  annualTurnover?: string;
  gstDocument?: File;
  panDocument?: File;
  incorporationCertificate?: File;
  moaDocument?: File;
}

export interface KYCData {
  fullName: string;
  businessName: string;
  registrationNumber: string;
  address: string;
  accountNumber: string;
  status: 'verified' | 'pending' | 'rejected';
  gstNumber: string;
  panNumber: string;
  directorDetails: DirectorDetail[];
  shareholdingDetails: ShareholdingDetail[];
}

export interface DirectorDetail {
  name: string;
  designation: string;
  panNumber: string;
  shareholding: string;
}

export interface ShareholdingDetail {
  shareholderName: string;
  sharePercentage: number;
  shareType: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  options?: string[];
  image?: string;
}

export type OnboardingStep = 
  | 'welcome'
  | 'name'
  | 'businessName'
  | 'email'
  | 'existingCustomer'
  | 'mobileNumber'
  | 'kycConfirmation'
  | 'businessCategory'
  | 'annualTurnover'
  | 'gstUpload'
  | 'panUpload'
  | 'incorporationUpload'
  | 'moaUpload'
  | 'evaluation'
  | 'pdfGeneration'
  | 'otpVerification'
  | 'completed';

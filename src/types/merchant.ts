
export interface MerchantData {
  name: string;
  businessName: string;
  email: string;
  isExistingCustomer: boolean;
  mobileNumber?: string;
  panNumber?: string;
  pinCode?: string;
  applicationReferenceNumber?: string;
  kycData?: KYCData;
  confirmLinking?: boolean;
  businessCategory?: string;
  annualTurnover?: string;
  selectedPlan?: string;
  negotiationRequest?: string;
  finalPricing?: string;
  gstDocument?: File;
  panDocument?: File;
  incorporationCertificate?: File;
  moaDocument?: File;
  serviceType?: 'payment-gateway' | 'pos-machine' | 'both';
  selectedPOSModel?: string;
  selectedPGPlan?: string;
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
  isAIResponse?: boolean;
}

export type OnboardingStep = 
  | 'welcome'
  | 'name'
  | 'mobileNumber'
  | 'panNumber'
  | 'pinCode'
  | 'otpVerification'
  | 'postOtpOptions'
  | 'businessName'
  | 'email'
  | 'serviceSelection'
  | 'posOptions'
  | 'pgOptions'
  | 'existingCustomer'
  | 'kycConfirmation'
  | 'businessCategory'
  | 'annualTurnover'
  | 'pricingOptions'
  | 'negotiation'
  | 'negotiationResponse'
  | 'gstUpload'
  | 'panUpload'
  | 'incorporationUpload'
  | 'moaUpload'
  | 'evaluation'
  | 'pdfGeneration'
  | 'completed'
  | 'aiHelp';

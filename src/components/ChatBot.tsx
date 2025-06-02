import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ChatMessage from './ChatMessage';
import ProgressBar from './ProgressBar';
import OTPVerification from './OTPVerification';
import FileUpload from './FileUpload';
import { ChatMessage as ChatMessageType, MerchantData, OnboardingStep, KYCData } from '@/types/merchant';
import { generateMerchantOnboardingPDF } from '@/utils/pdfGenerator';

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [merchantData, setMerchantData] = useState<MerchantData>({
    name: '',
    businessName: '',
    email: '',
    isExistingCustomer: false,
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [currentUploadType, setCurrentUploadType] = useState<'gst' | 'pan' | 'incorporation' | 'moa'>('gst');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const businessCategories = [
    'Retail & Consumer Goods',
    'Healthcare & Wellness',
    'Food & Beverage',
    'Automobile & Transport',
    'E-commerce & Online Services',
    'Home & Living',
    'Financial Services',
    'Education & Training',
    'Professional Services',
    'Telecom & Utilities',
    'Travel & Entertainment & Events'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize with welcome message
    addBotMessage(
      "Welcome to our Merchant Onboarding! 🎉 I'll help you get set up with our POS and Payment Gateway services. Let's start with some basic information.",
      []
    );
    setTimeout(() => {
      addBotMessage("What's your full name?", []);
      setCurrentStep('name');
    }, 1000);
  }, []);

  const addBotMessage = (text: string, options: string[] = []) => {
    const message: ChatMessageType = {
      id: Date.now().toString(),
      text,
      isBot: true,
      timestamp: new Date(),
      options,
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (text: string) => {
    const message: ChatMessageType = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const mockKYCData: KYCData = {
    fullName: "John Smith",
    businessName: "Smith Electronics Ltd",
    registrationNumber: "REG123456789",
    address: "123 Business Street, Commerce City, CC 12345",
    accountNumber: "ACC-789456123",
    status: 'verified',
    gstNumber: "29ABCDE1234F1Z5",
    panNumber: "ABCDE1234F",
    directorDetails: [
      {
        name: "John Smith",
        designation: "Managing Director",
        panNumber: "ABCDE1234F",
        shareholding: "60%"
      },
      {
        name: "Jane Smith",
        designation: "Director",
        panNumber: "FGHIJ5678K",
        shareholding: "40%"
      }
    ],
    shareholdingDetails: [
      {
        shareholderName: "John Smith",
        sharePercentage: 60,
        shareType: "Equity Shares"
      },
      {
        shareholderName: "Jane Smith",
        sharePercentage: 40,
        shareType: "Equity Shares"
      }
    ]
  };

  const handleFileUpload = (file: File) => {
    setShowFileUpload(false);
    
    switch (currentUploadType) {
      case 'gst':
        setMerchantData(prev => ({ ...prev, gstDocument: file }));
        addBotMessage(`✅ GST document "${file.name}" uploaded successfully! Now please upload your PAN document.`);
        setTimeout(() => {
          setCurrentUploadType('pan');
          setShowFileUpload(true);
          setCurrentStep('panUpload');
        }, 1000);
        break;
      case 'pan':
        setMerchantData(prev => ({ ...prev, panDocument: file }));
        addBotMessage(`✅ PAN document "${file.name}" uploaded successfully! Now please upload your Incorporation Certificate.`);
        setTimeout(() => {
          setCurrentUploadType('incorporation');
          setShowFileUpload(true);
          setCurrentStep('incorporationUpload');
        }, 1000);
        break;
      case 'incorporation':
        setMerchantData(prev => ({ ...prev, incorporationCertificate: file }));
        addBotMessage(`✅ Incorporation Certificate "${file.name}" uploaded successfully! Finally, please upload your MOA document.`);
        setTimeout(() => {
          setCurrentUploadType('moa');
          setShowFileUpload(true);
          setCurrentStep('moaUpload');
        }, 1000);
        break;
      case 'moa':
        setMerchantData(prev => ({ ...prev, moaDocument: file }));
        addBotMessage(`✅ MOA document "${file.name}" uploaded successfully!`);
        setTimeout(() => {
          addBotMessage(
            `🔍 Thank you for providing all the required documents! We are now evaluating the details you provided...\n\n` +
            `📄 Here is your application PDF document with all the information. Please click below to download and verify the same.`,
            ["Download Application PDF"]
          );
          setCurrentStep('evaluation');
        }, 2000);
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    addUserMessage(inputValue);
    const userInput = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    switch (currentStep) {
      case 'name':
        setMerchantData(prev => ({ ...prev, name: userInput }));
        addBotMessage(`Nice to meet you, ${userInput}! What's your business name?`);
        setCurrentStep('businessName');
        break;

      case 'businessName':
        setMerchantData(prev => ({ ...prev, businessName: userInput }));
        addBotMessage("Great! What's your business email address?");
        setCurrentStep('email');
        break;

      case 'email':
        if (!/\S+@\S+\.\S+/.test(userInput)) {
          addBotMessage("Please enter a valid email address.");
          break;
        }
        setMerchantData(prev => ({ ...prev, email: userInput }));
        addBotMessage("Perfect! Are you an existing customer with us?", ["Yes, I am", "No, I'm new"]);
        setCurrentStep('existingCustomer');
        break;

      case 'businessCategory':
        setMerchantData(prev => ({ ...prev, businessCategory: userInput }));
        addBotMessage("Great choice! What's your business annual turnover? (e.g., 1-5 Cr, 5-10 Cr, 10+ Cr)");
        setCurrentStep('annualTurnover');
        break;

      case 'annualTurnover':
        setMerchantData(prev => ({ ...prev, annualTurnover: userInput }));
        addBotMessage("Perfect! Now I need to collect some important documents. Let's start with your GST certificate. Please upload it below:");
        setTimeout(() => {
          setCurrentUploadType('gst');
          setShowFileUpload(true);
          setCurrentStep('gstUpload');
        }, 1000);
        break;

      case 'mobileNumber':
        if (!/^\d{10}$/.test(userInput.replace(/\D/g, ''))) {
          addBotMessage("Please enter a valid 10-digit mobile number.");
          break;
        }
        setMerchantData(prev => ({ ...prev, mobileNumber: userInput }));
        addBotMessage("Let me fetch your KYC details... 🔍");
        
        setTimeout(() => {
          setMerchantData(prev => ({ ...prev, kycData: mockKYCData }));
          addBotMessage(
            `Great! I found your existing KYC details:\n\n` +
            `📋 Name: ${mockKYCData.fullName}\n` +
            `🏢 Business: ${mockKYCData.businessName}\n` +
            `📄 Registration: ${mockKYCData.registrationNumber}\n` +
            `📍 Address: ${mockKYCData.address}\n` +
            `💳 Account: ${mockKYCData.accountNumber}\n` +
            `✅ Status: ${mockKYCData.status}\n\n` +
            `Would you like to link this account with your new business?`,
            ["Yes, link this account", "No, create a new account"]
          );
          setCurrentStep('kycConfirmation');
        }, 2000);
        break;

      default:
        break;
    }

    setIsLoading(false);
  };

  const handleOptionSelect = async (option: string) => {
    addUserMessage(option);
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    switch (currentStep) {
      case 'existingCustomer':
        if (option === "Yes, I am") {
          setMerchantData(prev => ({ ...prev, isExistingCustomer: true }));
          addBotMessage("Excellent! Please share your registered mobile number so I can fetch your KYC details.");
          setCurrentStep('mobileNumber');
        } else {
          setMerchantData(prev => ({ ...prev, isExistingCustomer: false }));
          addBotMessage(
            `Welcome to our platform! 🎉 Since you're a new customer, I need to collect some additional business information.\n\n` +
            `Please select your business category:`,
            businessCategories
          );
          setCurrentStep('businessCategory');
        }
        break;

      case 'businessCategory':
        setMerchantData(prev => ({ ...prev, businessCategory: option }));
        addBotMessage("Excellent choice! What's your business annual turnover? Please type your response (e.g., 1-5 Cr, 5-10 Cr, 10+ Cr)");
        setCurrentStep('annualTurnover');
        break;

      case 'evaluation':
        if (option === "Download Application PDF") {
          generateMerchantOnboardingPDF(merchantData);
          addBotMessage(
            `📄 PDF downloaded successfully!\n\n` +
            `✅ Application Summary:\n` +
            `• Personal Name: ${merchantData.name}\n` +
            `• Business: ${merchantData.businessName}\n` +
            `• Email: ${merchantData.email}\n` +
            `• Category: ${merchantData.businessCategory}\n` +
            `• Turnover: ${merchantData.annualTurnover}\n` +
            `• Documents: All uploaded ✓\n\n` +
            `🎉 Your application has been submitted successfully! Our team will review your documents and contact you within 2-3 business days for the next steps.`
          );
          setCurrentStep('completed');
        }
        break;

      case 'kycConfirmation':
        if (option === "Yes, link this account") {
          setMerchantData(prev => ({ ...prev, confirmLinking: true, kycData: mockKYCData }));
          addBotMessage(
            `Perfect! ✅ Your account linking is confirmed.\n\n` +
            `📄 I'm now generating your merchant onboarding document with all your business details including:\n` +
            `• Business Information\n` +
            `• GST & PAN Details\n` +
            `• Director Information\n` +
            `• Shareholding Structure\n\n` +
            `The PDF will be downloaded automatically. Please review and we'll proceed with digital sign-off.`,
            ["Generate PDF & Proceed"]
          );
          setCurrentStep('pdfGeneration');
        } else {
          setMerchantData(prev => ({ ...prev, confirmLinking: false }));
          addBotMessage(
            `No problem! We'll create a new account for your business.\n\n` +
            `📋 Summary:\n` +
            `• Name: ${merchantData.name}\n` +
            `• Business: ${merchantData.businessName}\n` +
            `• Email: ${merchantData.email}\n` +
            `• Mobile: ${merchantData.mobileNumber}\n` +
            `• Account Type: New Separate Account\n\n` +
            `Our KYC team will contact you within 24 hours to complete the verification process for your new business account.`
          );
          setCurrentStep('completed');
        }
        break;

      case 'pdfGeneration':
        if (option === "Generate PDF & Proceed") {
          generateMerchantOnboardingPDF(merchantData);
          
          addBotMessage(
            `📄 PDF downloaded successfully!\n\n` +
            `🔐 For digital sign-off, I'm sending OTP to:\n` +
            `📱 Mobile: ${merchantData.mobileNumber}\n` +
            `📧 Email: ${merchantData.email}\n\n` +
            `Please enter both OTPs to complete your onboarding.`
          );
          
          setTimeout(() => {
            setShowOTPVerification(true);
            setCurrentStep('otpVerification');
          }, 1000);
        }
        break;

      default:
        break;
    }

    setIsLoading(false);
  };

  const handleOTPVerifySuccess = () => {
    setShowOTPVerification(false);
    addBotMessage(
      `🎉 Congratulations! Your digital sign-off is complete.\n\n` +
      `✅ Final Summary:\n` +
      `• Personal Name: ${merchantData.name}\n` +
      `• Business: ${merchantData.businessName}\n` +
      `• Email: ${merchantData.email}\n` +
      `• Linked Account: ${merchantData.kycData?.accountNumber}\n` +
      `• Mobile: ${merchantData.mobileNumber}\n` +
      `• Document Status: Signed & Verified\n\n` +
      `🚀 Your merchant onboarding is now complete! Our team will activate your POS and payment gateway services within 2-4 hours.`
    );
    setCurrentStep('completed');
  };

  const handleResendOTP = async (type: 'mobile' | 'email') => {
    addBotMessage(`🔄 Resending OTP to your ${type}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    addBotMessage(`✅ OTP sent to your ${type} successfully!`);
  };

  const getUploadLabel = () => {
    switch (currentUploadType) {
      case 'gst': return 'Upload GST Certificate';
      case 'pan': return 'Upload PAN Document';
      case 'incorporation': return 'Upload Incorporation Certificate';
      case 'moa': return 'Upload MOA Document';
      default: return 'Upload Document';
    }
  };

  const getUploadDescription = () => {
    switch (currentUploadType) {
      case 'gst': return 'Please upload your GST registration certificate';
      case 'pan': return 'Please upload your business PAN card or certificate';
      case 'incorporation': return 'Please upload your certificate of incorporation';
      case 'moa': return 'Please upload your Memorandum of Association';
      default: return 'Please upload the required document';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Merchant Onboarding</h1>
          <p className="text-gray-600">POS & Payment Gateway Services</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="text-center">Onboarding Assistant</CardTitle>
            <ProgressBar currentStep={currentStep} />
          </CardHeader>
          
          <CardContent className="h-96 overflow-y-auto p-6 bg-gray-50">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onOptionSelect={handleOptionSelect}
              />
            ))}
            
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {showOTPVerification && (
              <div className="mb-4">
                <OTPVerification
                  mobileNumber={merchantData.mobileNumber || ''}
                  email={merchantData.email}
                  onVerifySuccess={handleOTPVerifySuccess}
                  onResendOTP={handleResendOTP}
                />
              </div>
            )}
            
            {showFileUpload && (
              <div className="mb-4">
                <FileUpload
                  onFileSelect={handleFileUpload}
                  label={getUploadLabel()}
                  description={getUploadDescription()}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </CardContent>

          {currentStep !== 'completed' && currentStep !== 'otpVerification' && !showFileUpload && (
            <div className="p-4 border-t bg-white rounded-b-lg">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your response..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Send
                </Button>
              </form>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ChatBot;

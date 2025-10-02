import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ChatMessage from './ChatMessage';
import ProgressBar from './ProgressBar';
import OTPVerification from './OTPVerification';
import FileUpload from './FileUpload';
import VoiceInput from './VoiceInput';
import { ChatMessage as ChatMessageType, MerchantData, OnboardingStep, KYCData } from '@/types/merchant';
import { generateMerchantOnboardingPDF } from '@/utils/pdfGenerator';
import { getMerchantOnboardingResponse } from '@/utils/aiHelper';
import clickstartLogo from '@/assets/clickstart-logo.png';

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
  const [isAIMode, setIsAIMode] = useState(false);
  const [messageCounter, setMessageCounter] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Enhanced mock KYC data with more comprehensive information
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
        designation: "Managing Director & CEO",
        panNumber: "ABCDE1234F",
        shareholding: "60%"
      },
      {
        name: "Jane Smith",
        designation: "Executive Director",
        panNumber: "FGHIJ5678K",
        shareholding: "25%"
      },
      {
        name: "Robert Johnson",
        designation: "Independent Director",
        panNumber: "KLMNO9012P",
        shareholding: "15%"
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
        sharePercentage: 25,
        shareType: "Equity Shares"
      },
      {
        shareholderName: "Robert Johnson",
        sharePercentage: 15,
        shareType: "Preference Shares"
      }
    ]
  };

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

  // POS Machine Options
  const posOptions = [
    {
      name: "PAX A920 Pro",
      type: "Android POS Terminal",
      features: ["7-inch touchscreen", "4G/WiFi connectivity", "Built-in printer", "NFC enabled"],
      price: "₹15,000"
    },
    {
      name: "Ingenico Move/5000",
      type: "Portable POS",
      features: ["Compact design", "Long battery life", "Contactless payments", "Dual connectivity"],
      price: "₹8,500"
    },
    {
      name: "Verifone V240m",
      type: "Countertop Terminal",
      features: ["EMV certified", "Fast processing", "Easy integration", "Secure transactions"],
      price: "₹6,200"
    },
    {
      name: "PAX S920",
      type: "Smart POS",
      features: ["Android OS", "Multiple payment options", "App ecosystem", "Cloud connectivity"],
      price: "₹12,800"
    }
  ];

  // Payment Gateway Plans
  const pgPlans = [
    {
      name: "Starter Plan",
      type: "Small Business",
      features: ["Up to 1000 transactions/month", "Basic analytics", "Email support", "Standard checkout"],
      pricing: "2.5% per transaction"
    },
    {
      name: "Business Plan",
      type: "Growing Business",
      features: ["Up to 10,000 transactions/month", "Advanced analytics", "Phone & email support", "Custom checkout"],
      pricing: "2.2% per transaction"
    },
    {
      name: "Enterprise Plan",
      type: "Large Business",
      features: ["Unlimited transactions", "Real-time reporting", "Dedicated support", "White-label solution"],
      pricing: "1.9% per transaction"
    },
    {
      name: "Premium Plan",
      type: "Enterprise",
      features: ["Volume discounts", "API access", "Multi-currency support", "24/7 priority support"],
      pricing: "1.7% per transaction"
    }
  ];

  // Updated pricing data structure to match the provided table
  const pricingData = [
    { service: "Debit Card Txns - Flat Rate - Subject to Business Approval", flat: "", mdrTdr: "1.9", subvention: "", total: "1.9" },
    { service: "Debit Card Txns - (upto Rs. 2000)- Debit card Pricing", flat: "", mdrTdr: "3", subvention: "", total: "3" },
    { service: "Debit Card Txns - (Above Rs 2000) - Debit card Pricing", flat: "", mdrTdr: "2.5", subvention: "", total: "2.5" },
    { service: "Credit Cards - Visa - (Credit Card Pricing)", flat: "", mdrTdr: "2.5", subvention: "", total: "2.5" },
    { service: "Credit Cards - Master - (Credit Card Pricing)", flat: "", mdrTdr: "2.5", subvention: "", total: "2.5" },
    { service: "Credit Cards - Diners - (Diners Pricing)", flat: "", mdrTdr: "2.5", subvention: "", total: "2.5" },
    { service: "Credit Cards -Amex", flat: "", mdrTdr: "2.5", subvention: "", total: "2.5" },
    { service: "Credit Cards - JCB", flat: "", mdrTdr: "2.5", subvention: "", total: "2.5" },
    { service: "HDFC NetBanking", flat: "", mdrTdr: "2.5", subvention: "", total: "2.5" },
    { service: "Axis NetBanking", flat: "", mdrTdr: "2.5", subvention: "", total: "2.5" },
    { service: "ICICI Netbanking", flat: "", mdrTdr: "2.5", subvention: "", total: "2.5" },
    { service: "SBI NetBanking", flat: "", mdrTdr: "2.5", subvention: "", total: "2.5" },
    { service: "All Other Banks NetBanking", flat: "", mdrTdr: "2.5", subvention: "", total: "2.5" },
    { service: "Multi Bank EMI", flat: "", mdrTdr: "", subvention: "", total: "" }
  ];

  const renderPricingTable = () => {
    return (
      <div className="my-4 bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-4 bg-blue-50 border-b">
          <h3 className="text-lg font-semibold text-blue-900">💳 Payment Processing Rates</h3>
          <p className="text-sm text-blue-700 mt-1">All rates are in percentage (%) per transaction</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-900">Payment Method</TableHead>
                <TableHead className="text-center font-semibold text-gray-900">Flat</TableHead>
                <TableHead className="text-center font-semibold text-gray-900">MDR/TDR</TableHead>
                <TableHead className="text-center font-semibold text-gray-900">Subvention</TableHead>
                <TableHead className="text-center font-semibold text-gray-900 bg-blue-50">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricingData.map((row, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-sm">{row.service}</TableCell>
                  <TableCell className="text-center text-sm">{row.flat}</TableCell>
                  <TableCell className="text-center text-sm font-medium">{row.mdrTdr}</TableCell>
                  <TableCell className="text-center text-sm">{row.subvention}</TableCell>
                  <TableCell className="text-center text-sm font-semibold bg-blue-50">{row.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="p-4 bg-gray-50 border-t">
          <div className="text-xs text-gray-600 space-y-1">
            <p>• <strong>MDR/TDR:</strong> Merchant Discount Rate / Transaction Discount Rate</p>
            <p>• <strong>Subvention:</strong> Government subsidy or promotional discount</p>
            <p>• <strong>Total:</strong> Final rate charged to merchant</p>
            <p>• Rates are subject to business approval and may vary based on transaction volume</p>
          </div>
        </div>
      </div>
    );
  };

  const renderPOSOptions = () => {
    return (
      <div className="my-4 bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-4 bg-green-50 border-b">
          <h3 className="text-lg font-semibold text-green-900">🏪 POS Machine Options</h3>
          <p className="text-sm text-green-700 mt-1">Choose the perfect POS solution for your business</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {posOptions.map((pos, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{pos.name}</h4>
                <span className="text-lg font-bold text-green-600">{pos.price}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{pos.type}</p>
              <ul className="space-y-1">
                {pos.features.map((feature, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPGPlans = () => {
    return (
      <div className="my-4 bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-4 bg-purple-50 border-b">
          <h3 className="text-lg font-semibold text-purple-900">💳 Payment Gateway Plans</h3>
          <p className="text-sm text-purple-700 mt-1">Select the best plan for your business needs</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {pgPlans.map((plan, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                <span className="text-lg font-bold text-purple-600">{plan.pricing}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{plan.type}</p>
              <ul className="space-y-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-center">
                    <span className="text-purple-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

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

  const addBotMessage = (text: string, options: string[] = [], isAIResponse = false) => {
    console.log('Adding bot message:', { text: text.substring(0, 100), isAIResponse, options });
    setMessageCounter(prev => prev + 1);
    const message: ChatMessageType = {
      id: `bot-${Date.now()}-${messageCounter}`,
      text,
      isBot: true,
      timestamp: new Date(),
      options,
      isAIResponse,
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (text: string) => {
    console.log('Adding user message:', text);
    setMessageCounter(prev => prev + 1);
    const message: ChatMessageType = {
      id: `user-${Date.now()}-${messageCounter}`,
      text,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const handleAIQuestion = (question: string) => {
    console.log('=== AI QUESTION HANDLER ===');
    console.log('Question received:', question);
    console.log('Current AI mode:', isAIMode);
    
    try {
      const aiResponse = getMerchantOnboardingResponse(question);
      console.log('AI response generated:', aiResponse.substring(0, 100) + '...');
      
      addBotMessage(aiResponse, ["Continue with onboarding", "Ask another question"], true);
      console.log('AI message added successfully');
    } catch (error) {
      console.error('Error in AI question handler:', error);
      addBotMessage("I apologize, but I'm having trouble processing your question right now. Please try again or contact support.", ["Continue with onboarding"], true);
    }
  };

  const handleFileUpload = (file: File) => {
    setShowFileUpload(false);
    
    // Simulate document processing and data extraction
    console.log(`Processing ${currentUploadType} document: ${file.name}`);
    
    switch (currentUploadType) {
      case 'gst':
        setMerchantData(prev => ({ 
          ...prev, 
          gstDocument: file,
          // Simulate extracting GST number from document
          kycData: prev.kycData ? {
            ...prev.kycData,
            gstNumber: "29ABCDE1234F1Z5"
          } : undefined
        }));
        addBotMessage(`✅ GST document "${file.name}" uploaded successfully! GST Number extracted: 29ABCDE1234F1Z5. Now please upload your PAN document.`);
        setTimeout(() => {
          setCurrentUploadType('pan');
          setShowFileUpload(true);
          setCurrentStep('panUpload');
        }, 1000);
        break;
      case 'pan':
        setMerchantData(prev => ({ 
          ...prev, 
          panDocument: file,
          kycData: prev.kycData ? {
            ...prev.kycData,
            panNumber: "ABCDE1234F"
          } : undefined
        }));
        addBotMessage(`✅ PAN document "${file.name}" uploaded successfully! PAN Number extracted: ABCDE1234F. Now please upload your Incorporation Certificate.`);
        setTimeout(() => {
          setCurrentUploadType('incorporation');
          setShowFileUpload(true);
          setCurrentStep('incorporationUpload');
        }, 1000);
        break;
      case 'incorporation':
        setMerchantData(prev => ({ 
          ...prev, 
          incorporationCertificate: file,
          kycData: prev.kycData ? {
            ...prev.kycData,
            registrationNumber: "REG123456789",
            businessName: prev.businessName
          } : undefined
        }));
        addBotMessage(`✅ Incorporation Certificate "${file.name}" uploaded successfully! Registration Number extracted: REG123456789. Finally, please upload your MOA document.`);
        setTimeout(() => {
          setCurrentUploadType('moa');
          setShowFileUpload(true);
          setCurrentStep('moaUpload');
        }, 1000);
        break;
      case 'moa':
        // Complete document processing with full KYC data
        const completeKYCData = {
          ...mockKYCData,
          fullName: merchantData.name,
          businessName: merchantData.businessName
        };
        
        setMerchantData(prev => ({ 
          ...prev, 
          moaDocument: file,
          kycData: completeKYCData
        }));
        
        addBotMessage(`✅ MOA document "${file.name}" uploaded successfully! Director and shareholding details extracted.`);
        setTimeout(() => {
          addBotMessage(
            `🔍 Document processing complete! All business information has been extracted:\n\n` +
            `📋 Business: ${merchantData.businessName}\n` +
            `📄 GST: 29ABCDE1234F1Z5\n` +
            `📄 PAN: ABCDE1234F\n` +
            `📄 Registration: REG123456789\n` +
            `👥 Directors: ${completeKYCData.directorDetails.length} directors found\n` +
            `📊 Shareholding: Complete structure extracted\n\n` +
            `Your comprehensive application PDF is ready for download!`,
            ["Download Complete Application PDF"]
          );
          setCurrentStep('evaluation');
        }, 2000);
        break;
    }
  };

  // Generate unique application reference number
  const generateApplicationReferenceNumber = () => {
    const timestamp = Date.now().toString();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `APP${timestamp.slice(-6)}${randomNum}`;
  };

  // Handle voice input
  const handleVoiceInput = (voiceText: string) => {
    console.log('Voice input received:', voiceText);
    setInputValue(voiceText);
    
    // Auto-submit the voice input after a short delay
    setTimeout(() => {
      const event = new Event('submit') as any;
      handleSubmit(event);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userInput = inputValue.trim();
    console.log('=== FORM SUBMIT ===');
    console.log('User input:', userInput);
    console.log('Current AI mode:', isAIMode);
    console.log('Current step:', currentStep);
    
    addUserMessage(userInput);
    setInputValue('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (isAIMode) {
      console.log('Processing as AI question...');
      handleAIQuestion(userInput);
      setIsLoading(false);
      return;
    }

    console.log('Processing as regular onboarding step...');
    switch (currentStep) {
      case 'name':
        setMerchantData(prev => ({ ...prev, name: userInput }));
        addBotMessage(`Nice to meet you, ${userInput}! Now I need to collect some additional information.\n\nPlease provide your 10-digit mobile number:`);
        setCurrentStep('mobileNumber');
        break;

      case 'mobileNumber':
        if (!/^\d{10}$/.test(userInput.replace(/\D/g, ''))) {
          addBotMessage("Please enter a valid 10-digit mobile number.");
          break;
        }
        setMerchantData(prev => ({ ...prev, mobileNumber: userInput }));
        addBotMessage("Great! Now please provide your PAN number (10 characters):");
        setCurrentStep('panNumber');
        break;

      case 'panNumber':
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(userInput.toUpperCase())) {
          addBotMessage("Please enter a valid PAN number (e.g., ABCDE1234F).");
          break;
        }
        setMerchantData(prev => ({ ...prev, panNumber: userInput.toUpperCase() }));
        addBotMessage("Perfect! Now please provide your Pin-code (6 digits):");
        setCurrentStep('pinCode');
        break;

      case 'pinCode':
        if (!/^\d{6}$/.test(userInput.replace(/\D/g, ''))) {
          addBotMessage("Please enter a valid 6-digit pin-code.");
          break;
        }
        const referenceNumber = generateApplicationReferenceNumber();
        setMerchantData(prev => ({ 
          ...prev, 
          pinCode: userInput,
          applicationReferenceNumber: referenceNumber
        }));
        
        addBotMessage(
          `Excellent! Your application details have been recorded.\n\n` +
          `📋 **Application Reference Number**: ${referenceNumber}\n\n` +
          `📱 Sending OTP to ${merchantData.mobileNumber} for verification...`
        );
        
        setTimeout(() => {
          addBotMessage("Please enter the OTP sent to your mobile number:");
          setShowOTPVerification(true);
          setCurrentStep('otpVerification');
        }, 2000);
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
        addBotMessage(
          `Perfect! Now, which services are you interested in? 🏪💳\n\n` +
          `We offer both POS machines for in-store payments and Payment Gateway solutions for online transactions.`,
          ["Payment Gateway only", "POS Machine only", "Both PG and POS", "I need more information"]
        );
        setCurrentStep('serviceSelection');
        break;

      case 'businessCategory':
        setMerchantData(prev => ({ ...prev, businessCategory: userInput }));
        addBotMessage("Great choice! What's your business annual turnover? Please type your response (e.g., 1-5 Cr, 5-10 Cr, 10+ Cr)");
        setCurrentStep('annualTurnover');
        break;

      case 'annualTurnover':
        setMerchantData(prev => ({ ...prev, annualTurnover: userInput }));
        
        // Show detailed pricing table after annual turnover
        addBotMessage(
          `Perfect! Based on your business profile, here are our detailed payment processing rates:\n\n` +
          `Our comprehensive pricing covers all major payment methods including debit cards, credit cards, and net banking. ` +
          `The rates vary based on the payment method and transaction amount.`
        );
        
        // Add the pricing table as a special message
        const pricingTableMessage: ChatMessageType = {
          id: `pricing-table-${Date.now()}`,
          text: '',
          isBot: true,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, {
          ...pricingTableMessage,
          text: 'PRICING_TABLE_COMPONENT' // Special marker for rendering the table
        }]);
        
        setTimeout(() => {
          addBotMessage(
            `Above you can see our complete pricing structure. The rates are competitive and transparent.\n\n` +
            `Key highlights:\n` +
            `• Debit card rates start from 1.9%\n` +
            `• Credit card rates are standardized at 2.5%\n` +
            `• All major banks' net banking supported\n` +
            `• EMI options available\n\n` +
            `Would you like to proceed with these rates or discuss customization?`,
            ["Proceed with standard rates", "Request custom pricing", "Ask for discount", "I need to negotiate"]
          );
          setCurrentStep('pricingOptions');
        }, 2000);
        break;

      case 'negotiation':
        // Handle negotiation input
        setMerchantData(prev => ({ ...prev, negotiationRequest: userInput }));
        
        addBotMessage(
          `Thank you for your input! 💰 Let me discuss this with our pricing team...\n\n` +
          `⏱️ Processing your request: "${userInput}"\n\n` +
          `I'll get back to you with a customized offer shortly.`
        );
        
        setTimeout(() => {
          addBotMessage(
            `Great news! 🎉 Our team has reviewed your request and we can offer:\n\n` +
            `✅ **Special Discount**: 15% off on all transaction rates\n` +
            `✅ **Volume Discount**: Additional 0.2% reduction for high-volume transactions\n` +
            `✅ **Free Setup**: No installation or setup charges\n` +
            `✅ **Extended Support**: 24/7 priority customer support\n\n` +
            `This offer is valid for the next 48 hours. Shall we proceed with the documentation?`,
            ["Accept this offer", "I need more time to decide", "Discuss further modifications"]
          );
          setCurrentStep('negotiationResponse');
        }, 3000);
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
    console.log('=== OPTION SELECT ===');
    console.log('Option selected:', option);
    console.log('Current AI mode:', isAIMode);
    console.log('Current step:', currentStep);
    
    addUserMessage(option);
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (isAIMode) {
      console.log('Handling AI mode option...');
      if (option === "Ask another question") {
        console.log('User wants to ask another question');
        addBotMessage("What would you like to know about the merchant onboarding process?", [], true);
      } else if (option === "Continue with onboarding") {
        console.log('User wants to continue onboarding, exiting AI mode');
        setIsAIMode(false);
        addBotMessage("Perfect! Let's continue with your onboarding process.");
        
        // Determine where to continue based on current data
        if (!merchantData.name) {
          addBotMessage("What's your full name?");
          setCurrentStep('name');
        } else if (!merchantData.businessName) {
          addBotMessage("What's your business name?");
          setCurrentStep('businessName');
        } else if (!merchantData.email) {
          addBotMessage("What's your business email address?");
          setCurrentStep('email');
        } else {
          addBotMessage("Are you an existing customer with us?", ["Yes, I am", "No, I'm new"]);
          setCurrentStep('existingCustomer');
        }
      } else {
        // Handle preset AI questions and any other AI question
        console.log('Processing preset AI question as regular AI question:', option);
        handleAIQuestion(option);
      }
      setIsLoading(false);
      return;
    }

    console.log('Handling regular onboarding option...');
    switch (currentStep) {
      case 'postOtpOptions':
        if (option === "Get Started") {
          addBotMessage(
            `Excellent! Let's begin your merchant onboarding journey. 🚀\n\n` +
            `I'll guide you through setting up your business profile and selecting the right payment solutions for your needs.\n\n` +
            `Let's start with your business name:`
          );
          setCurrentStep('businessName');
        } else if (option === "Start Later") {
          addBotMessage(
            `No problem! Your application has been saved with reference number: **${merchantData.applicationReferenceNumber}**\n\n` +
            `✅ **What's been completed:**\n` +
            `• Name: ${merchantData.name}\n` +
            `• Mobile: ${merchantData.mobileNumber}\n` +
            `• PAN: ${merchantData.panNumber}\n` +
            `• Pin-code: ${merchantData.pinCode}\n` +
            `• OTP Verification: ✅ Complete\n\n` +
            `📧 You'll receive an email with next steps and a link to continue your application.\n\n` +
            `💡 **Need help later?** Contact us at support@merchant.com or call our helpline.\n\n` +
            `Thank you for choosing our services! 🙏`
          );
          setCurrentStep('completed');
        }
        break;

      case 'serviceSelection':
        if (option === "Payment Gateway only") {
          setMerchantData(prev => ({ ...prev, serviceType: 'payment-gateway' }));
          addBotMessage(
            `Excellent choice! 💳 Payment Gateway solutions are perfect for online businesses.\n\n` +
            `Here are our Payment Gateway plans tailored for different business needs:`
          );
          
          // Add PG plans table
          const pgPlansMessage: ChatMessageType = {
            id: `pg-plans-${Date.now()}`,
            text: 'PG_PLANS_COMPONENT',
            isBot: true,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, pgPlansMessage]);
          
          setTimeout(() => {
            addBotMessage(
              `Which Payment Gateway plan best suits your business requirements?`,
              ["Starter Plan", "Business Plan", "Enterprise Plan", "Premium Plan", "I need custom pricing"]
            );
            setCurrentStep('pgOptions');
          }, 1500);
        } else if (option === "POS Machine only") {
          setMerchantData(prev => ({ ...prev, serviceType: 'pos-machine' }));
          addBotMessage(
            `Great! 🏪 POS machines are essential for in-store transactions.\n\n` +
            `Here are our top POS machine options with different features and pricing:`
          );
          
          // Add POS options table
          const posOptionsMessage: ChatMessageType = {
            id: `pos-options-${Date.now()}`,
            text: 'POS_OPTIONS_COMPONENT',
            isBot: true,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, posOptionsMessage]);
          
          setTimeout(() => {
            addBotMessage(
              `Which POS machine would work best for your business?`,
              ["PAX A920 Pro", "Ingenico Move/5000", "Verifone V240m", "PAX S920", "I need more details"]
            );
            setCurrentStep('posOptions');
          }, 1500);
        } else if (option === "Both PG and POS") {
          setMerchantData(prev => ({ ...prev, serviceType: 'both' }));
          addBotMessage(
            `Perfect! 🌟 A complete payment solution with both POS and Payment Gateway.\n\n` +
            `This gives you the flexibility to accept payments both online and offline. Let me show you our combined solutions.`
          );
          
          // Show both options
          const bothOptionsMessage: ChatMessageType = {
            id: `both-options-${Date.now()}`,
            text: 'BOTH_OPTIONS_COMPONENT',
            isBot: true,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, bothOptionsMessage]);
          
          setTimeout(() => {
            addBotMessage(
              `Since you need both services, we can offer:\n\n` +
              `🎯 **Bundle Discount**: 20% off on combined services\n` +
              `🔧 **Unified Setup**: Single integration for both POS and PG\n` +
              `📊 **Consolidated Reporting**: One dashboard for all transactions\n\n` +
              `Would you like to proceed with our bundle package?`,
              ["Yes, proceed with bundle", "Show me individual pricing", "I need more information"]
            );
            setCurrentStep('pricingOptions');
          }, 2000);
        } else if (option === "I need more information") {
          addBotMessage(
            `Of course! Let me explain our services:\n\n` +
            `🏪 **POS Machine**: Physical device for in-store card payments\n` +
            `• Accept all types of cards (Debit/Credit)\n` +
            `• Contactless payments (NFC)\n` +
            `• Receipt printing\n` +
            `• Real-time transaction processing\n\n` +
            `💳 **Payment Gateway**: Online payment processing\n` +
            `• Accept payments on your website/app\n` +
            `• Multiple payment options (Cards, UPI, Wallets)\n` +
            `• Secure payment processing\n` +
            `• Integration APIs\n\n` +
            `Which one interests you more?`,
            ["Payment Gateway only", "POS Machine only", "Both PG and POS"]
          );
        }
        break;

      case 'posOptions':
        if (["PAX A920 Pro", "Ingenico Move/5000", "Verifone V240m", "PAX S920"].includes(option)) {
          setMerchantData(prev => ({ ...prev, selectedPOSModel: option }));
          addBotMessage(
            `Excellent choice! ${option} is a great POS solution. 🎉\n\n` +
            `Now let's check if you're an existing customer with us to proceed further.`,
            ["Yes, I am existing customer", "No, I'm new customer"]
          );
          setCurrentStep('existingCustomer');
        } else if (option === "I need more details") {
          addBotMessage(
            `I'd be happy to provide more details! Please tell me:\n\n` +
            `• What's your monthly transaction volume?\n` +
            `• Do you need wireless/portable POS?\n` +
            `• Any specific features required?\n` +
            `• Budget range?\n\n` +
            `Type your requirements and I'll recommend the best option.`
          );
        }
        break;

      case 'pgOptions':
        if (["Starter Plan", "Business Plan", "Enterprise Plan", "Premium Plan"].includes(option)) {
          setMerchantData(prev => ({ ...prev, selectedPGPlan: option }));
          addBotMessage(
            `Perfect! ${option} selected. 🎯\n\n` +
            `This plan will be great for your business needs. Let's check your customer status to proceed.`,
            ["Yes, I am existing customer", "No, I'm new customer"]
          );
          setCurrentStep('existingCustomer');
        } else if (option === "I need custom pricing") {
          addBotMessage(
            `Absolutely! I can help with custom pricing. 💰\n\n` +
            `Please share:\n` +
            `• Expected monthly transaction volume\n` +
            `• Average transaction size\n` +
            `• Special features needed\n` +
            `• Integration requirements\n\n` +
            `Type your details and I'll create a customized proposal.`
          );
          setCurrentStep('negotiation');
        }
        break;

      case 'existingCustomer':
        if (option === "Yes, I am" || option === "Yes, I am existing customer") {
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

      case 'pricingOptions':
        setMerchantData(prev => ({ ...prev, selectedPlan: option }));
        
        if (option === "Proceed with standard rates" || option === "Yes, proceed with bundle") {
          addBotMessage(
            `Perfect! 🎯 You've chosen to proceed with our ${merchantData.serviceType === 'both' ? 'bundle package' : 'standard pricing'}.\n\n` +
            `Let's continue with the documentation process. I'll need to collect some important documents.`
          );
          setTimeout(() => {
            addBotMessage("Let's start with your GST certificate. Please upload it below:");
            setCurrentUploadType('gst');
            setShowFileUpload(true);
            setCurrentStep('gstUpload');
          }, 1000);
        } else if (option === "Request custom pricing" || option === "Show me individual pricing") {
          addBotMessage(
            `I'd be happy to help with custom pricing! 💰\n\n` +
            `Please tell me more about your specific requirements:\n` +
            `• Expected monthly transaction volume?\n` +
            `• Number of locations/terminals needed?\n` +
            `• Any specific integrations required?\n` +
            `• Timeline for implementation?\n\n` +
            `Type your requirements and I'll create a customized proposal.`
          );
          setCurrentStep('negotiation');
        } else if (option === "Ask for discount") {
          addBotMessage(
            `I understand you're looking for better pricing! 💰\n\n` +
            `Let me check what discounts we can offer:\n\n` +
            `✅ **Early Bird Discount**: 10% off on all transaction rates\n` +
            `✅ **Annual Payment**: Additional 15% off for yearly payment\n` +
            `✅ **Volume Discount**: Based on your transaction volume\n\n` +
            `Would you like to proceed with these discounts, or do you have other requirements?`,
            ["Accept early bird discount", "Prefer annual payment discount", "Need volume-based pricing"]
          );
          setCurrentStep('negotiationResponse');
        } else if (option === "I need to negotiate" || option === "I need more information") {
          addBotMessage(
            `Absolutely! I'm here to help find the best solution for your business. 🤝\n\n` +
            `Please share your budget constraints or specific pricing expectations, and I'll work with our team to create a suitable offer.\n\n` +
            `What are your main concerns or requirements?`
          );
          setCurrentStep('negotiation');
        }
        break;

      case 'negotiationResponse':
        if (option === "Accept this offer" || option === "Accept early bird discount" || option === "Prefer annual payment discount") {
          setMerchantData(prev => ({ ...prev, finalPricing: option }));
          addBotMessage(
            `Wonderful! 🎉 Your pricing is confirmed.\n\n` +
            `Now let's proceed with the documentation. I'll need to collect some important business documents to complete your onboarding.`
          );
          setTimeout(() => {
            addBotMessage("Let's start with your GST certificate. Please upload it below:");
            setCurrentUploadType('gst');
            setShowFileUpload(true);
            setCurrentStep('gstUpload');
          }, 1000);
        } else if (option === "I need more time to decide") {
          addBotMessage(
            `No problem at all! 😊 Take your time to review our offer.\n\n` +
            `This special pricing will remain valid for the next 48 hours. You can contact me anytime to proceed.\n\n` +
            `In the meantime, would you like me to send you a detailed proposal via email?`,
            ["Yes, email me the proposal", "I'll contact you later", "Continue with standard pricing"]
          );
        } else if (option === "Discuss further modifications") {
          addBotMessage(
            `Of course! I'm here to find the perfect solution. 🤝\n\n` +
            `What specific modifications would you like to discuss? Please share your thoughts.`
          );
          setCurrentStep('negotiation');
        }
        break;

      case 'evaluation':
        if (option === "Download Complete Application PDF" || option === "Download Application PDF") {
          console.log('Generating PDF with merchant data:', merchantData);
          generateMerchantOnboardingPDF(merchantData);
          addBotMessage(
            `📄 Complete application PDF downloaded successfully!\n\n` +
            `🔐 For digital sign-off and verification, I'm sending OTP to:\n` +
            `📱 Mobile: ${merchantData.mobileNumber || merchantData.email}\n` +
            `📧 Email: ${merchantData.email}\n\n` +
            `Please enter both OTPs to complete your merchant onboarding.`
          );
          
          setTimeout(() => {
            setShowOTPVerification(true);
            setCurrentStep('otpVerification');
          }, 1000);
        }
        break;

      case 'kycConfirmation':
        if (option === "Yes, link this account") {
          // Ensure complete KYC data is set with user's information
          const updatedKYCData = {
            ...mockKYCData,
            fullName: merchantData.name,
            businessName: merchantData.businessName
          };
          
          setMerchantData(prev => ({ 
            ...prev, 
            confirmLinking: true, 
            kycData: updatedKYCData 
          }));
          
          addBotMessage(
            `Perfect! ✅ Account linking confirmed.\n\n` +
            `📄 Generating comprehensive merchant onboarding document with:\n` +
            `• Your Business Information\n` +
            `• KYC Details (GST: ${updatedKYCData.gstNumber}, PAN: ${updatedKYCData.panNumber})\n` +
            `• Director Information (${updatedKYCData.directorDetails.length} directors)\n` +
            `• Complete Shareholding Structure\n` +
            `• Registration Details\n\n` +
            `Click below to download and proceed with digital verification.`,
            ["Generate Complete PDF & Proceed"]
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
            `Our KYC team will contact you within 24 hours to complete the verification process.`
          );
          setCurrentStep('completed');
        }
        break;

      case 'pdfGeneration':
        if (option === "Generate Complete PDF & Proceed" || option === "Generate PDF & Proceed") {
          console.log('Generating comprehensive PDF with all data:', merchantData);
          generateMerchantOnboardingPDF(merchantData);
          
          addBotMessage(
            `📄 Comprehensive PDF downloaded successfully!\n\n` +
            `🔐 For digital sign-off and verification, I'm sending OTP to:\n` +
            `📱 Mobile: ${merchantData.mobileNumber}\n` +
            `📧 Email: ${merchantData.email}\n\n` +
            `Please enter both OTPs to complete your merchant onboarding.`
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
    
    // Generate a case number
    const caseNumber = `CASE${Date.now().toString().slice(-8)}`;
    
    // Add congratulatory image first
    const congratsMessage: ChatMessageType = {
      id: `congrats-${Date.now()}`,
      text: '',
      isBot: true,
      timestamp: new Date(),
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop&crop=center'
    };
    setMessages(prev => [...prev, congratsMessage]);
    
    // Add formatted success message
    setTimeout(() => {
      addBotMessage(
        `🎉 **CONGRATULATIONS!** 🎉\n\n` +
        `✅ **Your Merchant Onboarding is Complete!**\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📋 **Case Number: ${caseNumber}**\n\n` +
        `👤 **Merchant Details:**\n` +
        `• Name: ${merchantData.name}\n` +
        `• Business: ${merchantData.businessName}\n` +
        `• Email: ${merchantData.email}\n` +
        `• Mobile: ${merchantData.mobileNumber}\n\n` +
        `🏢 **Account Information:**\n` +
        `• Linked Account: ${merchantData.kycData?.accountNumber}\n` +
        `• GST Number: ${merchantData.kycData?.gstNumber}\n` +
        `• PAN Number: ${merchantData.kycData?.panNumber}\n` +
        `• Directors Verified: ${merchantData.kycData?.directorDetails?.length || 0}\n\n` +
        `🔐 **Verification Status:**\n` +
        `• Documents: ✅ Digitally Signed & Verified\n` +
        `• OTP Verification: ✅ Successfully Completed\n` +
        `• KYC Status: ✅ Approved\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `👨‍💼 **Assigned Merchant Representative:**\n` +
        `• Name: Mr. Devesh Kumar\n` +
        `• Mobile: +919871299447\n` +
        `• Mr. Devesh Kumar will contact you soon and keep you posted with the status of your application.\n\n` +
        `🚀 **What's Next?**\n\n` +
        `Your POS and Payment Gateway services will be activated within **2-4 hours**.\n\n` +
        `📧 You'll receive an email with:\n` +
        `• Account activation details\n` +
        `• POS setup instructions\n` +
        `• Payment gateway configuration\n` +
        `• 24/7 support contact information\n\n` +
        `🎯 **Welcome to our merchant family!**\n` +
        `Thank you for choosing us for your payment solutions. We're excited to help grow your business!\n\n` +
        `📞 Need immediate assistance? Contact our support team at support@merchant.com`
      );
      setCurrentStep('completed');
    }, 1000);
  };

  const handleResendOTP = async () => {
    addBotMessage(`🔄 Resending OTP to your mobile number...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    addBotMessage(`✅ OTP sent to your mobile number successfully!`);
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

  const startAIMode = () => {
    console.log('=== STARTING AI MODE ===');
    console.log('Setting isAIMode to true');
    setIsAIMode(true);
    
    const welcomeMessage = "🤖 Hi! I'm your AI assistant. Ask me anything about the merchant onboarding process!";
    const options = ["What documents do I need?", "How long does it take?", "What are the costs?", "Continue with onboarding"];
    
    console.log('Adding AI welcome message');
    addBotMessage(welcomeMessage, options, true);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <img src={clickstartLogo} alt="ClickStart.ai" className="h-16 mx-auto mb-4" />
          <p className="text-muted-foreground">POS & Payment Gateway Services</p>
        </div>

        <Card className="shadow-xl border-border bg-card">
          <CardHeader className="bg-card border-b border-border rounded-t-lg">
            <CardTitle className="text-center flex items-center justify-between text-foreground">
              <span>Onboarding Assistant</span>
              {!isAIMode && currentStep !== 'completed' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startAIMode}
                >
                  🤖 Ask AI
                </Button>
              )}
            </CardTitle>
            <ProgressBar currentStep={currentStep} />
          </CardHeader>
          
          <CardContent className="h-96 overflow-y-auto p-6 bg-background">
            {messages.map((message) => {
              if (message.text === 'PRICING_TABLE_COMPONENT') {
                return (
                  <div key={message.id} className="mb-4">
                    {renderPricingTable()}
                  </div>
                );
              } else if (message.text === 'POS_OPTIONS_COMPONENT') {
                return (
                  <div key={message.id} className="mb-4">
                    {renderPOSOptions()}
                  </div>
                );
              } else if (message.text === 'PG_PLANS_COMPONENT') {
                return (
                  <div key={message.id} className="mb-4">
                    {renderPGPlans()}
                  </div>
                );
              } else if (message.text === 'BOTH_OPTIONS_COMPONENT') {
                return (
                  <div key={message.id} className="mb-4">
                    {renderPOSOptions()}
                    {renderPGPlans()}
                  </div>
                );
              } else {
                return (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onOptionSelect={handleOptionSelect}
                  />
                );
              }
            })}
            
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-card border border-border rounded-lg px-4 py-3 shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {showOTPVerification && (
              <div className="mb-4">
                <OTPVerification
                  mobileNumber={merchantData.mobileNumber || ''}
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
            <div className="p-4 border-t border-border bg-card rounded-b-lg">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isAIMode ? "Ask me anything about merchant onboarding..." : "Type your response..."}
                  disabled={isLoading}
                  className="flex-1"
                />
                <VoiceInput
                  onVoiceInput={handleVoiceInput}
                  disabled={isLoading}
                  placeholder={isAIMode ? "Ask me anything..." : "Speak your response..."}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !inputValue.trim()}
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

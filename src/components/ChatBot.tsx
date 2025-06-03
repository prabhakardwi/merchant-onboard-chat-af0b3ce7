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
import { getMerchantOnboardingResponse } from '@/utils/aiHelper';

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

  const pricingPlans = [
    {
      name: "Starter Plan",
      price: "₹2,999/month",
      features: [
        "POS Terminal",
        "Payment Gateway",
        "Basic Analytics",
        "Email Support",
        "Transaction Fee: 2.5%"
      ]
    },
    {
      name: "Business Plan",
      price: "₹4,999/month",
      features: [
        "2 POS Terminals",
        "Advanced Payment Gateway",
        "Detailed Analytics",
        "Priority Support",
        "Transaction Fee: 2.0%",
        "Inventory Management"
      ]
    },
    {
      name: "Enterprise Plan",
      price: "₹8,999/month",
      features: [
        "5 POS Terminals",
        "Premium Payment Gateway",
        "Advanced Analytics & Reports",
        "24/7 Phone Support",
        "Transaction Fee: 1.8%",
        "Full Inventory Management",
        "Custom Integrations"
      ]
    }
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
        
        // Show pricing options after annual turnover
        const pricingMessage = `Perfect! Based on your business profile, here are our pricing plans:\n\n` +
          pricingPlans.map((plan, index) => 
            `**${plan.name}** - ${plan.price}\n` +
            plan.features.map(feature => `• ${feature}`).join('\n') + '\n'
          ).join('\n') +
          `\nWhich plan interests you the most?`;
          
        addBotMessage(pricingMessage, pricingPlans.map(plan => plan.name));
        setCurrentStep('pricingOptions');
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
            `✅ **Special Discount**: 15% off for the first 6 months\n` +
            `✅ **Reduced Transaction Fee**: 0.2% lower than standard rates\n` +
            `✅ **Free Setup**: No installation charges\n` +
            `✅ **Extended Trial**: 30-day free trial period\n\n` +
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

      case 'pricingOptions':
        setMerchantData(prev => ({ ...prev, selectedPlan: option }));
        
        const selectedPlan = pricingPlans.find(plan => plan.name === option);
        addBotMessage(
          `Excellent choice! You've selected the **${option}** at ${selectedPlan?.price}.\n\n` +
          `💡 **Good news!** We offer flexible pricing and can customize plans based on your specific needs.\n\n` +
          `Would you like to:\n` +
          `• Proceed with the standard pricing\n` +
          `• Discuss custom pricing options\n` +
          `• Request a special discount\n\n` +
          `What would you prefer?`,
          ["Proceed with standard pricing", "Request custom pricing", "Ask for discount", "I need to negotiate"]
        );
        setCurrentStep('negotiation');
        break;

      case 'negotiation':
        if (option === "Proceed with standard pricing") {
          addBotMessage(
            `Perfect! 🎯 You've chosen to proceed with the **${merchantData.selectedPlan}**.\n\n` +
            `Let's continue with the documentation process. I'll need to collect some important documents.`
          );
          setTimeout(() => {
            addBotMessage("Let's start with your GST certificate. Please upload it below:");
            setCurrentUploadType('gst');
            setShowFileUpload(true);
            setCurrentStep('gstUpload');
          }, 1000);
        } else if (option === "Request custom pricing") {
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
            `✅ **Early Bird Discount**: 10% off for immediate signup\n` +
            `✅ **Annual Payment**: Additional 15% off for yearly payment\n` +
            `✅ **Volume Discount**: Based on your transaction volume\n\n` +
            `Would you like to proceed with these discounts, or do you have other requirements?`,
            ["Accept early bird discount", "Prefer annual payment discount", "Need volume-based pricing"]
          );
          setCurrentStep('negotiationResponse');
        } else if (option === "I need to negotiate") {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Merchant Onboarding</h1>
          <p className="text-gray-600">POS & Payment Gateway Services</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="text-center flex items-center justify-between">
              <span>Onboarding Assistant</span>
              {!isAIMode && currentStep !== 'completed' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-white hover:bg-blue-50"
                  onClick={startAIMode}
                >
                  🤖 Ask AI
                </Button>
              )}
            </CardTitle>
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
                  mobileNumber={merchantData.mobileNumber || merchantData.email || ''}
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
                  placeholder={isAIMode ? "Ask me anything about merchant onboarding..." : "Type your response..."}
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

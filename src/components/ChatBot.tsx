
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ChatMessage from './ChatMessage';
import ProgressBar from './ProgressBar';
import { ChatMessage as ChatMessageType, MerchantData, OnboardingStep, KYCData } from '@/types/merchant';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    status: 'verified'
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
            `Welcome aboard! 🎉 Thank you for choosing our services.\n\n` +
            `📋 Summary:\n` +
            `• Name: ${merchantData.name}\n` +
            `• Business: ${merchantData.businessName}\n` +
            `• Email: ${merchantData.email}\n` +
            `• New Customer: Yes\n\n` +
            `Our team will contact you within 24 hours to complete your KYC verification and set up your POS and payment gateway services!`
          );
          setCurrentStep('completed');
        }
        break;

      case 'kycConfirmation':
        if (option === "Yes, link this account") {
          setMerchantData(prev => ({ ...prev, confirmLinking: true }));
          addBotMessage(
            `Perfect! ✅ Your account has been successfully linked.\n\n` +
            `📋 Final Summary:\n` +
            `• Personal Name: ${merchantData.name}\n` +
            `• New Business: ${merchantData.businessName}\n` +
            `• Email: ${merchantData.email}\n` +
            `• Linked Account: ${mockKYCData.accountNumber}\n` +
            `• Mobile: ${merchantData.mobileNumber}\n\n` +
            `🚀 Your onboarding is complete! Our team will activate your POS and payment gateway services within 2-4 hours.`
          );
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
        }
        setCurrentStep('completed');
        break;

      default:
        break;
    }

    setIsLoading(false);
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
            
            <div ref={messagesEndRef} />
          </CardContent>

          {currentStep !== 'completed' && (
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

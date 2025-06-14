
import { StoredCustomerData } from './customerStorage';

export const getMerchantOnboardingResponse = (question: string, customerData?: StoredCustomerData | null): string => {
  const lowerQuestion = question.toLowerCase();
  
  // Personalized responses for returning customers
  if (customerData) {
    if (lowerQuestion.includes('status') || lowerQuestion.includes('progress')) {
      const summary = getCustomerProgressSummary(customerData);
      return `📊 **Your Onboarding Status:**\n\n${summary}\n\n` +
             `Need help with next steps or have any questions?`;
    }
    
    if (lowerQuestion.includes('representative') || lowerQuestion.includes('contact')) {
      if (customerData.assignedRepresentative) {
        return `👨‍💼 **Your Assigned Representative:**\n\n` +
               `• Name: ${customerData.assignedRepresentative.name}\n` +
               `• Mobile: ${customerData.assignedRepresentative.mobile}\n\n` +
               `Feel free to contact them directly for any assistance!`;
      } else {
        return `📞 **Representative Assignment:**\n\n` +
               `Your representative will be assigned once your onboarding is complete.\n` +
               `For now, you can contact our support team or continue with me for any questions.`;
      }
    }
    
    if (lowerQuestion.includes('my') && (lowerQuestion.includes('service') || lowerQuestion.includes('plan'))) {
      let response = `🔍 **Your Selected Services:**\n\n`;
      
      if (customerData.serviceType) {
        response += `🛠️ **Service Type:** ${customerData.serviceType}\n`;
      }
      
      if (customerData.selectedPOSModel) {
        response += `🏪 **POS Model:** ${customerData.selectedPOSModel}\n`;
      }
      
      if (customerData.selectedPGPlan) {
        response += `💳 **Payment Gateway Plan:** ${customerData.selectedPGPlan}\n`;
      }
      
      if (!customerData.serviceType && !customerData.selectedPOSModel && !customerData.selectedPGPlan) {
        response += `No services selected yet. Would you like to explore our options?`;
      }
      
      return response;
    }
  }
  
  // Original responses for general questions
  if (lowerQuestion.includes('document') || lowerQuestion.includes('upload')) {
    return `📄 **Document Requirements:**\n\n` +
           `For merchant onboarding, you'll need to upload:\n` +
           `• GST Certificate - Your business GST registration\n` +
           `• PAN Document - Business PAN card/certificate\n` +
           `• Incorporation Certificate - Company registration document\n` +
           `• MOA (Memorandum of Association) - Contains director and shareholding details\n\n` +
           `💡 **Tip:** Ensure all documents are clear, readable PDF/image files.`;
  }
  
  if (lowerQuestion.includes('kyc') || lowerQuestion.includes('verification')) {
    return `🔍 **KYC Verification Process:**\n\n` +
           `• If you're an existing customer, we'll fetch your KYC details using your mobile number\n` +
           `• For new customers, we'll extract information from your uploaded documents\n` +
           `• All documents are processed automatically to extract business details\n` +
           `• Final verification is done through OTP sent to your mobile and email\n\n` +
           `⏱️ **Timeline:** KYC verification typically completes within 2-4 hours.`;
  }
  
  if (lowerQuestion.includes('time') || lowerQuestion.includes('how long') || lowerQuestion.includes('duration')) {
    return `⏰ **Onboarding Timeline:**\n\n` +
           `• **Document Upload:** 5-10 minutes\n` +
           `• **Document Processing:** Instant (automated)\n` +
           `• **OTP Verification:** 2-3 minutes\n` +
           `• **Account Activation:** 2-4 hours\n` +
           `• **POS Setup:** Same day after activation\n\n` +
           `📞 Your assigned representative will contact you for POS installation.`;
  }
  
  if (lowerQuestion.includes('cost') || lowerQuestion.includes('fee') || lowerQuestion.includes('price') || lowerQuestion.includes('charge')) {
    return `💰 **Pricing Information:**\n\n` +
           `• **Onboarding:** Free of charge\n` +
           `• **POS Device:** Provided at competitive rates\n` +
           `• **Transaction Fees:** Industry-standard rates based on your business category\n` +
           `• **Setup Fees:** Waived for most business types\n\n` +
           `💡 Your merchant representative will discuss detailed pricing based on your specific requirements.`;
  }
  
  if (lowerQuestion.includes('pos') || lowerQuestion.includes('payment gateway') || lowerQuestion.includes('services')) {
    return `🏪 **Our Services:**\n\n` +
           `**POS Solutions:**\n` +
           `• Mobile POS devices\n` +
           `• Desktop POS systems\n` +
           `• Card readers and terminals\n\n` +
           `**Payment Gateway:**\n` +
           `• Online payment processing\n` +
           `• UPI, card, and wallet integration\n` +
           `• Real-time transaction monitoring\n` +
           `• Detailed analytics and reports\n\n` +
           `📱 24/7 customer support included with all services.`;
  }
  
  if (lowerQuestion.includes('support') || lowerQuestion.includes('help') || lowerQuestion.includes('contact')) {
    return `📞 **Support Information:**\n\n` +
           `**During Onboarding:**\n` +
           `• Use this chat for immediate assistance\n` +
           `• Your assigned representative: Mr. Devesh Kumar (+919871299447)\n\n` +
           `**After Onboarding:**\n` +
           `• Email: support@merchant.com\n` +
           `• Phone: 24/7 helpline available\n` +
           `• Live chat: Available on merchant portal\n\n` +
           `🕒 We typically respond within 15 minutes during business hours.`;
  }
  
  if (lowerQuestion.includes('business category') || lowerQuestion.includes('category')) {
    return `🏢 **Business Categories We Support:**\n\n` +
           `• Retail & Consumer Goods\n` +
           `• Healthcare & Wellness\n` +
           `• Food & Beverage\n` +
           `• Automobile & Transport\n` +
           `• E-commerce & Online Services\n` +
           `• Home & Living\n` +
           `• Financial Services\n` +
           `• Education & Training\n` +
           `• Professional Services\n` +
           `• Telecom & Utilities\n` +
           `• Travel & Entertainment & Events\n\n` +
           `💡 Each category has tailored features and pricing.`;
  }
  
  if (lowerQuestion.includes('error') || lowerQuestion.includes('problem') || lowerQuestion.includes('issue')) {
    return `🔧 **Common Issues & Solutions:**\n\n` +
           `**Document Upload Issues:**\n` +
           `• Ensure file size is under 10MB\n` +
           `• Use PDF, JPG, or PNG formats\n` +
           `• Check internet connection\n\n` +
           `**OTP Not Received:**\n` +
           `• Check spam/junk folder\n` +
           `• Verify mobile number is correct\n` +
           `• Use the resend option\n\n` +
           `**Need More Help?** Contact Mr. Devesh Kumar at +919871299447`;
  }
  
  // Default response for unrecognized questions
  return `🤖 **AI Assistant Help**\n\n` +
         `I can help you with questions about:\n` +
         `• Document requirements and upload process\n` +
         `• KYC verification steps\n` +
         `• Timeline and duration\n` +
         `• Pricing and fees\n` +
         `• POS and payment gateway services\n` +
         `• Support and contact information\n` +
         `• Business categories\n` +
         `• Troubleshooting common issues\n\n` +
         (customerData ? `• Your onboarding status and progress\n• Your assigned representative\n• Your selected services\n\n` : '') +
         `❓ **Try asking:** "What documents do I need?" or "How long does onboarding take?"\n\n` +
         `For specific technical issues, contact Mr. Devesh Kumar at +919871299447`;
};

const getCustomerProgressSummary = (customerData: StoredCustomerData): string => {
  const progressSteps = customerData.conversationHistory.length;
  const completionPercentage = customerData.isOnboardingComplete ? 100 : Math.min((progressSteps / 15) * 100, 95);
  
  let summary = `📊 **Progress:** ${Math.round(completionPercentage)}% Complete (${progressSteps} steps completed)\n\n`;
  
  if (customerData.conversationHistory.length > 0) {
    const recentSteps = customerData.conversationHistory.slice(-3);
    summary += `📍 **Recent Activity:**\n`;
    recentSteps.forEach((step, index) => {
      const date = step.timestamp.toLocaleDateString();
      summary += `${index + 1}. ${step.step} - ${date}\n`;
    });
  }
  
  if (customerData.isOnboardingComplete) {
    summary += `\n✅ **Status:** Onboarding Complete!\n`;
    summary += `🎉 Welcome to our merchant family!`;
  } else {
    summary += `\n⏳ **Status:** In Progress\n`;
    summary += `📞 Continue where you left off or ask me any questions!`;
  }
  
  return summary;
};

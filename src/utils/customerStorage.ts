
export interface StoredCustomerData {
  id: string;
  name: string;
  businessName: string;
  email: string;
  mobileNumber?: string;
  serviceType?: 'payment-gateway' | 'pos-machine' | 'both';
  selectedPOSModel?: string;
  selectedPGPlan?: string;
  businessCategory?: string;
  annualTurnover?: string;
  onboardingStep?: string;
  lastVisit: Date;
  conversationHistory: {
    step: string;
    timestamp: Date;
    data: any;
  }[];
  isOnboardingComplete: boolean;
  assignedRepresentative?: {
    name: string;
    mobile: string;
  };
}

const CUSTOMER_DATA_KEY = 'merchant_customer_data';

export const saveCustomerData = (customerData: StoredCustomerData): void => {
  try {
    const existingData = getStoredCustomersData();
    const customerIndex = existingData.findIndex(c => c.email === customerData.email);
    
    if (customerIndex >= 0) {
      existingData[customerIndex] = { ...customerData, lastVisit: new Date() };
    } else {
      existingData.push({ ...customerData, lastVisit: new Date() });
    }
    
    localStorage.setItem(CUSTOMER_DATA_KEY, JSON.stringify(existingData));
    console.log('Customer data saved successfully:', customerData.email);
  } catch (error) {
    console.error('Error saving customer data:', error);
  }
};

export const getCustomerByEmail = (email: string): StoredCustomerData | null => {
  try {
    const customers = getStoredCustomersData();
    const customer = customers.find(c => c.email.toLowerCase() === email.toLowerCase());
    return customer || null;
  } catch (error) {
    console.error('Error retrieving customer data:', error);
    return null;
  }
};

export const getStoredCustomersData = (): StoredCustomerData[] => {
  try {
    const storedData = localStorage.getItem(CUSTOMER_DATA_KEY);
    if (!storedData) return [];
    
    const parsedData = JSON.parse(storedData);
    // Convert date strings back to Date objects
    return parsedData.map((customer: any) => ({
      ...customer,
      lastVisit: new Date(customer.lastVisit),
      conversationHistory: customer.conversationHistory?.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      })) || []
    }));
  } catch (error) {
    console.error('Error parsing stored customer data:', error);
    return [];
  }
};

export const updateCustomerProgress = (email: string, step: string, data: any): void => {
  const customer = getCustomerByEmail(email);
  if (customer) {
    customer.conversationHistory.push({
      step,
      timestamp: new Date(),
      data
    });
    customer.onboardingStep = step;
    saveCustomerData(customer);
  }
};

export const generateCustomerId = (): string => {
  return `CUST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getCustomerSummary = (customer: StoredCustomerData): string => {
  const lastVisit = customer.lastVisit.toLocaleDateString();
  const progressSteps = customer.conversationHistory.length;
  
  let summary = `🔍 **Customer History Found!**\n\n`;
  summary += `👤 **Name:** ${customer.name}\n`;
  summary += `🏢 **Business:** ${customer.businessName}\n`;
  summary += `📧 **Email:** ${customer.email}\n`;
  summary += `📱 **Mobile:** ${customer.mobileNumber || 'Not provided'}\n`;
  summary += `📅 **Last Visit:** ${lastVisit}\n`;
  summary += `📊 **Progress Steps:** ${progressSteps}\n\n`;
  
  if (customer.serviceType) {
    summary += `🛠️ **Service Interest:** ${customer.serviceType}\n`;
  }
  
  if (customer.selectedPOSModel) {
    summary += `🏪 **POS Model:** ${customer.selectedPOSModel}\n`;
  }
  
  if (customer.selectedPGPlan) {
    summary += `💳 **PG Plan:** ${customer.selectedPGPlan}\n`;
  }
  
  if (customer.businessCategory) {
    summary += `🏢 **Category:** ${customer.businessCategory}\n`;
  }
  
  if (customer.annualTurnover) {
    summary += `💰 **Turnover:** ${customer.annualTurnover}\n`;
  }
  
  if (customer.isOnboardingComplete) {
    summary += `\n✅ **Status:** Onboarding Complete\n`;
    if (customer.assignedRepresentative) {
      summary += `👨‍💼 **Representative:** ${customer.assignedRepresentative.name} (${customer.assignedRepresentative.mobile})\n`;
    }
  } else {
    summary += `\n⏳ **Status:** Onboarding In Progress\n`;
    if (customer.onboardingStep) {
      summary += `📍 **Last Step:** ${customer.onboardingStep}\n`;
    }
  }
  
  return summary;
};

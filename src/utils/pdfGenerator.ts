
import jsPDF from 'jspdf';
import { MerchantData } from '@/types/merchant';

export const generateMerchantOnboardingPDF = (merchantData: MerchantData): void => {
  console.log('Generating PDF with data:', merchantData);
  
  const doc = new jsPDF();
  
  // Header with company logo space
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, 210, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPREHENSIVE MERCHANT ONBOARDING', 15, 17);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Document details box
  doc.setFillColor(248, 249, 250);
  doc.rect(15, 35, 180, 25, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(15, 35, 180, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Document Generated: ${new Date().toLocaleDateString()}`, 20, 42);
  doc.text(`Document Time: ${new Date().toLocaleTimeString()}`, 20, 48);
  doc.text(`Application ID: APP-${Date.now().toString().slice(-8)}`, 20, 54);
  doc.text(`Status: Digitally Verified & Processed`, 20, 60);
  
  let yPosition = 75;
  
  // Personal Information Section
  doc.setFillColor(52, 152, 219);
  doc.rect(15, yPosition, 180, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('APPLICANT INFORMATION', 20, yPosition + 6);
  
  yPosition += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const personalInfo = [
    ['Full Name:', merchantData.name || 'Not provided'],
    ['Email Address:', merchantData.email || 'Not provided'],
    ['Mobile Number:', merchantData.mobileNumber || 'Not provided'],
    ['Customer Type:', merchantData.isExistingCustomer ? 'Existing Customer (Account Linked)' : 'New Customer'],
    ['Business Category:', merchantData.businessCategory || 'Not specified'],
    ['Annual Turnover:', merchantData.annualTurnover || 'Not specified']
  ];
  
  personalInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 85, yPosition);
    yPosition += 7;
  });
  
  yPosition += 10;
  
  // Business Information Section
  doc.setFillColor(52, 152, 219);
  doc.rect(15, yPosition, 180, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BUSINESS INFORMATION', 20, yPosition + 6);
  
  yPosition += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  
  const businessInfo = [
    ['Business Name:', merchantData.businessName || 'Not provided'],
    ['Registration Number:', merchantData.kycData?.registrationNumber || 'Not available'],
    ['GST Number:', merchantData.kycData?.gstNumber || 'Not available'],
    ['PAN Number:', merchantData.kycData?.panNumber || 'Not available'],
    ['Business Address:', merchantData.kycData?.address || 'Not available'],
    ['Account Number:', merchantData.kycData?.accountNumber || 'Not available'],
    ['KYC Status:', merchantData.kycData?.status || 'Pending']
  ];
  
  businessInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPosition);
    doc.setFont('helvetica', 'normal');
    const wrappedText = doc.splitTextToSize(value, 100);
    doc.text(wrappedText, 85, yPosition);
    yPosition += wrappedText.length * 7;
  });
  
  // Document Uploads Section
  yPosition += 10;
  
  doc.setFillColor(52, 152, 219);
  doc.rect(15, yPosition, 180, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DOCUMENTS SUBMITTED', 20, yPosition + 6);
  
  yPosition += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  
  const documents = [
    ['GST Certificate:', merchantData.gstDocument ? `✓ ${merchantData.gstDocument.name}` : '✗ Not uploaded'],
    ['PAN Document:', merchantData.panDocument ? `✓ ${merchantData.panDocument.name}` : '✗ Not uploaded'],
    ['Incorporation Certificate:', merchantData.incorporationCertificate ? `✓ ${merchantData.incorporationCertificate.name}` : '✗ Not uploaded'],
    ['MOA Document:', merchantData.moaDocument ? `✓ ${merchantData.moaDocument.name}` : '✗ Not uploaded']
  ];
  
  documents.forEach(([label, status]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPosition);
    doc.setFont('helvetica', 'normal');
    if (status.includes('✓')) {
      doc.setTextColor(0, 128, 0);
    } else {
      doc.setTextColor(255, 0, 0);
    }
    doc.text(status, 85, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 7;
  });
  
  // Director Details Section
  if (merchantData.kycData?.directorDetails && merchantData.kycData.directorDetails.length > 0) {
    yPosition += 15;
    
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.setFillColor(52, 152, 219);
    doc.rect(15, yPosition, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DIRECTOR DETAILS', 20, yPosition + 6);
    
    yPosition += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    
    merchantData.kycData.directorDetails.forEach((director, index) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`Director ${index + 1}:`, 20, yPosition);
      yPosition += 7;
      
      const directorInfo = [
        ['Name:', director.name || 'Not available'],
        ['Designation:', director.designation || 'Not available'],
        ['PAN Number:', director.panNumber || 'Not available'],
        ['Shareholding:', director.shareholding || 'Not available']
      ];
      
      directorInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'normal');
        doc.text(`  ${label}`, 25, yPosition);
        doc.text(value, 85, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
      
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
    });
  }
  
  // Shareholding Structure Section
  if (merchantData.kycData?.shareholdingDetails && merchantData.kycData.shareholdingDetails.length > 0) {
    yPosition += 10;
    
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.setFillColor(52, 152, 219);
    doc.rect(15, yPosition, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SHAREHOLDING STRUCTURE', 20, yPosition + 6);
    
    yPosition += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    
    // Calculate total percentage
    const totalPercentage = merchantData.kycData.shareholdingDetails.reduce((sum, shareholder) => sum + shareholder.sharePercentage, 0);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Shareholding: ${totalPercentage}%`, 20, yPosition);
    yPosition += 10;
    
    merchantData.kycData.shareholdingDetails.forEach((shareholder, index) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${shareholder.shareholderName}`, 20, yPosition);
      yPosition += 7;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`   Share Type: ${shareholder.shareType}`, 25, yPosition);
      yPosition += 6;
      doc.text(`   Percentage: ${shareholder.sharePercentage}%`, 25, yPosition);
      yPosition += 10;
      
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
    });
  }
  
  // Verification Status Section
  yPosition += 15;
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 30;
  }
  
  doc.setFillColor(40, 167, 69);
  doc.rect(15, yPosition, 180, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('VERIFICATION STATUS', 20, yPosition + 6);
  
  yPosition += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const verificationInfo = [
    ['Document Verification:', 'Complete ✓'],
    ['Digital Sign-off:', merchantData.confirmLinking ? 'Completed ✓' : 'Pending'],
    ['KYC Status:', merchantData.kycData?.status === 'verified' ? 'Verified ✓' : 'Under Review'],
    ['Application Status:', 'Submitted for Review'],
    ['Expected Processing Time:', '2-4 business hours for service activation']
  ];
  
  verificationInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPosition);
    doc.setFont('helvetica', 'normal');
    if (value.includes('✓')) {
      doc.setTextColor(0, 128, 0);
    }
    doc.text(value, 85, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 7;
  });
  
  // Footer
  yPosition += 20;
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 30;
  }
  
  doc.setFillColor(248, 249, 250);
  doc.rect(15, yPosition, 180, 30, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(15, yPosition, 180, 30);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('This comprehensive document contains all extracted business information and verification details.', 20, yPosition + 8);
  doc.text('All information has been processed from uploaded documents and verified through digital sign-off.', 20, yPosition + 14);
  doc.text('For any queries or support, contact: support@company.com | Phone: +91-1234567890', 20, yPosition + 20);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPosition + 26);
  
  // Download the PDF
  const fileName = merchantData.businessName 
    ? `${merchantData.businessName.replace(/\s+/g, '_')}_Complete_Merchant_Application.pdf`
    : 'Complete_Merchant_Application.pdf';
  
  console.log('Downloading PDF:', fileName);
  doc.save(fileName);
};

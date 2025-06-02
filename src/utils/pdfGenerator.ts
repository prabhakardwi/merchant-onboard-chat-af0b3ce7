
import jsPDF from 'jspdf';
import { MerchantData } from '@/types/merchant';

export const generateMerchantOnboardingPDF = (merchantData: MerchantData): void => {
  const doc = new jsPDF();
  
  // Header with company logo space
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, 210, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('MERCHANT ONBOARDING DOCUMENT', 20, 17);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Document details box
  doc.setFillColor(248, 249, 250);
  doc.rect(15, 35, 180, 20, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(15, 35, 180, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Document Generated: ${new Date().toLocaleDateString()}`, 20, 42);
  doc.text(`Application ID: APP-${Date.now().toString().slice(-8)}`, 20, 48);
  doc.text(`Status: Under Evaluation`, 20, 54);
  
  let yPosition = 70;
  
  // Personal Information Section
  doc.setFillColor(52, 152, 219);
  doc.rect(15, yPosition, 180, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PERSONAL INFORMATION', 20, yPosition + 6);
  
  yPosition += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const personalInfo = [
    ['Full Name:', merchantData.name],
    ['Email Address:', merchantData.email],
    ['Mobile Number:', merchantData.mobileNumber || 'Not provided'],
    ['Customer Type:', merchantData.isExistingCustomer ? 'Existing Customer' : 'New Customer']
  ];
  
  personalInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 80, yPosition);
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
    ['Business Name:', merchantData.businessName],
    ['Business Category:', merchantData.businessCategory || 'Not specified'],
    ['Annual Turnover:', merchantData.annualTurnover || 'Not specified']
  ];
  
  if (merchantData.kycData) {
    businessInfo.push(
      ['Registration Number:', merchantData.kycData.registrationNumber],
      ['GST Number:', merchantData.kycData.gstNumber],
      ['PAN Number:', merchantData.kycData.panNumber],
      ['Business Address:', merchantData.kycData.address]
    );
  }
  
  businessInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPosition);
    doc.setFont('helvetica', 'normal');
    const wrappedText = doc.splitTextToSize(value, 100);
    doc.text(wrappedText, 80, yPosition);
    yPosition += wrappedText.length * 7;
  });
  
  // Document Uploads Section (for new customers)
  if (!merchantData.isExistingCustomer) {
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
      ['GST Certificate:', merchantData.gstDocument ? '✓ Uploaded' : '✗ Pending'],
      ['PAN Document:', merchantData.panDocument ? '✓ Uploaded' : '✗ Pending'],
      ['Incorporation Certificate:', merchantData.incorporationCertificate ? '✓ Uploaded' : '✗ Pending'],
      ['MOA Document:', merchantData.moaDocument ? '✓ Uploaded' : '✗ Pending']
    ];
    
    documents.forEach(([label, status]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(status.includes('✓') ? 0, 128, 0 : 255, 0, 0);
      doc.text(status, 80, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 7;
    });
  }
  
  // Director Details Section (if available)
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
        ['Name:', director.name],
        ['Designation:', director.designation],
        ['PAN Number:', director.panNumber],
        ['Shareholding:', director.shareholding]
      ];
      
      directorInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'normal');
        doc.text(`  ${label}`, 25, yPosition);
        doc.text(value, 80, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
    });
  }
  
  // Shareholding Structure Section (if available)
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
    
    merchantData.kycData.shareholdingDetails.forEach((shareholder, index) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${shareholder.shareholderName}`, 20, yPosition);
      yPosition += 7;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`   Share Type: ${shareholder.shareType}`, 25, yPosition);
      yPosition += 6;
      doc.text(`   Percentage: ${shareholder.sharePercentage}%`, 25, yPosition);
      yPosition += 10;
    });
  }
  
  // Footer
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 30;
  } else {
    yPosition += 20;
  }
  
  doc.setFillColor(248, 249, 250);
  doc.rect(15, yPosition, 180, 25, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(15, yPosition, 180, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('This document is auto-generated for merchant onboarding purposes.', 20, yPosition + 8);
  doc.text('Please review all information carefully before proceeding.', 20, yPosition + 14);
  doc.text(`For queries, contact support at support@company.com`, 20, yPosition + 20);
  
  // Download the PDF
  const fileName = merchantData.businessName 
    ? `${merchantData.businessName.replace(/\s+/g, '_')}_Merchant_Application.pdf`
    : 'Merchant_Application.pdf';
  
  doc.save(fileName);
};

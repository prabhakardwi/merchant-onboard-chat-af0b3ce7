
import jsPDF from 'jspdf';
import { MerchantData } from '@/types/merchant';

export const generateMerchantOnboardingPDF = (merchantData: MerchantData): void => {
  const doc = new jsPDF();
  const { kycData } = merchantData;
  
  if (!kycData) return;
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Merchant Onboarding Document', 20, 30);
  
  // Merchant Details
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Merchant Information', 20, 50);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Personal Name: ${merchantData.name}`, 20, 65);
  doc.text(`Business Name: ${kycData.businessName}`, 20, 75);
  doc.text(`Email: ${merchantData.email}`, 20, 85);
  doc.text(`Mobile: ${merchantData.mobileNumber || 'N/A'}`, 20, 95);
  doc.text(`Registration Number: ${kycData.registrationNumber}`, 20, 105);
  doc.text(`Account Number: ${kycData.accountNumber}`, 20, 115);
  
  // Address
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Business Address', 20, 135);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Address: ${kycData.address}`, 20, 150);
  
  // Tax Information
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Tax Information', 20, 170);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`GST Number: ${kycData.gstNumber}`, 20, 185);
  doc.text(`PAN Number: ${kycData.panNumber}`, 20, 195);
  
  // Director Details
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Director Details', 20, 215);
  
  let yPosition = 230;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  kycData.directorDetails.forEach((director, index) => {
    doc.text(`Director ${index + 1}:`, 20, yPosition);
    doc.text(`  Name: ${director.name}`, 25, yPosition + 10);
    doc.text(`  Designation: ${director.designation}`, 25, yPosition + 20);
    doc.text(`  PAN: ${director.panNumber}`, 25, yPosition + 30);
    doc.text(`  Shareholding: ${director.shareholding}`, 25, yPosition + 40);
    yPosition += 55;
  });
  
  // Add new page if needed
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 30;
  }
  
  // Shareholding Details
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Shareholding Structure', 20, yPosition);
  
  yPosition += 20;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  kycData.shareholdingDetails.forEach((shareholder, index) => {
    doc.text(`${index + 1}. ${shareholder.shareholderName}`, 20, yPosition);
    doc.text(`   Share Type: ${shareholder.shareType}`, 25, yPosition + 10);
    doc.text(`   Percentage: ${shareholder.sharePercentage}%`, 25, yPosition + 20);
    yPosition += 35;
  });
  
  // Footer
  yPosition += 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('This document is generated for merchant onboarding purposes.', 20, yPosition);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition + 10);
  
  // Download the PDF
  doc.save(`${kycData.businessName.replace(/\s+/g, '_')}_Onboarding_Document.pdf`);
};

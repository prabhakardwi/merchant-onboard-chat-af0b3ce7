
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ShieldCheck } from 'lucide-react';

interface OTPVerificationProps {
  mobileNumber: string;
  email: string;
  onVerifySuccess: () => void;
  onResendOTP: (type: 'mobile' | 'email') => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  mobileNumber,
  email,
  onVerifySuccess,
  onResendOTP
}) => {
  const [mobileOTP, setMobileOTP] = useState('');
  const [emailOTP, setEmailOTP] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (mobileOTP.length !== 6 || emailOTP.length !== 6) {
      setError('Please enter both 6-digit OTPs');
      return;
    }

    setIsVerifying(true);
    setError('');

    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock verification logic - in real app, this would call an API
    if (mobileOTP === '123456' && emailOTP === '654321') {
      onVerifySuccess();
    } else {
      setError('Invalid OTP. Please try again.');
    }

    setIsVerifying(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-6 h-6 text-green-600" />
          OTP Verification
        </CardTitle>
        <p className="text-sm text-gray-600">
          Please enter the OTP sent to your mobile and email
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Mobile OTP */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ShieldCheck className="w-4 h-4" />
            Mobile OTP ({mobileNumber})
          </div>
          <InputOTP
            value={mobileOTP}
            onChange={setMobileOTP}
            maxLength={6}
            className="w-full"
          >
            <InputOTPGroup className="w-full justify-center">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onResendOTP('mobile')}
            className="text-blue-600 hover:text-blue-700"
          >
            Resend Mobile OTP
          </Button>
        </div>

        {/* Email OTP */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            Email OTP ({email})
          </div>
          <InputOTP
            value={emailOTP}
            onChange={setEmailOTP}
            maxLength={6}
            className="w-full"
          >
            <InputOTPGroup className="w-full justify-center">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onResendOTP('email')}
            className="text-blue-600 hover:text-blue-700"
          >
            Resend Email OTP
          </Button>
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        <Button
          onClick={handleVerify}
          disabled={isVerifying || mobileOTP.length !== 6 || emailOTP.length !== 6}
          className="w-full"
        >
          {isVerifying ? 'Verifying...' : 'Verify & Complete'}
        </Button>

        <div className="text-xs text-gray-500 text-center">
          For demo purposes: Mobile OTP is 123456, Email OTP is 654321
        </div>
      </CardContent>
    </Card>
  );
};

export default OTPVerification;

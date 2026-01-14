import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SHA256 from 'crypto-js/sha256';
import '../CSSF/resetpass.css';

export default function PasswordReset() {

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();


  const isPasswordValid = (password) => {
    return password.length >= 8 && !password.includes(' ');
  };

  const handleSendOTP = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/create/user/auth/send/email?email=${email}`);
      const data = await response.json();

      if (data.value) {
        setStep(2);
        setSuccess('OTP sent to your email');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to send OTP. Please check your email.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const SALT = import.meta.env.VITE_PASSWORD_SALT;
  const hashPassword = async (password) => {
    if (window.crypto && window.crypto.subtle) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + SALT);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      } catch (error) {
        console.error("Error using Web Crypto API:", error);
      }
    }

    // Fallback for mobile or unsupported browsers
    return SHA256(password + SALT).toString();
  };


  const handleChangePassword = async () => {
    setError('');

    if (!isPasswordValid(newPassword)) {
      setError('Password must be at least 8 characters and contain no spaces');
      return;
    }

    setIsLoading(true);

    try {
      const verifyResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/create/user/auth/check/create/email?email=${email}&otp=${otp}`);
      const verifyData = await verifyResponse.json();

      if (verifyData.value) {

        const hashedPassword = await hashPassword(newPassword);
        const updateResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/edit/user/password?password=${hashedPassword}&email=${email}`, {
          method: 'PATCH'
        });

        const updateData = await updateResponse.json();

        if (updateData.value) {
          setStep(3);
          setSuccess('Password updated successfully! You can now login with your new password.');
        } else {
          setError('Failed to update password. Please try again.');
        }
      } else {
        setError('Invalid OTP. Please check and try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,6}$/.test(value)) {
      setOtp(value);
    }
  };

  const handleGoBack = () => {
    navigate("/");
    // navigate(`/user/${username}`, { replace: true });
  };

  return (
    <div className="pwd-reset-container">

      <div className="goback">
        <button className="unique-back-button" onClick={handleGoBack}><ArrowLeft size={18} /> <span>Back</span></button>
      </div>

      <div className="pwd-reset-card">
        <h2 className="pwd-reset-title">
          {step === 1 ? 'Reset Password' : step === 2 ? 'Verify OTP' : 'Success'}
        </h2>

        {error && (
          <div className="pwd-reset-error">
            {error}
          </div>
        )}

        {success && (
          <div className="pwd-reset-success">
            {success}
          </div>
        )}

        {step === 1 && (
          <div className="pwd-reset-form">
            <div className="pwd-reset-input-group">
              <label className="pwd-reset-label" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="pwd-reset-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <button
              onClick={handleSendOTP}
              disabled={isLoading || !email}
              className="pwd-reset-button"
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="pwd-reset-verification-form">
            <div className="pwd-reset-input-group">
              <label className="pwd-reset-label" htmlFor="otp">
                6-Digit OTP
              </label>
              <input
                type="text"
                id="otp"
                className="pwd-reset-input"
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                required
              />
              <p className="pwd-reset-helper-text">Enter the 6-digit code sent to {email}</p>
            </div>

            <div className="pwd-reset-input-group">
              <label className="pwd-reset-label" htmlFor="newPassword">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                className="pwd-reset-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
              <p className="pwd-reset-helper-text">
                Minimum 8 characters, no spaces allowed
              </p>
              {newPassword && !isPasswordValid(newPassword) && (
                <p className="pwd-reset-error-text">
                  Password must be at least 8 characters with no spaces
                </p>
              )}
            </div>

            <button
              onClick={handleChangePassword}
              disabled={isLoading || otp.length !== 6 || !isPasswordValid(newPassword)}
              className="pwd-reset-button"
            >
              {isLoading ? 'Verifying...' : 'Change Password'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="pwd-reset-success-container">
            <div className="pwd-reset-success-icon">✓</div>
            <p className="pwd-reset-success-message">
              Your password has been successfully updated. You can now login with your new password.
            </p>
            <button
              onClick={() => navigate('/')}
              className="pwd-reset-login-button"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
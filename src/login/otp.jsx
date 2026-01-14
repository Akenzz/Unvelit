import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import '../CSSF/OtpInput.css';

const OtpInput = () => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const inputRefs = useRef([]);
  const location = useLocation();
  const { username, email, password, check } = location.state || {};
  const [Message, setMessage] = useState("");
  const [sign, setsign] = useState(false);
  const navigate = useNavigate();

  const handleChange = (index, e) => {
    const value = e.target.value;

    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);

    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);

      inputRefs.current[5].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setsign(true);
    const otpString = otp.join('');
    // console.log(otpString);


    const url = check
      ? `${import.meta.env.VITE_API_BASE_URL}/create/user/auth/check/email?username=${username}&otp=${otpString}`
      : `${import.meta.env.VITE_API_BASE_URL}/create/user/auth/check/create/email?email=${email}&otp=${otpString}`;


    if (otpString.length === 6) {


      const res = await fetch(url);
      const exists = await res.json();

      if (exists.value && check) {
        setMessage('OTP Verified');
        localStorage.setItem("username", username);
        navigate(`/user/${username}`, { replace: true });
        return;
      }
      else if (!exists.value && check) {
        setMessage('Invalid OTP');
        return;
      }


      if (exists.value) {

        try {
          const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/create/user/add?username=${username}&email=${email}&password=${password}`;

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          const result = await response.json();

          if (result.value) {
            // setMessage('Sign Up Successful');
            // alert("Account created sucessfully, please Login to Enter");
            // setsign(false)
            // navigate("/");
            localStorage.setItem("username", username);
            navigate(`/user/${username}`, { replace: true });
            // return;
          }

        } catch (error) {
          console.error('Login error:', error);
          setMessage('Error : Sign Up Failed');
        }

      }

      else {
        setMessage("Please Enter correct OTP 🤕")
      }

    }

    else {
      setMessage("Please Enter correct OTP 🤕")
    }

    setsign(false)

  };

  return (
    <div className="otpcent">
      <div className="otp-container">
        <form onSubmit={handleSubmit} className="otp-form">
          <h2>Enter OTP</h2>
          <div className='otpq'>Enter the 6-digit OTP sent to {email}</div>
          <div className="otp-input-wrapper">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                ref={(el) => inputRefs.current[index] = el}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="otp-input"
              />
            ))}
          </div>
          <button type="submit" className="otp-submit-btn"><span>{sign ? <img src="bouncing-circles.svg" alt="" className="sloading" /> : "Verify"}</span></button>

          {Message && <div className='otpmessage'>{Message}</div>}

        </form>
      </div>
    </div>
  );
};

export default OtpInput;
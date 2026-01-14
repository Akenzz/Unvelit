import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from 'react-router-dom'
import SHA256 from 'crypto-js/sha256';

function Signup() {

  const formRef = useRef(null);
  const [isValid, setIsValid] = useState(false);
  const [uValid, setuValid] = useState(false);
  const [eValid, seteValid] = useState(false);
  const [pValid, setpValid] = useState(false);
  const [btn, setbtn] = useState(true);
  const [exe, setexe] = useState(true);
  const [password, setPassword] = useState("");
  const [username, setusername] = useState("");
  const [email, setemail] = useState("");
  const [otps, setotp] = useState("")
  const [errorMessage, setErrorMessage] = useState("");
  const [userMessage, setuserMessage] = useState("");
  const [emailMessage, setemailMessage] = useState("");
  const [sign, setsign] = useState(false);
  const navigate = useNavigate();
  const check = false;

  useEffect(() => {
    setIsValid(eValid && pValid && uValid);
    setbtn(true);
  }, [eValid, pValid, uValid]);

  useEffect(() => {
    setbtn(true);
  }, [username, email, password]);

  useEffect(() => {

    const final = async () => {

      // console.log(uValid)
      // console.log(eValid)
      // console.log(pValid)
      // console.log(isValid)
      // console.log("exe : ", exe)
      // console.log("==========================")

      if (eValid && pValid && uValid) {
        try {

          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/create/user/auth/send/email?email=${email}`);
          const exists = await response.json();

          // const otpstr = exists.otp.toString()

          if (exists.value) {
            // setotp(otpstr);

            const hashedPassword = await hashPassword(password);

            navigate("/OtpInput", {
              state: {
                username,
                email,
                password: hashedPassword,
                check: check,
              }
            });

          }
          else {
            alert("Given Email does not exists")
            setsign(false)
          }

        } catch (error) {
          console.error("Error checking email status:", error);
          setsign(false)
        }

      } else {
        setsign(false)
        setbtn(false)
      }
    }

    final();

  }, [exe]);

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

  const handlePasswordChange = (event) => {
    const input = event.target.value;
    setPassword(input);
    // setsign(true)

    if (input.length < 7) {
      setErrorMessage("Password must be at least 7 characters long.");
      setpValid(false);
    }
    else {
      setErrorMessage("");
      setpValid(true);
    }

  };

  const handleusernameChange = (event) => {
    const input = event.target.value;
    setusername(input);

    // Regex to check if input contains only letters and numbers
    const isValidUsername = /^[a-zA-Z0-9]+$/.test(input);

    if (input.length < 5) {
      setuserMessage("Username must be at least 5 characters long.");
      setuValid(false);
    } else if (!isValidUsername) {
      setuserMessage("Only letters and numbers are allowed.");
      setuValid(false);
    } else {
      setuserMessage("");
    }

    // setsign(false)
  };

  const checkUsernameAvailability = async () => {
    if (username.length < 5) return;
    const isValidUsername = /^[a-zA-Z0-9]+$/.test(username);
    if (!isValidUsername) return;


    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/check/username?user=${username}`);
      const exists = await response.json();

      if (exists.value) {
        setuserMessage("Username already taken.");
        setuValid(false);
      }
      else {
        setuValid(true);
      }
    } catch (error) {
      console.error("Error checking username:", error);
      setuserMessage("Error checking username availability.");
      setuValid(false);
    }

    // setsign(false)
  };

  const emailcheck = (e) => {
    const input = e.target.value;
    setemail(input);
    setemailMessage("");
    // seteValid(true);
  };

  const checkemailAvailability = async () => {

    // setsign(true)

    try {

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/check/emailid?email=${email}`);
      const data = await response.json();

      if (exists.value) {
        setemailMessage("Email already active.");
        seteValid(false);
      }
      else {
        setemailMessage("");
        seteValid(true);
      }

    } catch (error) {
      console.error("Error checking email status:", error);
      setemailMessage("Error checking email status.");
      seteValid(false);
    }

    // setsign(false)
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    setsign(true);
    setbtn(false)

    await checkUsernameAvailability();
    await checkemailAvailability();

    if (exe) {
      setexe(false)
    }
    else { setexe(true) }

  };

  return (

    <div className="lsmain">

      <div className="login-cont">

        <h2>Create Account</h2>

        {/* {Message && <div className="sstatus">{Message}</div> } */}

        {/* <Sociallog />
          <p>Or</p> */}

        <form ref={formRef} action="#" className="login-form" name="submit-to-google-sheet" onSubmit={handleSubmit}>

          <div className="input-cont">
            <img src="user-svgrepo.svg" alt="" className="mail-logo" />
            <input type="username" name="Name" id="username" placeholder="User name" className="mail-input" onChange={handleusernameChange} required />
          </div>
          {userMessage && <div className="serror" style={{ color: "red" }}>{userMessage}</div>}

          <div className="input-cont">
            <img src="mail-open-minus-svgrepo-com.svg" alt="" className="mail-logo" />
            <input type="email" name="E-mail" id="mail" placeholder="Email address" className="mail-input" onChange={emailcheck} required />
          </div>
          {emailMessage && <div className="serror" style={{ color: "red" }}>{emailMessage}</div>}

          <div className="input-cont">
            <img src="lock-alt-svgrepo-com.svg" alt="" className="mail-logo" />
            <input type="password" name="Password" id="pass" placeholder="password" className="mail-input" onChange={handlePasswordChange} required />
          </div>
          {errorMessage && <div className="serror" style={{ color: "red" }}>{errorMessage}</div>}

          <span id="submitaction"> <button type="submit" className={btn ? "logbtn" : "grey"} disabled={!btn}><span>{sign ? <img src="bouncing-circles.svg" alt="" className="sloading" /> : "Create"}</span></button> </span>

          <div className="sinup-link">Already have an account? <Link to="/">Login</Link> </div>

        </form>
      </div>codequantum.in

    </div>
  )
}

export default Signup
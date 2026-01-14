import Sociallog from "../components/sociallog"
import '../CSSF/login.css'
import { useState, useEffect } from "react"
import { Link, useNavigate } from 'react-router-dom'
import SHA256 from 'crypto-js/sha256';

function Login() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [sign, setsign] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const check = true;


  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      navigate(`/user/${storedUser}`, { replace: true });
    }
    else {
      setCheckingAuth(false);
    }
  }, [navigate]);

  if (checkingAuth) return null;

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

  const handleLogin = async (e) => {

    e.preventDefault();
    setsign(true);

    try {
      const hashedPassword = await hashPassword(password);

      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/check/password?user=${username}&password=${hashedPassword}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      // console.log(result);

      if (result.value) {
        // console.log("Login successful");

        localStorage.setItem("username", username);
        navigate(`/user/${username}`, { replace: true });
        return;

        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/create/user/auth/send/email?username=${username}`);
        const exists = await res.json();

        if (exists.value) {
          //   navigate("/OtpInput", {
          //     state: {
          //       username,
          //       email: username,
          //       password: hashedPassword,
          //       check: check
          //     }
          //   }
          // );

        } else {
          setMessage("Given Email does not exists")
          setsign(false)
        }


      } else {
        setMessage('Invalid Credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage(`Error : Login Failed ${error}`);
    }

    setsign(false)
  };

  return (
    <div className="lsmain">

      <div className="login-cont">

        <h2>Login</h2>

        {/* <Sociallog />
          <p>Or</p> */}

        <form action="#" className="login-form" onSubmit={handleLogin}>

          <div className="input-cont">
            <img src="user-svgrepo.svg" alt="" className="mail-logo" />
            <input type="username" name="Name" id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)} placeholder="User name" className="mail-input" required />
          </div>

          <div className="input-cont">
            <img src="lock-alt-svgrepo-com.svg" alt="" className="mail-logo" />
            <input type="password" name="Password" id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="password" className="mail-input" required />
          </div>

          <Link to="/PasswordReset" className="fpass">Forgot password?</Link>

          <span id="submitaction"> <button type="submit" className="logbtn"><span>{sign ? <img src="bouncing-circles.svg" alt="" className="sloading" /> : "Login"}</span></button> </span>

          <div className="sinup-link">Don't have an account? <Link to="/Signup">Create one</Link> </div>

        </form>

        {message && (
          <div className="msg" color="red">
            {message}
          </div>
        )}

      </div>

    </div>

  )
}

export default Login
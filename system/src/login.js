import React, { useState } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  const showNotification = (msg, error = false) => {
    setMessage(msg);
    setIsError(error);
    setTimeout(() => {
      setMessage(null);
      setIsError(false);
    }, 4000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!isLogin && password !== confirmPassword) {
      showNotification("Error: Passwords do not match!", true);
      return;
    }

    if (isLogin) {
      // LOGIN
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        showNotification(`Login Failed: ${error.message}`, true);
      } else {
        showNotification("Login successful!", false);
        setTimeout(() => navigate("/dashboard"), 500);
      }
    } else {
      // SIGN UP
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: username,
            full_name: username,
            display_name: username,
          },
        },
      });

      if (error) {
        showNotification(`Sign Up Failed: ${error.message}`, true);
      } else {
        showNotification("Sign up successful! Please check your email to confirm.", false);
        setTimeout(() => setIsLogin(true), 500);
      }
    }
  };

  const Notification = () => {
    if (!message) return null;
    return (
      <div className={`notification-banner ${isError ? "error" : "success"}`}>
        <p>{message}</p>
        <button onClick={() => setMessage(null)}>&times;</button>
      </div>
    );
  };

  return (
    <div className="login-container">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back to Home
      </button>
      <Notification />
      <h1 className="brand">Authentiscan</h1>
      <div className="card">
        <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
        <p className="subtitle">
          {isLogin
            ? "Login to continue your journey"
            : "Sign up and join the Authentiscan experience"}
        </p>

        <form className="form" onSubmit={handleLogin}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              className="input"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            className="input"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="input"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {!isLogin && (
            <div className="password-field">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                className="input"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span className="eye-icon" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          )}

          <button type="submit" className="btn">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        {isLogin && (
          <p
            className="forgot-password"
            style={{ cursor: "pointer", color: "#6d28d9", marginTop: "10px" }}
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </p>
        )}

        <p className="switch">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;

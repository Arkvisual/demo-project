import React, { useState, useEffect } from "react";
import "./login.css"; 
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  const navigate = useNavigate();

  // Extract token on page load
  useEffect(() => {
    let token = new URLSearchParams(window.location.search).get("access_token");
    if (!token && window.location.hash) {
      const hash = window.location.hash.substring(1);
      token = new URLSearchParams(hash).get("access_token");
    }

    if (!token) {
      setMessage("Invalid or missing token!");
      setIsError(true);
    } else {
      setAccessToken(token);
    }
  }, []);

  const showNotification = (msg, error = false) => {
    setMessage(msg);
    setIsError(error);
    setTimeout(() => {
      setMessage(null);
      setIsError(false);
    }, 4000);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!accessToken) {
      showNotification("Invalid or missing token!", true);
      return;
    }

    if (password !== confirmPassword) {
      showNotification("Passwords do not match!", true);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password }, accessToken);

    if (error) {
      showNotification(`Error: ${error.message}`, true);
    } else {
      showNotification("Password reset successful!", false);
      setTimeout(() => navigate("/login"), 1000);
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
      <Notification />
      <h1 className="brand">Authentiscan</h1>
      <div className="card">
        <h2>Reset Password</h2>
        <p className="subtitle">Enter your new password</p>
        <form className="form" onSubmit={handleResetPassword}>
          <div className="input-group password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              className="input"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <div className="input-group password-field">
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
          <div className="input-group">
            <button type="submit" className="btn" disabled={!accessToken}>
              Reset Password
            </button>
          </div>
        </form>
        <p
          className="switch"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/login")}
        >
          Back to Login
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;

import React, { useState } from "react";
import "./login.css"; // reuse your existing CSS
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const showNotification = (msg, error = false) => {
    setMessage(msg);
    setIsError(error);
    setTimeout(() => {
      setMessage(null);
      setIsError(false);
    }, 4000);
  };

  const handleReset = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });

    if (error) {
      showNotification(`Error: ${error.message}`, true);
    } else {
      showNotification("Check your email to reset your password.", false);
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
        <h2>Forgot Password</h2>
        <p className="subtitle">Enter your email to receive a reset link</p>
        <form className="form" onSubmit={handleReset}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email Address"
              className="input"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <button type="submit" className="btn">
              Send Reset Link
            </button>
          </div>
        </form>
        <p
          className="switch"
          onClick={() => navigate("/login")}
          style={{ cursor: "pointer" }}
        >
          Back to Login
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

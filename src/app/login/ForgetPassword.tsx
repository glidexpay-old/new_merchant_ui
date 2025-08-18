import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { forgetPasswordGenerateOTP, forgetPasswordResendOTP } from "@/app/redux/slices/adminSlice";

const ForgetPassword: React.FC = () => {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.admin);
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const result = await dispatch(forgetPasswordGenerateOTP(email));
    if (forgetPasswordGenerateOTP.fulfilled.match(result)) {
      setOtpSent(true);
      setMessage("OTP sent to your email.");
    } else {
      setMessage(result.payload as string || "Failed to send OTP");
    }
  };

  const handleResendOTP = async () => {
    setMessage("");
    const result = await dispatch(forgetPasswordResendOTP(email));
    if (forgetPasswordResendOTP.fulfilled.match(result)) {
      setMessage("OTP resent to your email.");
    } else {
      setMessage(result.payload as string || "Failed to resend OTP");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Forgot Password</h2>
      <form onSubmit={handleSendOTP} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
          <input
            type="email"
            className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-all duration-200"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Sending..." : "Send OTP"}
        </button>
      </form>
      {otpSent && (
        <div className="space-y-2">
          <button
            type="button"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 rounded-lg transition-all duration-200"
            onClick={handleResendOTP}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Resending..." : "Resend OTP"}
          </button>
        </div>
      )}
      {message && <div className="text-sm text-blue-600">{message}</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  );
};

export default ForgetPassword;

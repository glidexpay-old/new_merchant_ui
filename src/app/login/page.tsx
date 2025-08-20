"use client";

import React, { useState, useEffect } from "react";
import { useAppDispatch } from "@/app/redux/hooks";
import dynamic from "next/dynamic";
const ForgetPassword = dynamic(() => import("./ForgetPassword"), { ssr: false });
import { useRouter } from "next/navigation";
import { BASE_URL } from "@/app/config";
import { startSessionTimer } from "@/app/utils/sessionManager";
import ReCAPTCHA from "react-google-recaptcha-enterprise";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForget, setShowForget] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");

  // On mount, check for remembered credentials
  useEffect(() => {
    const remembered = localStorage.getItem("rememberMeCredentials");
    if (remembered) {
      try {
        const creds = JSON.parse(remembered);
        setEmail(creds.email || "");
        setPassword(creds.password || "");
        setRememberMe(true);
      } catch {}
    }
  }, []);

  const dispatch = useAppDispatch();
  const handleSubmit = async () => {
  // (parameter 'e' removed as it is unused)
    setLoading(true);
    setError("");

    if (!captchaToken) {
      setError("Please verify you are human.");
      setLoading(false);
      return;
    }

    try {
      if (rememberMe) {
        localStorage.setItem(
          "rememberMeCredentials",
          JSON.stringify({ email, password })
        );
      } else {
        localStorage.removeItem("rememberMeCredentials");
      }
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      const payload = {
        ipAddress: "13.233.184.18",
        password: trimmedPassword,
        userAgent: navigator.userAgent,
        userNameOrEmail: trimmedEmail,
        captchaToken: captchaToken,
      };
      const res = await fetch(`${BASE_URL}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (
        data.msg === "PASSWORD_VALIDATION_ERROR" ||
        data.msg?.message === "PASSWORD_VALIDATION_ERROR" ||
        (Array.isArray(data.msg) && data.msg.includes("PASSWORD_VALIDATION_ERROR"))
      ) {
        try {
          const { showToast } = await import("@/app/redux/toastSlice");
          dispatch(showToast({ message: "Password does not meet the required criteria. Please check the password requirements or reset your password.", type: "error" }));
        } catch {
          setError("Password does not meet the required criteria. Please check the password requirements or reset your password.");
        }
        setLoading(false);
        return;
      }
      if (!res.ok || !(data.status == true || data.status == "200")) {
        const errorMsg = data.msg?.message ||
          (Array.isArray(data.msg) ? data.msg[0] : data.msg) ||
          "Login failed";
        try {
          const { showToast } = await import("@/app/redux/toastSlice");
          dispatch(showToast({ message: errorMsg, type: "error" }));
        } catch {
          setError(errorMsg);
        }
        setLoading(false);
        return;
      }
      const token = data.extraData?.LoginData?.jwtToken;
      const sessionExpiryDate = data.extraData?.LoginData?.sessionExpiryDate || data.extraData?.LoginData?.expiry;
      if (token) {
        try {
          localStorage.setItem("userData", JSON.stringify({
            token: data.extraData?.LoginData?.jwtToken,
            uuid: data.extraData?.LoginData?.uuid,
            merchantId: data.extraData?.LoginData?.merchantId,
            sessionExpiryDate: sessionExpiryDate || null,
          }));
          if (sessionExpiryDate) {
            startSessionTimer(sessionExpiryDate);
          }
          const userDataStr = localStorage.getItem("userData");
          let storedToken = null;
          if (userDataStr) {
            try {
              const userData = JSON.parse(userDataStr);
              storedToken = userData.token;
            } catch {
              setError("Failed to parse userData from localStorage");
            }
          }
          if (storedToken === token) {
            try {
              const { showToast } = await import("@/app/redux/toastSlice");
              dispatch(showToast({ message: "Login successful!", type: "success" }));
            } catch {}
            router.push("/");
            setLoading(false);
            return;
          } else {
            try {
              const { showToast } = await import("@/app/redux/toastSlice");
              dispatch(showToast({ message: "Failed to persist authentication token", type: "error" }));
            } catch {
              setError("Failed to persist authentication token");
            }
          }
        } catch (e) {
          let msg = "Failed to save authentication token: Unknown error";
          if (e instanceof Error) {
            msg = `Failed to save authentication token: ${e.message}`;
          }
          try {
            const { showToast } = await import("@/app/redux/toastSlice");
            dispatch(showToast({ message: msg, type: "error" }));
          } catch {
            setError(msg);
          }
        }
      } else {
        try {
          const { showToast } = await import("@/app/redux/toastSlice");
          dispatch(showToast({ message: "Authentication token missing in server response", type: "error" }));
        } catch {
          setError("Authentication token missing in server response");
        }
      }
    } catch (err) {
      let msg = "Network error. Please try again. Unknown error";
      if (err instanceof Error) {
        msg = `Network error. Please try again. Details: ${err.message}`;
      }
      try {
        const { showToast } = await import("@/app/redux/toastSlice");
        dispatch(showToast({ message: msg, type: "error" }));
      } catch {
        setError(msg);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
  <div className="bg-white rounded-xl p-10 w-full max-w-md space-y-8 shadow-sm border border-gray-100">
    <div className="flex justify-center">
      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
        </svg>
      </div>
    </div>

    {showForget ? (
      <>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Reset Your Password</h2>
          <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
            Enter your registered email address and we&apos;ll send you a secure link to reset your password.
          </p>
        </div>
        <ForgetPassword />
        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            onClick={() => setShowForget(false)}
          >
            ← Return to Sign In
          </button>
        </div>
      </>
    ) : (
      <>
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-2">Sign in to access your dashboard</p>
        </div>
        
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-5"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-gray-400 bg-white text-gray-900"
                placeholder="your.email@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-gray-400 bg-white text-gray-900"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <button
              type="button"
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              onClick={() => setShowForget(true)}
            >
              Forgot password?
            </button>
          </div>
          
          <div className="flex justify-center py-2">
            <ReCAPTCHA
              sitekey="6LfmI-4pAAAAAJtMH_PxevWfR9eFkG1G0QQheYkA"
              onChange={(token: string | null) => setCaptchaToken(token || "")}
              theme="light"
            />
          </div>
          
          {error && (
            <div className="flex items-start gap-3 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 flex-shrink-0 mt-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            disabled={loading || !captchaToken}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>
        
        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              New to our platform?
            </span>
          </div>
        </div>
        
       
      </>
    )}

    {/* <div className="mt-8 text-center text-sm text-gray-500">
      <p>
        Need assistance?{" "}
        <a
          href="#"
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Contact Support
        </a>
      </p>
      <p className="mt-3 text-xs text-gray-400">
        © {new Date().getFullYear()} Acme Corporation. All rights reserved.
      </p>
    </div> */}
  </div>
</div>
  );
}

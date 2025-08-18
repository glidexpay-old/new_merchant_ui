"use client";
import React, { useEffect, useRef, useState } from "react";

type ToastProps = {
  message: string;
  show: boolean;
  errorDetails?: string | null;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
};

const Toast: React.FC<ToastProps> = ({
  message,
  show,
  errorDetails,
  type = 'info',
  onClose,
  duration = 3000,
}) => {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(show);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setProgress(100);
      
      // Start progress bar animation
      const startTime = Date.now();
      progressRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);
      }, 50);

      // Set timeout to close toast
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, [show, duration, onClose]);

  if (!isVisible) return null;

  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      );
      case 'error': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      );
      default: return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      );
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-xs">
      <div className={`relative overflow-hidden rounded-lg shadow-lg ${getBgColor()} text-white`}>
        <div className="flex items-start p-4">
          <div className="flex-shrink-0 pt-0.5">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium">{message}</p>
            {errorDetails && (
              <details className="mt-1 text-xs">
                <summary className="cursor-pointer">Details</summary>
                <p className="mt-1 opacity-80">{errorDetails}</p>
              </details>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              onClick={() => {
                setIsVisible(false);
                onClose();
              }}
              className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-white"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <div className="h-1 bg-black bg-opacity-20">
          <div
            className="h-full bg-white bg-opacity-75 transition-all duration-300 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};


export default Toast;



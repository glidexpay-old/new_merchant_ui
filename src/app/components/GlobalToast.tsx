"use client";
import React from "react";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import Toast from "./Toast";
import { hideToast } from "../redux/toastSlice";

const GlobalToast = () => {
  const { message, show, errorDetails, type } = useAppSelector((state: { toast: { message: string; show: boolean; errorDetails?: string | null; type?: 'success' | 'error' | 'info' } }) => state.toast);
  const dispatch = useAppDispatch();

  return (
    <Toast
      message={message}
      show={show}
      errorDetails={errorDetails}
      type={type || (errorDetails ? 'error' : 'success')}
      onClose={() => dispatch(hideToast())}
      duration={3000}
    />
  );
};

export default GlobalToast;

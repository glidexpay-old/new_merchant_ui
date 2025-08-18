"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FormState {
  address1: string;
  address2: string;
  address3: string;
  city: string;
  compantName: string;
  country: string;
  emailId: string;
  kycStatus: string;
  phoneNumber: string;
  pincode: string;
  userName: string;
}

interface Errors {
  userName?: string;
  emailId?: string;
  phoneNumber?: string;
  compantName?: string;
  address1?: string;
  city?: string;
  country?: string;
  pincode?: string;
  kycStatus?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    address1: "",
    address2: "",
    address3: "",
    city: "",
    compantName: "",
    country: "",
    emailId: "",
    kycStatus: "",
    phoneNumber: "",
    pincode: "",
    userName: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const errs: Errors = {};
    if (!form.userName) errs.userName = "User Name is required";
    if (!form.emailId || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.emailId)) errs.emailId = "Valid Email is required";
    if (!form.phoneNumber || !/^\d{10,15}$/.test(form.phoneNumber)) errs.phoneNumber = "Valid Phone Number is required";
    if (!form.compantName) errs.compantName = "Company Name is required";
    if (!form.address1) errs.address1 = "Address1 is required";
    if (!form.city) errs.city = "City is required";
    if (!form.country) errs.country = "Country is required";
    if (!form.pincode || !/^\d{4,10}$/.test(form.pincode)) errs.pincode = "Valid Pincode is required";
    if (!form.kycStatus) errs.kycStatus = "KYC Status is required";
    return errs;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:7079/api/adminCreate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Registration failed");
      router.push("/login");
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        {apiError && <div className="text-red-500">{apiError}</div>}
        <input name="userName" placeholder="User Name" value={form.userName} onChange={handleChange} className="input" />
        {errors.userName && <div className="text-red-500 text-sm">{errors.userName}</div>}
        <input name="emailId" placeholder="Email" value={form.emailId} onChange={handleChange} className="input" />
        {errors.emailId && <div className="text-red-500 text-sm">{errors.emailId}</div>}
        <input name="phoneNumber" placeholder="Phone Number" value={form.phoneNumber} onChange={handleChange} className="input" />
        {errors.phoneNumber && <div className="text-red-500 text-sm">{errors.phoneNumber}</div>}
        <input name="compantName" placeholder="Company Name" value={form.compantName} onChange={handleChange} className="input" />
        {errors.compantName && <div className="text-red-500 text-sm">{errors.compantName}</div>}
        <input name="address1" placeholder="Address 1" value={form.address1} onChange={handleChange} className="input" />
        {errors.address1 && <div className="text-red-500 text-sm">{errors.address1}</div>}
        <input name="address2" placeholder="Address 2" value={form.address2} onChange={handleChange} className="input" />
        <input name="address3" placeholder="Address 3" value={form.address3} onChange={handleChange} className="input" />
        <input name="city" placeholder="City" value={form.city} onChange={handleChange} className="input" />
        {errors.city && <div className="text-red-500 text-sm">{errors.city}</div>}
        <input name="country" placeholder="Country" value={form.country} onChange={handleChange} className="input" />
        {errors.country && <div className="text-red-500 text-sm">{errors.country}</div>}
        <input name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} className="input" />
        {errors.pincode && <div className="text-red-500 text-sm">{errors.pincode}</div>}
        <input name="kycStatus" placeholder="KYC Status" value={form.kycStatus} onChange={handleChange} className="input" />
        {errors.kycStatus && <div className="text-red-500 text-sm">{errors.kycStatus}</div>}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 0.25rem;
        }
      `}</style>
    </div>
  );
}

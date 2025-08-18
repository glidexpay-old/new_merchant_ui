"use client";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchAdminProfile } from "../redux/slices/adminProfileSlice";
// import { logoutAdmin } from "../redux/slices/adminSlice";
//import { useRouter } from "next/navigation";
import getUserData from "../utils/getUserData";
//import { showToast } from "../redux/toastSlice";



import { useState } from "react";

const SIDEBAR_SECTIONS = [
  {
    key: "general",
    label: "General",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 7.292M12 4.354V12m0 0a4 4 0 100 7.292M12 12h7.646" /></svg>
    ),
  },
  {
    key: "change-password",
    label: "Change Password",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 0v4m0 4h.01" /></svg>
    ),
  },
  {
    key: "bank-info",
    label: "Bank Information",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M5 6h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" /></svg>
    ),
  },
  {
    key: "otp-manage",
    label: "OTP Manage",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
  },
];

export default function AdminProfilePage() {
  const dispatch = useAppDispatch();
 // const router = useRouter();
  const { profile, status, error } = useAppSelector((state) => state.adminProfile);
  const [section, setSection] = useState("general");

  useEffect(() => {
    const { uuid } = getUserData();
    if (uuid) {
      dispatch(fetchAdminProfile(uuid));
    }
  }, [dispatch]);

  if (status === "loading") return (
    <div className="flex min-h-[60vh] bg-gray-50">
      <Sidebar section={section} setSection={setSection} />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl p-8 animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 rounded w-full mb-2"></div>
          ))}
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex min-h-[60vh] bg-gray-50">
      <Sidebar section={section} setSection={setSection} />
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl w-full p-8 border border-red-200 bg-red-50 rounded-lg">
          <h2 className="text-xl font-semibold text-red-600">Error Loading Profile</h2>
          <p className="mt-2 text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-800"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="flex min-h-[60vh] bg-gray-50">
      <Sidebar section={section} setSection={setSection} />
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl w-full p-8 border border-gray-200 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800">Profile Not Found</h2>
          <p className="mt-2 text-gray-600">No profile data available for this account.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-800"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[60vh] bg-gray-50">
      <Sidebar section={section} setSection={setSection} />
      <main className="flex-1 flex justify-center items-start py-12">
        <div className="w-full max-w-2xl bg-[#f5f8ff] rounded-xl shadow p-8 mt-2">
          {section === "general" && (
            <>
              <div className="flex gap-4 mb-6">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded transition-colors">
                  Update Profile Details
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded transition-colors">
                  Update AppId and Secret Key
                </button>
              </div>
              <div className="space-y-2">
                <ProfileRow label="Merchant AppId" value={profile.merchantAppId || "-"} />
                <ProfileRow label="Merchant Secret" value={profile.merchantSecret || "-"} />
                <ProfileRow label="Merchant SaltKey" value={profile.merchantSaltKey || "-"} />
                <ProfileRow label="Merchant Email" value={profile.merchantEmail || "-"} />
                <ProfileRow label="Merchant Kyc" value={profile.merchantKyc || "-"} />
                <ProfileRow label="Merchant Name" value={profile.merchantName || "-"} />
                <ProfileRow label="Merchant Phone" value={profile.merchantPhone || "-"} />
              </div>
            </>
          )}
          {section === "change-password" && (
            <SectionPlaceholder title="Change Password" />
          )}
          {section === "bank-info" && (
            <SectionPlaceholder title="Bank Information" />
          )}
          {section === "otp-manage" && (
            <SectionPlaceholder title="OTP Manage" />
          )}
        </div>
      </main>
    </div>
  );
}


function Sidebar({ section, setSection }: { section: string; setSection: (key: string) => void }) {
  return (
    <aside className="w-64 min-h-[60vh] bg-white rounded-xl shadow mr-8 mt-2 flex flex-col p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Account Settings</h2>
      <nav className="flex flex-col gap-2">
        {SIDEBAR_SECTIONS.map((item) => (
          <SidebarItem
            key={item.key}
            active={section === item.key}
            onClick={() => setSection(item.key)}
            icon={item.icon}
          >
            {item.label}
          </SidebarItem>
        ))}
      </nav>
    </aside>
  );
}


function SidebarItem({ children, active, onClick, icon }: { children: React.ReactNode; active?: boolean; onClick?: () => void; icon?: React.ReactNode }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 rounded cursor-pointer text-base font-medium transition-colors select-none ${
        active
          ? "bg-blue-600 text-white"
          : "text-gray-700 hover:bg-blue-50"
      }`}
      onClick={onClick}
    >
      {icon && <span className="inline-flex items-center">{icon}</span>}
      {children}
    </div>
  );
}
function SectionPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className="text-3xl text-gray-400 mb-2">🚧</div>
      <div className="text-lg font-semibold text-gray-700 mb-1">{title}</div>
      <div className="text-gray-500">This section is under construction.</div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="font-semibold text-gray-700 min-w-[170px]">{label} :</span>
      <span className="text-gray-800 break-all">{value}</span>
    </div>
  );
}


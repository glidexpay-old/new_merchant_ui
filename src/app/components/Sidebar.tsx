"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {SettingsIcon } from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false); // State for Transactions dropdown

  // Check screen size and set initial state
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsOpen(false); // Ensure mobile state is off
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };


  // Determine sidebar state based on device and interaction
  const sidebarWidth = isMobile 
    ? (isOpen ? "w-64" : "-translate-x-full")
    : "w-64"; // Always expanded on desktop

  const sidebarTransition = "transition-all duration-300 ease-in-out";

  return (
    <>
      {/* Mobile Hamburger Button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed z-40 top-4 left-4 p-2 rounded-md bg-gray-800 text-white shadow-lg lg:hidden"
          aria-label="Toggle sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Semi-transparent overlay (mobile only) */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:relative z-40 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl border-r border-gray-700 flex flex-col ${sidebarWidth} ${sidebarTransition}`}
      >
        {/* Logo and Collapse Button */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            {/* Always show full logo text since sidebar is always expanded */}
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Merchant
            </h1>
          </Link>
        </div>

        {/* Navigation Menu */}
        <div className="flex flex-col flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav className="flex-1 p-3 space-y-1">
            <NavItem 
              href="/"
              icon={<DashboardIcon />}
              text="Dashboard"
              isCollapsed={false}
              isMobile={isMobile}
              setIsOpen={setIsOpen}
            />

            {/* PG & Merchant Section */}
            <SectionHeader 
              text="PAYMENT GATEWAY" 
              isCollapsed={false}
            />
            
            <NavItem 
              href="/pg/transactions"
              icon={<ChartIcon />}
              text="Transactions"
              isCollapsed={false}
              isMobile={isMobile}
              setIsOpen={setIsOpen}
              onClick={() => setIsTransactionOpen(!isTransactionOpen)} // Toggle dropdown
            />

            {/* {isTransactionOpen && (
              <div className="ml-6 space-y-1">
                <NavItem 
                  href="/pg/transactions" 
                  icon={<ChartIcon />} 
                  text="Transaction" 
                  isCollapsed={isCollapsed && !isMobile} 
                  isMobile={isMobile} 
                  setIsOpen={setIsOpen} 
                />
                <NavItem 
                  href="/pg/customer-wise-Transaction" 
                  icon={<ChartIcon />} 
                  text="Customer Wise Transaction" 
                  isCollapsed={isCollapsed && !isMobile} 
                  isMobile={isMobile} 
                  setIsOpen={setIsOpen} 
                />
                <NavItem 
                  href="/pg/no-seamless-transaction" 
                  icon={<ChartIcon />} 
                  text="Non-Seamless Transaction" 
                  isCollapsed={isCollapsed && !isMobile} 
                  isMobile={isMobile} 
                  setIsOpen={setIsOpen} 
                />
              </div>
            )} */}

            {/* <NavItem
              href="/pg/payment-request"
              icon={<DocumentIcon />}
              text="Payment Request"
              isCollapsed={isCollapsed && !isMobile}
              isMobile={isMobile}
              setIsOpen={setIsOpen}
            /> */}

            <NavItem
              href="/pg/settlements"
              icon={<SettlementIcon />}
              text="Settlements"
              isCollapsed={false}
              isMobile={isMobile}
              setIsOpen={setIsOpen}
            />

            {/* <NavItem
              href="/pg/complaint-request"
              icon={<ComplaintIcon />}
              text="Complaint Request"
              isCollapsed={isCollapsed && !isMobile}
              isMobile={isMobile}
              setIsOpen={setIsOpen}
            /> */}

            {/* <NavItem
              href="/pg/refunds"
              icon={<RefundIcon />}
              text="Refunds"
              isCollapsed={isCollapsed && !isMobile}
              isMobile={isMobile}
              setIsOpen={setIsOpen}
            /> */}

            {/* Payin Section */}
            <SectionHeader 
              text="Payout" 
              isCollapsed={false}
            />
            
            <NavItem 
              href="/payout/payout-management"
              icon={<LinkIcon />}
              text="Payout"
              isCollapsed={false}
              isMobile={isMobile}
              setIsOpen={setIsOpen}
            />
            
            <NavItem 
              href="/payout/payout-transactions"
              icon={<TransactionIcon />}
              text="Payout Transactions"
              isCollapsed={false}
              isMobile={isMobile}
              setIsOpen={setIsOpen}
            />
            
            <NavItem 
              href="/payout/wallet-report"
              icon={<WalletReportIcon />}
              text="Wallet Reports"
              isCollapsed={false}
              isMobile={isMobile}
              setIsOpen={setIsOpen}
            />
            
            <NavItem 
              href="/payout/bulk-payout"
              icon={<DocumentReportIcon />}
              text="Bulk Payout"
              isCollapsed={false}
              isMobile={isMobile}
              setIsOpen={setIsOpen}
            />
          </nav>

          {/* Settings Section - Now properly placed inside the menu */}
          <div className="p-3 border-t border-gray-700">
            <NavItem 
              href="/settings" 
              icon={<SettingsIcon />}
              text="Settings"
              isCollapsed={false}
              isMobile={isMobile}
              setIsOpen={setIsOpen}
            />
          </div>
        </div>
      </aside>
    </>
  );
};

// Reusable Components with Icons
const NavItem = ({ href, icon, text, isCollapsed, isMobile, setIsOpen, onClick }: { 
  href: string; 
  icon: React.ReactNode; 
  text: string;
  isCollapsed: boolean;
  isMobile: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClick?: () => void; // Added optional onClick prop
}) => {
  const handleClick = () => {
    if (isMobile) {
      setIsOpen(false); // Close the sidebar on small/medium screens
    }
    if (onClick) {
      onClick(); // Call the onClick handler if provided
    }
  };

  return (
    <Link 
      href={href} 
      onClick={handleClick}
      className={`flex items-center py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 ${
        isCollapsed ? "justify-center" : ""
      }`}
    >
      <div className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
        {icon}
      </div>
      {!isCollapsed && (
        <span className="ml-3 whitespace-nowrap overflow-hidden text-ellipsis">
          {text}
        </span>
      )}
    </Link>
  );
};

const SectionHeader = ({ text, isCollapsed }: { text: string; isCollapsed: boolean }) => (
  <div className="mt-4">
    {!isCollapsed ? (
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
        {text}
      </p>
    ) : (
      <div className="border-t border-gray-700 my-2 mx-3"></div>
    )}
  </div>
);

// Icons as separate components for better reuse
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
  </svg>
);

const TransactionIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m-3-3l-3 3m6-6a9 9 0 11-6 0" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 010 5.656m-3.656-3.656a4 4 0 010-5.656m6.364 6.364a4 4 0 01-5.656 0m-3.656-3.656a4 4 0 015.656 0" />
  </svg>
);


const WalletReportIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h11M9 21V3m-6 6h18a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2v-8a2-2 0 012-2z" />
  </svg>
);

const DocumentReportIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m-6-8h6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
  </svg>
);

const SettlementIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m-6-8h6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
  </svg>
);

export default Sidebar;
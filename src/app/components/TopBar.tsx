import React, { useState, useEffect, useRef } from "react";
import { useAppDispatch } from "@/app/redux/hooks";
// import { logoutAdmin } from "@/app/redux/slices/adminSlice";
// ...existing code...
import { Moon, Sun } from "lucide-react";

interface TopBarProps {
  toggleSidebar: () => void;
  userName?: string;
  isSidebarOpen: boolean;
  isMobile?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ toggleSidebar, userName = "Admin", isMobile }) => {
  const dispatch = useAppDispatch();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [notificationCount] = useState<number>(3);
  const [theme, setTheme] = useState<string>("light");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Implement actual search functionality here
  };
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menuElement = menuRef.current as HTMLElement | null;
      if (menuElement && menuElement.contains(event.target as Node)) return;
      setShowProfileMenu(false);
    };

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    console.log(`Theme changed to: ${newTheme}`);
  };

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-3 flex justify-between items-center shadow-lg border-b border-gray-700 relative">
      {/* Sidebar collapse/expand button always visible */}
      <div className="flex items-center space-x-4">
        {/* Hamburger for mobile */}
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-700 transition-colors duration-200 focus:outline-none cursor-pointer md:hidden"
            aria-label="Open sidebar"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 hidden md:inline">Admin Portal</span>
      </div>
      {/* Responsive search: show input on md+, icon on mobile */}
      <div className="flex-1 flex justify-center">
        <form onSubmit={handleSearch} className="relative w-full max-w-xs hidden md:block">
          <input
            type="text"
            placeholder="Search..."
            className="w-full py-2 px-4 pl-10 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </form>
        {/* Mobile search icon */}
        <button className="md:hidden p-2 ml-2" aria-label="Search">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
      {/* Right section */}
      <div className="flex items-center space-x-3">
        <div className="hidden md:block text-sm font-medium bg-gray-800 px-3 py-1 rounded-md">
          {currentTime}
        </div>
        
        {/* Notifications */}
        <div className="relative">
          <button 
            className="p-2 rounded-md hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label="Notifications"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>
        </div>
        
        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700 transition-colors duration-200 focus:outline-none cursor-pointer"
            aria-label="User profile"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-sm font-bold">{userName.charAt(0)}</span>
            </div>
            <span className="hidden md:inline-block font-medium">{userName}</span>
          </button>
          
          {showProfileMenu && (
            <div ref={menuRef} className="absolute right-0 mt-2 w-48 bg-gray-800 text-white rounded-md shadow-lg py-1 z-50 border border-gray-700">
              <a href="/profile" className="block px-4 py-2 hover:bg-gray-700 transition-colors duration-150">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  Profile
                </div>
              </a>
              <a href="/settings" className="block px-4 py-2 hover:bg-gray-700 transition-colors duration-150">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  Settings
                </div>
              </a>
              <a href="/help" className="block px-4 py-2 hover:bg-gray-700 transition-colors duration-150">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Help
                </div>
              </a>
              <a href="/faq" className="block px-4 py-2 hover:bg-gray-700 transition-colors duration-150">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  FAQ
                </div>
              </a>
              <div className="border-t border-gray-700 my-1"></div>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors duration-150 text-red-400"
                onClick={async () => {
                  try {
                    const { showToast } = await import("@/app/redux/toastSlice");
                    dispatch(showToast({ message: "Logging out...", type: "success" }));
                    
                    // Use authService for proper logout
                    const { authService } = await import("@/app/utils/sessionManager");
                    authService.logout();
                  } catch (error) {
                    console.error('Logout failed:', error);
                    // Force logout even if there's an error
                    const { authService } = await import("@/app/utils/sessionManager");
                    authService.logout();
                  }
                }}
              >
                <div className="flex items-center cursor-pointer">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  Logout
                </div>
              </button>
            </div>
          )}
        </div>
        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-gray-700 transition-colors duration-200 focus:outline-none"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
           <Moon size={18} />
          ) : (
            <Sun size={18} />
          )}
        </button>
      </div>
    </div>
  );
};

export default TopBar;

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface NavbarMenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'item' | 'divider';
}

export interface NavbarDropdownProps {
  trigger: React.ReactNode;
  items: NavbarMenuItem[];
  placement?: 'bottom-left' | 'bottom-right';
}

export interface NavbarProps {
  title?: string;
  logo?: React.ReactNode;
  logoHref?: string;
  leftItems?: React.ReactNode;
  rightItems?: React.ReactNode;
  userMenu?: {
    user: {
      name: string;
      email?: string;
      avatar?: string;
      role?: string;
    };
    items: NavbarMenuItem[];
  };
  notifications?: {
    count: number;
    items: Array<{
      id: string;
      title: string;
      message: string;
      time: string;
      read: boolean;
      type?: 'info' | 'success' | 'warning' | 'error';
    }>;
    onMarkAsRead?: (id: string) => void;
    onMarkAllAsRead?: () => void;
    onViewAll?: () => void;
  };
  searchable?: boolean;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  className?: string;
  theme?: 'light' | 'dark';
  sticky?: boolean;
  bordered?: boolean;
  height?: number;
}

const NavbarDropdown: React.FC<NavbarDropdownProps> = ({ trigger, items, placement = 'bottom-right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const placementClasses = placement === 'bottom-left' ? 'left-0' : 'right-0';

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="cursor-pointer transition-all duration-200 hover:opacity-80"
      >
        {trigger}
      </div>

      {isOpen && (
        <div 
          className={`
            absolute top-full mt-1 w-56 rounded-lg shadow-xl 
            border border-gray-200 py-1 z-50 ${placementClasses}
            animate-fade-in-up
          `}
          style={{ background: '#fff', color: '#000' }}
        >
          {items.map((item) => {
            if (item.type === 'divider') {
              return <div key={item.key} className="border-t border-gray-100 my-1" />;
            }

            const content = (
              <div
                className={`
                  flex items-center px-4 py-2.5 text-sm transition-colors duration-200
                  ${
                    item.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-black hover:bg-gray-100 cursor-pointer'
                  }
                `}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick?.();
                    setIsOpen(false);
                  }
                }}
              >
                {item.icon && <div className="mr-3 h-4 w-4 flex-shrink-0">{item.icon}</div>}
                <span className="truncate">{item.label}</span>
              </div>
            );

            return item.href && !item.disabled ? (
              <Link 
                key={item.key} 
                href={item.href} 
                onClick={() => setIsOpen(false)}
                className="block"
              >
                {content}
              </Link>
            ) : (
              <div key={item.key}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const NotificationDropdown: React.FC<{ notifications: NonNullable<NavbarProps['notifications']>, theme?: 'light' | 'dark' }> = ({
  notifications,
  theme = 'light'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationTypeColor = (type?: string) => {
    switch (type) {
      case 'success': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50';
      case 'error': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50';
      default: return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative p-2 rounded-full transition-colors duration-200
          ${theme === 'dark' 
            ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }
        `}
        aria-label="Notifications"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 2v20l3-3h8a2 2 0 002-2V4a2 2 0 00-2-2H4z" />
        </svg>
        {notifications.count > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {notifications.count > 99 ? '99+' : notifications.count}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className={`
            absolute right-0 top-full mt-1 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl 
            border border-gray-200 dark:border-gray-700 z-50 animate-fade-in-up
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notifications</h3>
            {notifications.count > 0 && (
              <button
                onClick={() => notifications.onMarkAllAsRead?.()}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.items.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            ) : (
              notifications.items.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors
                    ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}
                  `}
                  onClick={() => {
                    if (!notification.read) {
                      notifications.onMarkAsRead?.(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${getNotificationTypeColor(notification.type)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {notification.time}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.onViewAll && notifications.items.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  notifications.onViewAll?.();
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const Navbar: React.FC<NavbarProps> = ({
  title,
  logo,
  logoHref = '/',
  leftItems,
  rightItems,
  userMenu,
  notifications,
  searchable = false,
  onSearch,
  searchPlaceholder = 'Search...',
  className = '',
  theme = 'light',
  sticky = true,
  bordered = true,
  height = 64,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const themeClasses = theme === 'dark'
    ? 'bg-gray-900 text-white border-gray-800'
    : 'bg-white text-gray-900 border-gray-100';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <>
      {/* Navbar */}
      <nav
        className={`
          ${sticky ? 'sticky top-0' : ''} 
          ${bordered ? 'border-b' : ''} 
          ${themeClasses} 
          z-40 
          ${className}
          shadow-sm
        `}
        style={{ height }}
      >
        <div className="max-w-full px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Left Side - Logo and Hamburger */}
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden mr-2 p-2 rounded-md transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Open menu"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Logo */}
              {logo && (
                <Link href={logoHref} className="flex items-center">
                  {React.cloneElement(
                    logo as React.ReactElement<Record<string, unknown>>,
                    {
                      className: `${(logo as React.ReactElement<Record<string, unknown>>).props.className || ''} h-8 w-auto`
                    }
                  )}
                </Link>
              )}

              {/* Title */}
              {title && !logo && (
                <Link href={logoHref} className="text-xl font-semibold">
                  {title}
                </Link>
              )}

              {/* Left Items - Desktop */}
              {leftItems && <div className="hidden md:flex items-center space-x-2 ml-6">{leftItems}</div>}
            </div>

            {/* Center - Search */}
            {searchable && (
              <div className={`flex-1 max-w-lg mx-4 ${isSearchExpanded ? 'block' : 'hidden md:block'}`}>
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className={`
                      w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent transition-all duration-200
                      ${theme === 'dark' 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                      }
                    `}
                  />
                  <div className="absolute left-3 top-2.5">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </form>
              </div>
            )}

            {/* Right Side */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile Search Toggle */}
              {searchable && (
                <button
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  className={`md:hidden p-2 rounded-full transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                  aria-label="Search"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}

              {/* Right Items - Desktop */}
              {rightItems && <div className="hidden md:flex items-center space-x-2">{rightItems}</div>}

              {/* Notifications */}
              {notifications && (
                <NotificationDropdown notifications={notifications} theme={theme} />
              )}

              {/* User Menu */}
              {userMenu && (
                <NavbarDropdown
                  trigger={
                    <div className={`
                      flex items-center space-x-2 p-1 rounded-full transition-all duration-200
                      ${theme === 'dark' 
                        ? 'hover:bg-gray-700' 
                        : 'hover:bg-gray-100'
                      }
                    `}>
                      {userMenu.user.avatar ? (
                        <Image
                          src={userMenu.user.avatar}
                          alt={userMenu.user.name}
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`
                          h-8 w-8 rounded-full flex items-center justify-center
                          ${theme === 'dark' 
                            ? 'bg-gray-700 text-gray-300' 
                            : 'bg-gray-200 text-gray-600'
                          }
                        `}>
                          {userMenu.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-medium">{userMenu.user.name}</p>
                        {userMenu.user.role && (
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {userMenu.user.role}
                          </p>
                        )}
                      </div>
                      <svg 
                        className={`hidden md:block h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  }
                  items={userMenu.items}
                />
              )}
            </div>
          </div>

          {/* Mobile Search Overlay */}
          {searchable && isSearchExpanded && (
            <div className={`md:hidden border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} p-4`}>
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className={`
                    w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 
                    focus:ring-blue-500 focus:border-transparent
                    ${theme === 'dark' 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }
                  `}
                  autoFocus
                />
                <div className="absolute left-3 top-2.5">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </form>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          className={`fixed inset-0 z-30 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} pt-20 pb-10 px-4 overflow-y-auto`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="flex flex-col space-y-1">
            {/* Left Items - Mobile */}
            {leftItems && React.Children.map(leftItems, (child) => (
              <div 
                className={`
                  px-4 py-3 rounded-lg transition-colors
                  ${theme === 'dark' 
                    ? 'hover:bg-gray-800' 
                    : 'hover:bg-gray-100'
                  }
                `}
              >
                {child}
              </div>
            ))}

            {/* Right Items - Mobile */}
            {rightItems && React.Children.map(rightItems, (child) => (
              <div 
                className={`
                  px-4 py-3 rounded-lg transition-colors
                  ${theme === 'dark' 
                    ? 'hover:bg-gray-800' 
                    : 'hover:bg-gray-100'
                  }
                `}
              >
                {child}
              </div>
            ))}

            {/* User Menu - Mobile */}
            {userMenu && (
              <div className="border-t border-gray-200 dark:border-gray-800 mt-4 pt-4">
                {userMenu.items.map((item) => (
                  <div key={item.key} className="px-4 py-3">
                    {item.href ? (
                      <Link 
                        href={item.href} 
                        className={`
                          flex items-center text-sm
                          ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                        `}
                      >
                        {item.icon && <span className="mr-3">{item.icon}</span>}
                        {item.label}
                      </Link>
                    ) : (
                      <button
                        onClick={item.onClick}
                        className={`
                          flex items-center text-sm w-full
                          ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                        `}
                      >
                        {item.icon && <span className="mr-3">{item.icon}</span>}
                        {item.label}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
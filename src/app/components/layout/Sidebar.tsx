'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface SidebarMenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  children?: SidebarMenuItem[];
  badge?: {
    text: string;
    color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'gray';
  };
  disabled?: boolean;
  divider?: boolean;
}

export interface SidebarProps {
  items: SidebarMenuItem[];
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  logo?: React.ReactNode;
  logoHref?: string;
  footer?: React.ReactNode;
  className?: string;
  width?: number;
  collapsedWidth?: number;
  theme?: 'light' | 'dark';
  userInfo?: {
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
  onUserMenuClick?: () => void;
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl';
}

const getBadgeColor = (color: string) => {
  switch (color) {
    case 'red': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
    case 'blue': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    case 'green': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    case 'yellow': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
    case 'purple': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
  }
};

const SidebarItem: React.FC<{
  item: SidebarMenuItem;
  collapsed: boolean;
  level: number;
  theme: 'light' | 'dark';
}> = ({ item, collapsed, level, theme }) => {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const isActive = item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`));
  const hasChildren = item.children && item.children.length > 0;

  const themeClasses = theme === 'dark' 
    ? {
        text: 'text-gray-300 hover:text-white',
        activeText: 'text-white',
        hover: 'hover:bg-gray-700/80',
        active: 'bg-gray-700 text-white',
        divider: 'border-gray-600',
        icon: 'text-gray-400 group-hover:text-gray-300',
        activeIcon: 'text-white'
      }
    : {
        text: 'text-gray-600 hover:text-gray-900',
        activeText: 'text-blue-600',
        hover: 'hover:bg-gray-100/80',
        active: 'bg-blue-50/80 text-blue-600 border-r-2 border-blue-500',
        divider: 'border-gray-200',
        icon: 'text-gray-500 group-hover:text-gray-700',
        activeIcon: 'text-blue-500'
      };

  const itemContent = (
    <div
      className={`
        group flex items-center px-4 py-2.5 cursor-pointer transition-all duration-200 rounded-lg mx-2
        ${isActive ? themeClasses.active : `${themeClasses.text} ${themeClasses.hover}`}
        ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${level > 0 ? 'pl-12' : ''}
      `}
      style={{ paddingLeft: level > 0 ? `${2.5 + level}rem` : undefined }}
      onClick={() => {
        if (item.disabled) return;
        
        if (hasChildren) {
          setExpanded(!expanded);
        } else if (item.onClick) {
          item.onClick();
        }
      }}
    >
      {/* Icon */}
      {item.icon && (
        <div className={`flex-shrink-0 ${collapsed ? 'mx-auto' : 'mr-3'}`}>
          <div className={`h-5 w-5 ${isActive ? themeClasses.activeIcon : themeClasses.icon}`}>
            {item.icon}
          </div>
        </div>
      )}

      {/* Label and Badge */}
      {!collapsed && (
        <div className="flex items-center justify-between w-full">
          <span className="text-sm font-medium truncate">{item.label}</span>
          
          <div className="flex items-center">
            {/* Badge */}
            {item.badge && (
              <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${getBadgeColor(item.badge.color || 'gray')}`}>
                {item.badge.text}
              </span>
            )}

            {/* Arrow for expandable items */}
            {hasChildren && (
              <div className={`ml-2 transform transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {item.href && !item.disabled ? (
        <Link href={item.href} className="block">
          {itemContent}
        </Link>
      ) : (
        itemContent
      )}

      {/* Submenu */}
      {hasChildren && expanded && !collapsed && (
        <div className="space-y-1 mt-1">
          {item.children!.map((child) => (
            <SidebarItem
              key={child.key}
              item={child}
              collapsed={collapsed}
              level={level + 1}
              theme={theme}
            />
          ))}
        </div>
      )}

      {/* Divider */}
      {item.divider && (
        <div className={`border-t ${themeClasses.divider} my-2 mx-4`} />
      )}
    </>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  collapsed = false,
  onCollapse,
  logo,
  logoHref = '/',
  footer,
  className = '',
  width = 260,
  collapsedWidth = 80,
  theme = 'light',
  breakpoint = 'lg',
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const sidebarWidth = isCollapsed ? collapsedWidth : width;
  
  const themeClasses = theme === 'dark'
    ? 'bg-gray-900 border-gray-700'
    : 'bg-white border-gray-200';

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const breakpointWidths = {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280
      };
      setIsMobile(window.innerWidth < breakpointWidths[breakpoint]);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  useEffect(() => {
    setIsCollapsed(collapsed);
  }, [collapsed]);

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    if (onCollapse) onCollapse(newCollapsed);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={toggleCollapse}
        />
      )}

      <div
        className={`
          fixed left-0 top-0 h-full border-r transition-all duration-300 z-30 flex flex-col
          ${themeClasses}
          ${className}
          ${isMobile ? (isCollapsed ? 'translate-x-0' : '-translate-x-full lg:translate-x-0') : ''}
        `}
        style={{ 
          width: isMobile ? (isCollapsed ? collapsedWidth : width) : sidebarWidth,
          boxShadow: isMobile && !isCollapsed ? '4px 0 15px rgba(0, 0, 0, 0.1)' : 'none'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {/* Logo */}
          {logo && (
            <Link 
              href={logoHref} 
              className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}
            >
              {isCollapsed
                ? React.cloneElement(
                    logo as React.ReactElement<Record<string, unknown>>,
                    {
                      className: `${(logo as React.ReactElement<Record<string, unknown>>).props.className || 'h-8 w-auto'}`
                    }
                  )
                : logo}
            </Link>
          )}

          {/* Collapse/Expand Button */}
          {onCollapse && (
            <button
              onClick={toggleCollapse}
              className={`p-1.5 rounded-md transition-colors ${
                theme === 'dark' 
                  ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-300' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              } ${isCollapsed ? 'mx-auto' : ''}`}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {items.map((item) => (
              <SidebarItem
                key={item.key}
                item={item}
                collapsed={isCollapsed}
                level={0}
                theme={theme}
              />
            ))}
          </nav>
        </div>

        {/* User Info */}
        {/* {userInfo && (
          <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-4`}>
            <div
              className={`flex items-center cursor-pointer transition-colors rounded-lg p-2 ${
                theme === 'dark' ? 'hover:bg-gray-700/80' : 'hover:bg-gray-100/80'
              }`}
              onClick={onUserMenuClick}
            >
              <div className={`flex-shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3'}`}>
                {userInfo.avatar ? (
                  <Image
                    src={userInfo.avatar}
                    alt={userInfo.name}
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {userInfo.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {userInfo.name}
                  </p>
                  {userInfo.email && (
                    <p className={`text-xs truncate ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {userInfo.email}
                    </p>
                  )}
                  {userInfo.role && (
                    <p className={`text-xs truncate ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {userInfo.role}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )} */}

        {/* Footer */}
        {footer && (
          <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-4`}>
            {isCollapsed ? (
              <div className="flex justify-center">
                {React.isValidElement(footer)
                  ? React.cloneElement(footer)
                  : footer}
              </div>
            ) : (
              footer
            )}
          </div>
        )}
      </div>

      {/* Mobile toggle button */}
      {isMobile && isCollapsed && (
        <button
          onClick={toggleCollapse}
          className={`fixed bottom-4 left-4 z-30 p-3 rounded-full shadow-lg transition-colors ${
            theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}
          aria-label="Open menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </>
  );
};
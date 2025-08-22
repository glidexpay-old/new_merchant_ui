'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import { Sidebar } from '@/app/components/layout/Sidebar';
import { Navbar } from '@/app/components/layout/Navbar';
import type { SidebarMenuItem } from '@/app/components/layout/Sidebar';
import type { NavbarMenuItem } from '@/app/components/layout/Navbar';

// Sidebar menu items mapped to existing routes
const sidebarMenuItems: SidebarMenuItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    href: '/'
  },
  {
    key: 'divider1',
    label: '',
    divider: true
  },
  {
    key: 'pg-section',
    label: 'PAYIN ',
    disabled: true
  },
  {
    key: 'transactions',
    label: 'Transactions',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
      </svg>
    ),
    href: '/pg/transactions'
  },
  // {
  //   key: 'settlements',
  //   label: 'Settlements',
  //   icon: (
  //     <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  //     </svg>
  //   ),
  //   href: '/pg/settlements'
  // },
  {
    key: 'divider2',
    label: '',
    divider: true
  },
  {
    key: 'payout-section',
    label: 'PAYOUT',
    disabled: true
  },
  {
    key: 'payout',
    label: 'Payout',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    href: '/payout/payout-management'
  },
  {
    key: 'payout-transactions',
    label: 'Payout Transactions',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    href: '/payout/payout-transactions'
  },
  {
    key: 'wallet-report',
    label: 'Wallet Reports',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    href: '/payout/wallet-report'
  },
  {
    key: 'bulk-payout',
    label: 'Bulk Payout',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-6-8h6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
      </svg>
    ),
    href: '/payout/bulk-payout'
  },
  {
    key: 'divider3',
    label: '',
    divider: true
  },
  // {
  //   key: 'settings',
  //   label: 'Settings',
  //   icon: (
  //     <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
  //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  //     </svg>
  //   ),
  //   href: '/settings'
  // }
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  // ...existing code...
  const dispatch = useAppDispatch();
  
  // Get admin data from redux store
  const { user } = useAppSelector((state) => state.admin);

  // Don't show layout on login page
  if (pathname === '/login' || pathname === '/register') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      // Show logout message
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
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // Implement your search logic here
  };

  // Navbar user menu items
  const userMenuItems: NavbarMenuItem[] = [
    // {
    //   key: 'profile',
    //   label: 'Profile',
    //   icon: (
    //     <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    //     </svg>
    //   ),
    //   href: '/profile'
    // },
    // {
    //   key: 'settings',
    //   label: 'Settings',
    //   icon: (
    //     <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    //     </svg>
    //   ),
    //   href: '/settings'
    // },
    // {
    //   key: 'help',
    //   label: 'Help',
    //   icon: (
    //     <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    //     </svg>
    //   ),
    //   href: '/help'
    // },
    {
      key: 'faq',
      label: 'FAQ',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: '/faq'
    },
    {
      key: 'divider',
      label: '',
      type: 'divider'
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      onClick: handleLogout
    }
  ];

  const getPageTitle = () => {
    switch (pathname) {
      case '/': return 'Dashboard';
      case '/pg/transactions': return 'Transactions';
      case '/pg/settlements': return 'Settlements';
      case '/payout/payout-management': return 'Payout';
      case '/payout/payout-transactions': return 'Payout Transactions';
      case '/payout/wallet-report': return 'Wallet Reports';
      case '/payout/bulk-payout': return 'Bulk Payout';
      case '/settings': return 'Settings';
      case '/profile': return 'Profile';
  default: return 'Merchant';
    }
  };

  // Get user display name from admin data
  const userName = user?.uuid || 'Admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        items={sidebarMenuItems}
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
        logo={
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            {!sidebarCollapsed && <span className="font-semibold text-lg text-blue-600">Merchant</span>}
          </div>
        }
        userInfo={{
          name: userName,
          email: user?.uuid || '',
          role: 'Admin'
        }}
        onUserMenuClick={() => console.log('User menu clicked')}
      />

      {/* Main Content */}
      <div 
        className="transition-all duration-300"
        style={{ 
          marginLeft: sidebarCollapsed ? 80 : 280,
          minHeight: '100vh'
        }}
      >
        {/* Navbar */}
        <Navbar
          title={getPageTitle()}
          searchable
          onSearch={handleSearch}
          searchPlaceholder="Search transactions, settlements..."
          userMenu={{
            user: {
              name: userName,
              email: user?.uuid || '',
              role: 'Admin'
            },
            items: userMenuItems
          }}
          notifications={{
            count: 0,
            items: [],
            onMarkAsRead: (id: string) => console.log('Mark as read:', id),
            onMarkAllAsRead: () => console.log('Mark all as read'),
            onViewAll: () => console.log('View all notifications')
          }}
        />

        {/* Page Content */}
  <main className="flex-1 mt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
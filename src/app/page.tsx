"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { fetchDashboardBalance, fetchDayWiseTransactionDetails } from './redux/slices/dashboardSlice';
import { StatCards, CardIcons } from './components/ui';

export default function Home() {
  const dispatch = useAppDispatch();
  const { balance, dayWiseTransactionDetails, status, error } = useAppSelector((state) => state.dashboard);
  const router = useRouter();

  useEffect(() => {
    dispatch(fetchDashboardBalance());
    dispatch(fetchDayWiseTransactionDetails());
  }, [dispatch]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading dashboard data: {error}</p>
        <button
          onClick={() => {
            dispatch(fetchDashboardBalance());
            dispatch(fetchDayWiseTransactionDetails());
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Prepare main stat cards data
  const mainStatsCards = balance ? [
    {
      title: "Today's Transactions",
      value: `₹${Math.floor(Number(balance.todaysTransactions || 0)).toLocaleString()}`,
      subtitle: "+12% from yesterday",
      icon: <CardIcons.Money />,
      iconBgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      onClick: () => router.push("/pg/transactions")
    },
    // {
    //   title: "Last Settlement",
    //   value: `₹${balance.lastSettlements?.toLocaleString() || '0'}`,
    //   subtitle: "From last cycle",
    //   icon: <CardIcons.CheckCircle />,
    //   iconBgColor: "bg-green-50",
    //   iconColor: "text-green-600",
    //   onClick: () => router.push("/pg/settlements")
    // },
    {
      title: "Total Payin Amount",
      value: `₹${Math.floor(Number(balance.unsettledAmount || 0)).toLocaleString()}`,
      subtitle: "Pending Amount",
      icon: <CardIcons.Clock />,
      iconBgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      onClick: () => router.push("/pg/settlements")
    }
  ] : [];

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Payment Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time transaction insights and analytics</p>
        </div>
        <button
          onClick={() => {
            dispatch(fetchDashboardBalance());
            dispatch(fetchDayWiseTransactionDetails());
          }}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md w-full sm:w-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Refresh Data
        </button>
      </div>

      {/* Main Stats Cards */}
      {mainStatsCards.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Overview</h2>
          <StatCards cards={mainStatsCards} gridCols={3} />
        </div>
      )}

      {/* Transaction Status Cards */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          {/* <div>
            <h2 className="text-lg font-semibold text-gray-800">Transaction Status Overview</h2>
            <p className="text-sm text-gray-500">Detailed breakdown of transaction statuses</p>
          </div> */}
          {dayWiseTransactionDetails?.lastSuccessTransctionTime && (
            <div className="mt-2 md:mt-0">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Last Success:</span> {dayWiseTransactionDetails.lastSuccessTransctionTime}
              </p>
            </div>
          )}
        </div>
        {/* <StatCards cards={statusCards} gridCols={3} /> */}
        
        {dayWiseTransactionDetails?.name && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Merchant:</span> {dayWiseTransactionDetails.name}
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {/* <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <StatCards 
          cards={[
            {
              title: "View Transactions",
              value: "All Records",
              subtitle: "Complete transaction history",
              icon: <CardIcons.CreditCard />,
              iconBgColor: "bg-purple-50",
              iconColor: "text-purple-600",
              onClick: () => router.push("/pg/transactions"),
              isClickable: true
            },
            {
              title: "Settlement Reports",
              value: "Generate",
              subtitle: "Download detailed reports",
              icon: <CardIcons.Bank />,
              iconBgColor: "bg-indigo-50",
              iconColor: "text-indigo-600",
              onClick: () => router.push("/pg/settlements"),
              isClickable: true
            },
            {
              title: "Payout Management",
              value: "Manage",
              subtitle: "Handle payout operations",
              icon: <CardIcons.Wallet />,
              iconBgColor: "bg-cyan-50",
              iconColor: "text-cyan-600",
              onClick: () => router.push("/payout/payout-management"),
              isClickable: true
            }
          ]}
          gridCols={3}
        />
      </div> */}
    </div>
  );
}
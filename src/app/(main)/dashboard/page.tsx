"use client";

import React from 'react'
import { CasesTable } from '@/components/dashboard/cases/cases-table'
import { CreateCaseDialog } from '@/components/dashboard/cases/create-case-dialog'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/store'
import { fetchCases } from '@/store/thunk/casesthunk'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'

export default function DashboardPage() {
  // Protect this route - redirect to /signin if not authenticated
  useProtectedRoute();

  const dispatch = useDispatch<AppDispatch>();

  const handleCaseCreated = () => {
    // Refresh cases list after creating a new case
    dispatch(fetchCases());
  };

  return (
    <div className="flex flex-col space-y-6 md:space-y-8 p-4 md:p-8">
      {/* Cases Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Cases</h2>
            <p className="text-sm text-muted-foreground">
              View and manage your legal cases
            </p>
          </div>
          <CreateCaseDialog onCaseCreated={handleCaseCreated} />
        </div>

        {/* Cases Table */}
        <div className="rounded-lg border bg-card md:border">
          <CasesTable />
        </div>
      </div>
    </div>
  )
}

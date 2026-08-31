"use client";

import * as React from "react";
import { AuthProvider } from "@/context/auth-context";
import { ExpenseProvider } from "@/context/expense-context";
import { Navbar } from "@/components/navbar";
import { BalanceHeroCard } from "@/components/dashboard/balance-hero-card";
import { RecurringBillsCard } from "@/components/dashboard/recurring-bills-card";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { ExpenseList } from "@/components/dashboard/expense-list";
import { AddExpenseModal } from "@/components/modals/add-expense-modal";
import { SettleUpModal } from "@/components/modals/settle-up-modal";
import { RecurringBillsManagerModal } from "@/components/modals/recurring-bills-manager-modal";
import { QuickLogBillDialog } from "@/components/modals/quick-log-bill-dialog";
import { AdminSettingsModal } from "@/components/modals/admin-settings-modal";
import { ClaimAdminDialog } from "@/components/modals/claim-admin-dialog";
import { MobileBottomBar } from "@/components/mobile-bottom-bar";
import { NotificationToast } from "@/components/notifications/notification-toast";
import { RecurringBill } from "@/types";

import { motion } from "motion/react";
import { pageContainerVariants, sectionRevealVariants } from "@/lib/animations";

function DashboardContent() {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = React.useState(false);
  const [isSettleUpOpen, setIsSettleUpOpen] = React.useState(false);
  const [isRecurringManagerOpen, setIsRecurringManagerOpen] =
    React.useState(false);
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = React.useState(false);
  const [isClaimAdminOpen, setIsClaimAdminOpen] = React.useState(false);
  const [quickLogBill, setQuickLogBill] = React.useState<RecurringBill | null>(
    null
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30">
      {/* Sticky Top Navigation */}
      <Navbar
        onOpenAdminSettings={() => setIsAdminSettingsOpen(true)}
        onOpenClaimAdmin={() => setIsClaimAdminOpen(true)}
      />

      {/* Main Workspace Container with choreographed stagger */}
      <motion.main
        initial="hidden"
        animate="show"
        variants={pageContainerVariants}
        className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 pb-[max(6rem,calc(5.5rem+env(safe-area-inset-bottom)))] sm:pb-8"
      >
        {/* Hero Balance Card */}
        <motion.section variants={sectionRevealVariants}>
          <BalanceHeroCard
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            onOpenSettleUp={() => setIsSettleUpOpen(true)}
          />
        </motion.section>

        {/* Recurring Bills & Due-Date Reminders Card */}
        <motion.section variants={sectionRevealVariants}>
          <RecurringBillsCard
            onOpenManager={() => setIsRecurringManagerOpen(true)}
            onOpenQuickLog={(bill) => setQuickLogBill(bill)}
          />
        </motion.section>

        {/* 2-Column Responsive Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* Left Column: Category Spending Distribution */}
          <motion.div
            variants={sectionRevealVariants}
            className="lg:col-span-4 order-2 lg:order-1"
          >
            <CategoryBreakdown />
          </motion.div>

          {/* Right Column: Full Expense History Ledger */}
          <motion.div
            variants={sectionRevealVariants}
            className="lg:col-span-8 order-1 lg:order-2"
          >
            <ExpenseList />
          </motion.div>
        </div>
      </motion.main>

      {/* Mobile Floating Bottom Action Bar */}
      <MobileBottomBar
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
        onOpenSettleUp={() => setIsSettleUpOpen(true)}
      />

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
      />
      <SettleUpModal
        isOpen={isSettleUpOpen}
        onClose={() => setIsSettleUpOpen(false)}
      />
      <RecurringBillsManagerModal
        isOpen={isRecurringManagerOpen}
        onClose={() => setIsRecurringManagerOpen(false)}
        onQuickLogBill={(bill) => setQuickLogBill(bill)}
      />
      <QuickLogBillDialog
        isOpen={!!quickLogBill}
        onClose={() => setQuickLogBill(null)}
        bill={quickLogBill}
      />
      <AdminSettingsModal
        isOpen={isAdminSettingsOpen}
        onClose={() => setIsAdminSettingsOpen(false)}
      />
      <ClaimAdminDialog
        isOpen={isClaimAdminOpen}
        onClose={() => setIsClaimAdminOpen(false)}
        onSuccess={() => setIsAdminSettingsOpen(true)}
      />

      {/* Floating In-App Realtime Notification Toast */}
      <NotificationToast />
    </div>
  );
}

export default function Home() {
  return (
    <ExpenseProvider>
      <DashboardContent />
    </ExpenseProvider>
  );
}

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/context/auth-context";
import { useExpenses } from "@/context/expense-context";
import { CurrencyAmount } from "@/components/ui/currency-amount";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles,
  ChevronDown,
  LogIn,
  LogOut,
  Share2,
  Check,
  ShieldCheck,
  Key,
  Download,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import { navVariants, navItemVariants } from "@/lib/animations";
import { NotificationPopover } from "@/components/notifications/notification-popover";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/context/language-context";

import { UserAvatar } from "@/components/ui/user-avatar";
import { HouseMintLogo } from "@/components/ui/house-mint-logo";

interface NavbarProps {
  onOpenAdminSettings?: () => void;
  onOpenClaimAdmin?: () => void;
}

export function Navbar({
  onOpenAdminSettings,
  onOpenClaimAdmin,
}: NavbarProps = {}) {
  const { signOut } = useAuth();
  const { t, isBangla } = useLanguage();
  const {
    users,
    currentUser,
    setCurrentUser,
    isAdmin,
    householdSettings,
    ledger,
    isLoaded,
    isCloudConnected,
    isSyncing,
    pendingOfflineCount,
  } = useExpenses();

  const [isOpenMenu, setIsOpenMenu] = React.useState(false);
  const [copiedInvite, setCopiedInvite] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpenMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.header
      initial="hidden"
      animate="show"
      variants={navVariants}
      className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md transition-all"
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <motion.div variants={navItemVariants} className="flex items-center gap-2 sm:gap-3 shrink-0">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="size-8 sm:size-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-xs shrink-0 cursor-default"
          >
            <HouseMintLogo size={20} className="size-4.5 sm:size-5" />
          </motion.div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-extrabold text-base sm:text-lg tracking-tight bg-linear-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent shrink-0 select-none">
              HouseMint
            </span>
            <Badge
              variant="outline"
              className="hidden min-[420px]:inline-flex items-center text-[10px] font-semibold px-2 py-0.5 border-primary/30 text-primary/90 rounded-full whitespace-nowrap shrink-0"
            >
              {users.length} {isBangla ? t.nav.roommateCount : (users.length === 1 ? t.common.roommate : t.common.roommates)}
            </Badge>
          </div>
        </motion.div>

        {/* Right side controls */}
        <motion.div variants={navItemVariants} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Admin Hub Direct Button */}
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAdminSettings}
              className="inline-flex items-center justify-center gap-1.5 w-8 sm:w-auto h-8 sm:h-9 px-0 sm:px-3 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 text-xs font-semibold rounded-full cursor-pointer shrink-0 transition-colors"
              title={t.admin.modalTitle}
            >
              <ShieldCheck className="size-3.5 sm:size-4 text-primary shrink-0" />
              <span className="hidden sm:inline">{t.common.admin}</span>
            </Button>
          )}

          {/* Household Total Pill (Desktop/Tablet) */}
          <div className="hidden md:flex items-center gap-2 px-3.5 h-9 rounded-full bg-card border border-border text-xs transition-colors hover:border-border/80 shrink-0">
            <span className="text-muted-foreground">{t.dashboard.monthlyTotal}:</span>
            {!isLoaded ? (
              <Skeleton className="h-4 w-16 rounded-full" />
            ) : (
              <CurrencyAmount
                amount={ledger.total_household_spent}
                size="sm"
                className="text-foreground font-semibold"
              />
            )}
          </div>

          {/* Language Switcher */}
          <LanguageToggle />

          {/* Theme Mode Toggle (Dark / Light) */}
          <ThemeToggle />

          {/* In-App Notifications Bell & Popover */}
          <NotificationPopover />

          {/* Roommate Switcher Dropdown or Sign In */}
          {!isLoaded ? (
            <Skeleton className="h-8 sm:h-9 w-20 sm:w-28 rounded-full" />
          ) : users.length === 0 ? (
            <a
              href="/login"
              className="flex items-center gap-1.5 px-3.5 h-8 sm:h-9 bg-primary text-primary-foreground rounded-full text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
            >
              <LogIn className="size-3.5" />
              <span>Join / Register</span>
            </a>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsOpenMenu((prev) => !prev)}
                className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-1.5 pr-2 sm:pr-2.5 bg-card border border-border rounded-full text-xs font-semibold hover:bg-accent hover:border-border/90 active:bg-accent/80 transition-colors duration-200 cursor-pointer select-none shadow-xs h-8 sm:h-9 shrink-0"
                aria-label="Roommate Switcher Menu"
              >
                <UserAvatar user={currentUser} size="xs" />
                <span className="text-foreground hidden md:inline truncate max-w-20">
                  {currentUser?.name || "Roommate"}
                </span>
                {currentUser?.role === "admin" && (
                  <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[9px] font-semibold border border-primary/30">
                    <ShieldCheck className="size-2.5" />
                    <span>Admin</span>
                  </span>
                )}
                <ChevronDown
                  className={`size-3 text-muted-foreground transition-transform duration-200 ease-out shrink-0 ${
                    isOpenMenu ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {/* Mobile Backdrop */}
              <AnimatePresence>
                {isOpenMenu && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsOpenMenu(false)}
                    className="sm:hidden fixed inset-0 bg-background/60 backdrop-blur-xs z-40"
                  />
                )}
              </AnimatePresence>

              {/* Dropdown Menu with Smooth Slide & Fade */}
              <AnimatePresence>
                {isOpenMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="fixed inset-x-3 top-17 sm:top-auto sm:inset-x-auto sm:absolute sm:right-0 sm:mt-2 w-auto sm:w-60 max-w-sm max-h-[calc(100dvh-5.5rem)] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl py-1.5 z-50"
                  >
                    <div className="px-3 py-2 border-b border-border bg-muted/40">
                      <div className="flex items-center justify-between gap-1">
                        <div className="text-xs font-bold text-foreground truncate">
                          {currentUser?.name || "Roommate"}
                        </div>
                        {currentUser?.role === "admin" ? (
                          <Badge className="bg-primary/15 text-primary border-primary/30 text-[9px] px-1.5 py-0 font-semibold">
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 text-muted-foreground">
                            Member
                          </Badge>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {currentUser?.email || "Local account"}
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[9px] font-semibold text-primary">
                        <span className="truncate max-w-30">{householdSettings.householdName}</span>
                        <span className="font-mono bg-primary/10 px-1 py-0.2 rounded border border-primary/20 shrink-0">
                          {householdSettings.inviteCode}
                        </span>
                      </div>
                    </div>

                    {/* Admin Hub Shortcut or Claim Admin */}
                    <div className="p-1 border-b border-border/40">
                      {isAdmin ? (
                        <button
                          onClick={() => {
                            setIsOpenMenu(false);
                            onOpenAdminSettings?.();
                          }}
                          className="w-full px-2.5 py-1.5 text-xs flex items-center gap-2 font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors cursor-pointer text-left"
                        >
                          <ShieldCheck className="size-3.5 shrink-0" />
                          <span>{t.admin.modalTitle}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setIsOpenMenu(false);
                            onOpenClaimAdmin?.();
                          }}
                          className="w-full px-2.5 py-1.5 text-xs flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors cursor-pointer text-left"
                        >
                          <Key className="size-3.5 text-primary shrink-0" />
                          <span>{t.nav.claimAdmin}</span>
                        </button>
                      )}
                    </div>

                    <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                      {isBangla ? "রুমমেট পরিবর্তন" : "Switch Roommate"}
                    </div>

                    <div className="space-y-0.5 px-1 max-h-48 overflow-y-auto custom-scrollbar">
                      {users.map((user) => {
                        const isSelected = currentUser?.id === user.id;
                        return (
                          <button
                            key={user.id}
                            onClick={() => {
                              setCurrentUser(user);
                              setIsOpenMenu(false);
                            }}
                            className={`w-full px-2.5 py-1.5 text-xs flex items-center justify-between rounded-lg transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-primary/10 text-primary font-bold"
                                : "text-foreground font-medium hover:bg-accent"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <UserAvatar user={user} size="xs" />
                              <span className="truncate">{user.name}</span>
                              {user.role === "admin" && (
                                <span className="text-[9px] text-primary font-normal">
                                  ({t.common.admin})
                                </span>
                              )}
                            </div>
                            {isSelected && (
                              <span className="text-primary text-[11px] shrink-0 font-bold">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="border-t border-border/50 pt-1 mt-1 space-y-0.5">
                      <button
                        onClick={() => {
                          const inviteUrl = `${window.location.origin}/login?code=${householdSettings.inviteCode}`;
                          navigator.clipboard.writeText(inviteUrl);
                          setCopiedInvite(true);
                          setTimeout(() => setCopiedInvite(false), 2500);
                        }}
                        className="w-full px-3 py-1.5 text-xs flex items-center justify-between text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2">
                          <Share2 className="size-3.5 text-primary shrink-0" />
                          <span>
                            {copiedInvite ? t.common.copied : t.common.shareInvite}
                          </span>
                        </div>
                        {copiedInvite && <Check className="size-3 text-positive shrink-0" />}
                      </button>

                      <button
                        onClick={() => {
                          setIsOpenMenu(false);
                          window.dispatchEvent(new CustomEvent("open-pwa-install"));
                        }}
                        className="w-full px-3 py-1.5 text-xs flex items-center gap-2 text-primary hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer text-left font-medium"
                      >
                        <Download className="size-3.5 shrink-0" />
                        <span>{isBangla ? "HouseMint অ্যাপ ইনস্টল করুন" : "Install HouseMint App"}</span>
                      </button>

                      {(!currentUser || !currentUser.email) && (
                        <a
                          href="/login"
                          className="w-full px-3 py-1.5 text-xs flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          <LogIn className="size-3.5 shrink-0" />
                          <span>{isBangla ? "লগইন / রেজিস্টার" : "Sign In / Register"}</span>
                        </a>
                      )}
                      <button
                        onClick={async () => {
                          setIsOpenMenu(false);
                          await signOut();
                          window.location.href = "/login";
                        }}
                        className="w-full px-3 py-1.5 text-xs flex items-center gap-2 text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="size-3.5 shrink-0" />
                        <span>{t.nav.signOut}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Slim Sub-Header Offline / Sync Banner */}
      <AnimatePresence>
        {(!isCloudConnected || isSyncing) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-warning/20 bg-warning/10 text-warning text-[11px] sm:text-xs font-medium select-none"
          >
            <div className="max-w-6xl mx-auto px-3 sm:px-6 py-1 flex items-center justify-center gap-2 text-center">
              {isSyncing ? (
                <>
                  <RefreshCw className="size-3 animate-spin text-primary shrink-0" />
                  <span className="text-primary font-semibold">
                    {isBangla ? "ক্লাউডের সাথে তথ্য সিঙ্ক হচ্ছে..." : "Syncing offline changes with cloud..."}
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="size-3 text-warning shrink-0" />
                  <span className="truncate">
                    {isBangla ? (
                      pendingOfflineCount > 0
                        ? `আপনি অফলাইনে আছেন। ${pendingOfflineCount}টি পরিবর্তন লোকাল ক্যাশে সংরক্ষিত হয়েছে, অনলাইন হলে স্বয়ংক্রিয়ভাবে সিঙ্ক হবে।`
                        : "আপনি বর্তমানে অফলাইনে আছেন। ক্যাশ থেকে ডাটা দেখানো হচ্ছে।"
                    ) : (
                      pendingOfflineCount > 0
                        ? `You are currently offline. ${pendingOfflineCount} change${pendingOfflineCount === 1 ? "" : "s"} saved locally and will auto-sync when back online.`
                        : "You are currently offline. Viewing cached data."
                    )}
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

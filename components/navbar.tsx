"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
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
} from "lucide-react";
import { navVariants, navItemVariants } from "@/lib/animations";
import { NotificationPopover } from "@/components/notifications/notification-popover";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavbarProps {
  onOpenAdminSettings?: () => void;
  onOpenClaimAdmin?: () => void;
}

export function Navbar({
  onOpenAdminSettings,
  onOpenClaimAdmin,
}: NavbarProps = {}) {
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
        <motion.div variants={navItemVariants} className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="size-8 sm:size-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-xs shrink-0 cursor-default"
          >
            <Sparkles className="size-4 sm:size-5" />
          </motion.div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent truncate">
                HouseMint
              </span>
              <Badge
                variant="outline"
                className="text-[9px] sm:text-[10px] px-1.5 py-0 border-primary/30 text-primary/90"
              >
                {users.length} Roommates
              </Badge>
            </div>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground hidden sm:block truncate">
              {householdSettings.householdName || "Equal Split Household Tracker"}
            </p>
          </div>
        </motion.div>

        {/* Right side controls */}
        <motion.div variants={navItemVariants} className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Admin Hub Direct Button (Desktop) */}
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAdminSettings}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 h-8 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 text-xs font-semibold rounded-xl cursor-pointer"
            >
              <ShieldCheck className="size-3.5 text-primary" />
              <span>Admin Hub</span>
            </Button>
          )}

          {/* Cloud Sync Status Pill */}
          {isCloudConnected ? (
            <Badge
              variant="outline"
              className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold border-positive/30 bg-positive/10 text-positive"
              title="Connected to Supabase Realtime WebSockets"
            >
              <span className="size-1.5 rounded-full bg-positive animate-pulse" />
              <span>{isSyncing ? "Syncing..." : "Cloud Live"}</span>
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium border-border/80 bg-background/50 text-muted-foreground"
              title="Running locally with offline cache"
            >
              <span className="size-1.5 rounded-full bg-muted-foreground/60" />
              <span>Offline Mode</span>
            </Badge>
          )}

          {/* Household Total Pill (Desktop/Tablet) */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border text-xs transition-colors hover:border-border/80 min-h-[34px]">
            <span className="text-muted-foreground">Household Spent:</span>
            {!isLoaded ? (
              <Skeleton className="h-4 w-16" />
            ) : (
              <CurrencyAmount
                amount={ledger.total_household_spent}
                size="sm"
                className="text-foreground font-semibold"
              />
            )}
          </div>

          {/* Theme Mode Toggle (Dark / Light) */}
          <ThemeToggle />

          {/* In-App Notifications Bell & Popover */}
          <NotificationPopover />

          {/* Roommate Switcher Dropdown or Sign In */}
          {!isLoaded ? (
            <Skeleton className="h-8 w-28 sm:w-36 rounded-xl" />
          ) : users.length === 0 ? (
            <a
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
            >
              <LogIn className="size-3.5" />
              <span>Join / Register</span>
            </a>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsOpenMenu((prev) => !prev)}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-card border border-border rounded-xl text-xs font-semibold hover:bg-accent hover:border-border/90 active:bg-accent/80 transition-colors duration-200 cursor-pointer select-none shadow-xs"
              >
                <div className="size-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[11px] font-bold">
                  {currentUser?.name ? currentUser.name[0] : "U"}
                </div>
                <span className="text-foreground hidden xs:inline">
                  {currentUser?.name || "Roommate"}
                </span>
                {currentUser?.role === "admin" && (
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] px-1 py-0 font-semibold flex items-center gap-0.5">
                    <ShieldCheck className="size-2.5" />
                    <span>Admin</span>
                  </Badge>
                )}
                <span className="text-[10px] text-muted-foreground hidden sm:inline">
                  (Viewing)
                </span>
                <ChevronDown
                  className={`size-3 text-muted-foreground transition-transform duration-200 ease-out ${
                    isOpenMenu ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {/* Dropdown Menu with Smooth Slide & Fade */}
              <AnimatePresence>
                {isOpenMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-2 w-52 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-xl py-1.5 z-50 overflow-hidden"
                  >
                    <div className="px-3 py-2 border-b border-border/50 bg-background/50">
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
                        <span className="truncate max-w-[100px]">{householdSettings.householdName}</span>
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
                          className="w-full px-2.5 py-1.5 text-xs flex items-center gap-2 font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors cursor-pointer text-left"
                        >
                          <ShieldCheck className="size-3.5" />
                          <span>Apartment Admin Hub</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setIsOpenMenu(false);
                            onOpenClaimAdmin?.();
                          }}
                          className="w-full px-2.5 py-1.5 text-xs flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors cursor-pointer text-left"
                        >
                          <Key className="size-3.5 text-primary" />
                          <span>Claim Admin Rights</span>
                        </button>
                      )}
                    </div>

                    <div className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                      Switch Roommate
                    </div>

                    {users.map((user) => {
                      const isSelected = currentUser?.id === user.id;
                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            setCurrentUser(user);
                            setIsOpenMenu(false);
                          }}
                          className={`w-full px-3 py-1.5 text-xs flex items-center justify-between text-left hover:bg-accent transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-primary/10 text-primary font-bold"
                              : "text-foreground font-medium"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`size-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-accent text-foreground"
                              }`}
                            >
                              {user.name[0]}
                            </div>
                            <span className="truncate">{user.name}</span>
                            {user.role === "admin" && (
                              <span className="text-[9px] text-primary font-normal">
                                (Admin)
                              </span>
                            )}
                          </div>
                          {isSelected && (
                            <span className="text-primary text-[11px] shrink-0">✓</span>
                          )}
                        </button>
                      );
                    })}

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
                          <Share2 className="size-3.5 text-primary" />
                          <span>
                            {copiedInvite ? "Copied Invite Link!" : "Copy Roommate Link"}
                          </span>
                        </div>
                        {copiedInvite && <Check className="size-3 text-positive" />}
                      </button>

                      <a
                        href="/login"
                        className="w-full px-3 py-1.5 text-xs flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <LogIn className="size-3.5" />
                        <span>Sign In / Register</span>
                      </a>
                      <button
                        onClick={async () => {
                          setIsOpenMenu(false);
                          localStorage.removeItem("housemint_auth_user_id_v1");
                          window.location.href = "/login";
                        }}
                        className="w-full px-3 py-1.5 text-xs flex items-center gap-2 text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="size-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          </motion.div>
        </div>
      </motion.header>
    );
}

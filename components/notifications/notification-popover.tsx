"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useExpenses } from "@/context/expense-context";
import { UserAvatar } from "@/components/ui/user-avatar";
import { CurrencyAmount } from "@/components/ui/currency-amount";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  CheckCheck,
  Plus,
  Pencil,
  Trash2,
  HandCoins,
  Calendar,
  ShieldCheck,
  BellOff,
  Sparkles,
  X,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AppNotification, NotificationActionType } from "@/types";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";

export function NotificationPopover() {
  const {
    notifications,
    unreadNotificationCount,
    users,
    currentUser,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    isLoaded,
    isCloudConnected,
  } = useExpenses();

  const [isOpen, setIsOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<"all" | "unread">("all");
  const [sessionUnreadIds, setSessionUnreadIds] = React.useState<string[]>([]);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Auto-mark notifications as read for the specific user when opening the modal/popover
  React.useEffect(() => {
    if (isOpen && currentUser?.id) {
      const unreadIds = notifications
        .filter((n) => !n.read_by || !n.read_by.includes(currentUser.id))
        .map((n) => n.id);

      if (unreadIds.length > 0) {
        setSessionUnreadIds(unreadIds);
        markAllNotificationsAsRead();
      }
    } else if (!isOpen) {
      setSessionUnreadIds([]);
    }
  }, [isOpen, currentUser?.id, markAllNotificationsAsRead]);

  // Close popover on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadDisplayCount = React.useMemo(() => {
    return Math.max(unreadNotificationCount, sessionUnreadIds.length);
  }, [unreadNotificationCount, sessionUnreadIds.length]);

  const filteredNotifications = React.useMemo(() => {
    if (filter === "unread") {
      return notifications.filter(
        (n) =>
          (!n.read_by || !n.read_by.includes(currentUser.id)) ||
          sessionUnreadIds.includes(n.id)
      );
    }
    return notifications;
  }, [notifications, filter, currentUser.id, sessionUnreadIds]);

  function getActionBadge(actionType: NotificationActionType) {
    switch (actionType) {
      case "expense_created":
        return (
          <span className="size-4 rounded-full bg-positive/20 border border-positive/40 text-positive flex items-center justify-center">
            <Plus className="size-2.5 stroke-[3]" />
          </span>
        );
      case "expense_updated":
        return (
          <span className="size-4 rounded-full bg-warning/20 border border-warning/40 text-warning flex items-center justify-center">
            <Pencil className="size-2.5 stroke-[2.5]" />
          </span>
        );
      case "expense_deleted":
        return (
          <span className="size-4 rounded-full bg-destructive/20 border border-destructive/40 text-destructive flex items-center justify-center">
            <Trash2 className="size-2.5 stroke-[2.5]" />
          </span>
        );
      case "settlement_created":
        return (
          <span className="size-4 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
            <HandCoins className="size-2.5 stroke-[2.5]" />
          </span>
        );
      case "recurring_bill_created":
      case "recurring_bill_logged":
      case "recurring_bill_deleted":
        return (
          <span className="size-4 rounded-full bg-primary/20 border border-primary/40 text-primary flex items-center justify-center">
            <Calendar className="size-2.5 stroke-[2.5]" />
          </span>
        );
      case "admin_claimed":
        return (
          <span className="size-4 rounded-full bg-primary/20 border border-primary/40 text-primary flex items-center justify-center">
            <ShieldCheck className="size-2.5 stroke-[2.5]" />
          </span>
        );
      default:
        return (
          <span className="size-4 rounded-full bg-muted border border-border text-muted-foreground flex items-center justify-center">
            <Sparkles className="size-2.5" />
          </span>
        );
    }
  }

  function formatRelativeTime(dateString: string) {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "recently";
    }
  }

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Bell Icon Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Notifications (${unreadNotificationCount} unread)`}
        aria-expanded={isOpen}
        className="relative size-8 sm:size-9 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent hover:border-border/90 active:bg-accent/80 transition-colors duration-200 cursor-pointer select-none shadow-xs flex items-center justify-center shrink-0"
      >
        <Bell className="size-4 sm:size-4.5 transition-transform duration-200" />

        {/* Dynamic Unread Counter Badge */}
        {unreadNotificationCount > 0 && !isOpen && (
          <motion.span
            key={unreadNotificationCount}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-extrabold font-numeral tabular-nums flex items-center justify-center shadow-md ring-2 ring-background z-20 pointer-events-none"
          >
            {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
          </motion.span>
        )}

        {/* Pulse effect for unread activity */}
        {unreadNotificationCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 size-3 rounded-full bg-primary animate-ping opacity-60 pointer-events-none z-10" />
        )}
      </motion.button>

      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="sm:hidden fixed inset-0 bg-background/70 backdrop-blur-xs z-40"
          />
        )}
      </AnimatePresence>

      {/* Popover Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-3 top-[70px] sm:top-auto sm:inset-x-auto sm:absolute sm:right-0 sm:mt-2.5 w-auto sm:w-96 max-w-md mx-auto sm:mx-0 max-h-[calc(100dvh-5.5rem)] sm:max-h-[520px] flex flex-col bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-3 sm:p-3.5 border-b border-border bg-card flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="size-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                  <Bell className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-foreground truncate">
                      Activity & Alerts
                    </h3>
                    {unreadDisplayCount > 0 && (
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1.5 py-0 border-primary/30 text-primary bg-primary/10 font-semibold shrink-0"
                      >
                        {unreadDisplayCount} new
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">
                    Household updates & roommate actions
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {unreadDisplayCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      markAllNotificationsAsRead();
                      setSessionUnreadIds([]);
                    }}
                    className="h-7 px-2 text-[11px] font-medium text-primary hover:text-primary hover:bg-primary/10 gap-1 cursor-pointer"
                  >
                    <CheckCheck className="size-3" />
                    <span className="hidden xs:inline">Mark all read</span>
                  </Button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="sm:hidden p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                  aria-label="Close notifications"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="px-3 py-1.5 border-b border-border flex items-center justify-between text-xs bg-muted/40">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    filter === "all"
                      ? "bg-accent text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter("unread")}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    filter === "unread"
                      ? "bg-accent text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Unread ({unreadDisplayCount})
                </button>
              </div>

              {notifications.length > 0 && (
                <button
                  onClick={() => setIsClearConfirmOpen(true)}
                  title="Clear all notifications"
                  className="text-[10px] text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 cursor-pointer px-1 py-0.5"
                >
                  <Trash2 className="size-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Notification Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-border/30">
              {!isLoaded ? (
                <div className="p-3 space-y-2.5">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-card/60 border border-border/40"
                    >
                      <Skeleton className="size-8 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-3.5 w-24" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                        <Skeleton className="h-3 w-40" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                  <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <BellOff className="size-5" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    {filter === "unread"
                      ? "No unread notifications"
                      : "No activity yet"}
                  </p>
                  <p className="text-[11px] text-muted-foreground max-w-[220px]">
                    {filter === "unread"
                      ? "You are all caught up! When roommates add expenses or settle debts, you'll see them here."
                      : "When anyone adds, edits, or settles expenses in your household, it will appear here in real time."}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => {
                  const isUnread =
                    (!notification.read_by ||
                      !notification.read_by.includes(currentUser.id)) ||
                    sessionUnreadIds.includes(notification.id);
                  const actorUser = users.find(
                    (u) => u.id === notification.actor_id
                  ) || {
                    id: notification.actor_id,
                    name: notification.actor_name,
                  };

                  return (
                    <motion.div
                      key={notification.id}
                      onClick={() => {
                        markNotificationAsRead(notification.id);
                        setSessionUnreadIds((prev) =>
                          prev.filter((id) => id !== notification.id)
                        );
                      }}
                      className={`p-3 transition-colors duration-150 cursor-pointer relative flex items-start gap-2.5 ${
                        isUnread
                          ? "bg-primary/5 hover:bg-primary/10"
                          : "hover:bg-accent/60"
                      }`}
                    >
                      {/* Avatar with mini action badge overlay */}
                      <div className="relative shrink-0 mt-0.5">
                        <UserAvatar user={actorUser} size="sm" showRing={false} />
                        <div className="absolute -bottom-1 -right-1 shadow-xs">
                          {getActionBadge(notification.action_type)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[11px] font-semibold text-foreground truncate">
                            {notification.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0 font-numeral">
                            {formatRelativeTime(notification.created_at)}
                          </span>
                        </div>

                        <p className="text-xs text-foreground/90 text-wrap pretty leading-snug">
                          {notification.description}
                        </p>

                        {/* Optional amount chip */}
                        {notification.amount != null && (
                          <div className="pt-0.5 flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground">
                              Amount:
                            </span>
                            <CurrencyAmount
                              amount={notification.amount}
                              size="xs"
                              className="font-semibold text-foreground"
                            />
                          </div>
                        )}
                      </div>

                      {/* Unread Indicator Dot */}
                      {isUnread && (
                        <div className="shrink-0 self-center">
                          <span
                            className="size-2 rounded-full bg-primary block ring-2 ring-primary/30"
                            title="Unread"
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-border/50 bg-background/60 flex items-center justify-between text-[10px] text-muted-foreground px-3 shrink-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={`size-1.5 rounded-full ${
                    isCloudConnected
                      ? "bg-positive animate-pulse"
                      : "bg-muted-foreground/60"
                  }`}
                />
                <span>
                  {isCloudConnected
                    ? "Live sync via WebSockets"
                    : "Offline cache mode"}
                </span>
              </div>
              <span>HouseMint Notifications</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear All Notifications Alert Dialog */}
      <AlertDialog open={isClearConfirmOpen} onOpenChange={setIsClearConfirmOpen}>
        <AlertDialogContent className="w-[95vw] sm:max-w-md bg-card border-border rounded-2xl p-5 sm:p-6 shadow-2xl">
          <AlertDialogHeader className="text-left space-y-2">
            <div className="size-10 rounded-full bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive mb-1">
              <AlertTriangle className="size-5" />
            </div>
            <AlertDialogTitle className="text-lg font-bold text-foreground">
              Clear All Notifications?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground space-y-1">
              <span>Are you sure you want to clear all {notifications.length} notification(s)? This will remove your notification activity history.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-3 gap-2 flex-col-reverse sm:flex-row">
            <AlertDialogCancel className="h-10 rounded-xl border-border hover:bg-accent cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearAllNotifications();
                toast.success("Notifications cleared");
                setIsClearConfirmOpen(false);
              }}
              className="h-10 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold cursor-pointer shadow-md shadow-destructive/20"
            >
              Yes, Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

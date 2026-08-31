"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { User } from "@/types";
import {
  validateHouseholdInviteCode,
  fetchHouseholdData,
  APARTMENT_ADMIN_KEY,
} from "@/lib/supabase/db";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sparkles,
  LogIn,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Home,
  AlertCircle,
  Mail,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Premium physics & easing curves modeled after high-end fintech platforms
 */
const premiumEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const pageContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const headerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const headerItemVariants: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: premiumEase,
    },
  },
};

const cardContainerVariants: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.98, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.55,
      ease: premiumEase,
    },
  },
};

const formFieldsContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.02,
    },
  },
};

const formFieldItemVariants: Variants = {
  hidden: { opacity: 0, y: 8, filter: "blur(2px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.32,
      ease: premiumEase,
    },
  },
};

const roommateGridVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.08,
    },
  },
};

const roommateChipVariants: Variants = {
  hidden: { opacity: 0, scale: 0.93, y: 8 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 26,
    },
  },
};

const footerVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: premiumEase,
    },
  },
};

export default function LoginPage() {
  const router = useRouter();
  const {
    signInWithEmail,
    signUpWithEmail,
    sendPasswordResetEmail,
    updateUserPassword,
    quickSignIn,
  } = useAuth();

  const [activeTab, setActiveTab] = React.useState<
    "signin" | "register" | "forgot" | "reset"
  >("signin");

  // Sign In state
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [signInError, setSignInError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Register state
  const [regName, setRegName] = React.useState("");
  const [regEmail, setRegEmail] = React.useState("");
  const [regPassword, setRegPassword] = React.useState("");
  const [regHouseholdCode, setRegHouseholdCode] = React.useState("");
  const [isRoommateCheck, setIsRoommateCheck] = React.useState(true);
  const [regError, setRegError] = React.useState<string | null>(null);

  // Email verification notice state
  const [verificationSentEmail, setVerificationSentEmail] = React.useState<
    string | null
  >(null);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = React.useState("");
  const [forgotSuccess, setForgotSuccess] = React.useState(false);
  const [forgotError, setForgotError] = React.useState<string | null>(null);

  // Reset password state
  const [newPassword, setNewPassword] = React.useState("");
  const [resetSuccess, setResetSuccess] = React.useState(false);
  const [resetError, setResetError] = React.useState<string | null>(null);

  // Dynamic real roommates from database
  const [householdUsers, setHouseholdUsers] = React.useState<User[]>([]);

  React.useEffect(() => {
    fetchHouseholdData().then((data) => {
      if (data?.users) {
        setHouseholdUsers(data.users);
      }
    });
  }, []);

  const [isInviteMode, setIsInviteMode] = React.useState(false);

  // Check URL query parameters for invite link or password reset
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const codeParam = params.get("code") || params.get("invite");
      const modeParam = params.get("mode");

      if (codeParam) {
        setRegHouseholdCode(codeParam.toUpperCase());
        setActiveTab("register");
        setIsInviteMode(true);
      }

      if (modeParam === "reset") {
        setActiveTab("reset");
      }
    }
  }, []);

  // Measure content container for dynamic animated height morphing between tabs
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [formHeight, setFormHeight] = React.useState<number | "auto">("auto");

  React.useEffect(() => {
    if (!contentRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry?.borderBoxSize?.[0]?.blockSize) {
        setFormHeight(entry.borderBoxSize[0].blockSize);
      } else if (entry?.contentRect?.height) {
        setFormHeight(entry.contentRect.height);
      }
    });
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);

  const handleTabChange = (tab: "signin" | "register" | "forgot" | "reset") => {
    if (tab === activeTab) return;
    setSignInError(null);
    setRegError(null);
    setForgotError(null);
    setForgotSuccess(false);
    setResetError(null);
    setResetSuccess(false);
    setVerificationSentEmail(null);
    setActiveTab(tab);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);
    setIsSubmitting(true);

    const res = await signInWithEmail(email.trim(), password);
    setIsSubmitting(false);

    if (res.error) {
      setSignInError(res.error);
    } else {
      window.location.href = "/";
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setIsSubmitting(true);

    // Strict Invitation Gating: Block any registration without a valid apartment code
    const validation = await validateHouseholdInviteCode(regHouseholdCode);
    if (!validation) {
      setIsSubmitting(false);
      setRegError(
        "Access Denied: Invalid Apartment Code. HouseMint is private to invited roommates.",
      );
      return;
    }

    const res = await signUpWithEmail(
      regEmail.trim(),
      regPassword,
      regName.trim(),
      validation.householdId,
      validation.isAdminKey ? "admin" : "member",
      validation.isAdminKey ? isRoommateCheck : true,
    );
    setIsSubmitting(false);

    if (res.error) {
      setRegError(res.error);
    } else if (res.needsEmailVerification) {
      setVerificationSentEmail(regEmail.trim());
    } else {
      window.location.href = "/";
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(false);
    setIsSubmitting(true);

    const res = await sendPasswordResetEmail(forgotEmail.trim());
    setIsSubmitting(false);

    if (res.error) {
      setForgotError(res.error);
    } else {
      setForgotSuccess(true);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(false);
    setIsSubmitting(true);

    const res = await updateUserPassword(newPassword);
    setIsSubmitting(false);

    if (res.error) {
      setResetError(res.error);
    } else {
      setResetSuccess(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    }
  };

  const handleQuickLogin = (userId: string) => {
    quickSignIn(userId);
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Background ambient gradient glow with entrance transition */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: premiumEase }}
        className="absolute -top-32 -left-32 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: premiumEase, delay: 0.15 }}
        className="absolute -bottom-32 -right-32 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none"
      />

      <motion.div
        initial="hidden"
        animate="show"
        variants={pageContainerVariants}
        className="w-full max-w-md space-y-6 relative z-10"
      >
        {/* Brand Header with Staggered Elements */}
        <motion.div
          variants={headerContainerVariants}
          className="text-center space-y-2"
        >
          <motion.div
            variants={headerItemVariants}
            className="inline-flex size-12 rounded-2xl bg-primary/15 border border-primary/30 items-center justify-center text-primary shadow-xs mb-1"
          >
            <Sparkles className="size-6" />
          </motion.div>
          <motion.h1
            variants={headerItemVariants}
            className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent"
          >
            HouseMint
          </motion.h1>
          <motion.p
            variants={headerItemVariants}
            className="text-xs sm:text-sm text-muted-foreground"
          >
            Equal Split Roommate Expense Tracker & Utility Manager
          </motion.p>
        </motion.div>

        {/* Main Card with Spring Height Morphing & Segmented Slider */}
        <motion.div
          variants={cardContainerVariants}
          className="border border-border/80 bg-card/90 backdrop-blur-md shadow-xl rounded-xl overflow-hidden"
        >
          <CardHeader className="p-5 pb-3">
            {isInviteMode && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: premiumEase }}
                className="mb-4 p-3.5 rounded-2xl bg-primary/10 border border-primary/30 flex items-center gap-3"
              >
                <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Home className="size-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span>You&apos;re Invited to Flat 4B! 🏠</span>
                    <Badge
                      variant="outline"
                      className="text-[10px] border-primary/40 text-primary"
                    >
                      MINT-4B
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Create your roommate account below to join the shared
                    apartment ledger.
                  </div>
                </div>
              </motion.div>
            )}

            {/* Custom High-Fidelity Animated Segmented Control */}
            <div className="relative p-1 rounded-xl bg-background border border-border grid grid-cols-2 shadow-xs">
              <button
                type="button"
                onClick={() => handleTabChange("signin")}
                className={cn(
                  "relative z-10 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  activeTab === "signin"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LogIn className="size-3.5" />
                <span>Sign In</span>
                {activeTab === "signin" && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-card border border-border/80 rounded-lg shadow-xs -z-10"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("register")}
                className={cn(
                  "relative z-10 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  activeTab === "register"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <UserPlus className="size-3.5" />
                <span>Join Apartment</span>
                {activeTab === "register" && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-card border border-border/80 rounded-lg shadow-xs -z-10"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
              </button>
            </div>

            {/* Animated Form Morphing Container with Spring Height Transition */}
            <motion.div
              animate={{ height: formHeight }}
              transition={{
                height: {
                  type: "spring",
                  stiffness: 260,
                  damping: 26,
                  mass: 0.9,
                },
              }}
              className="overflow-hidden relative -mx-2"
            >
              <div ref={contentRef} className="pt-4 pb-2 px-2">
                <AnimatePresence mode="popLayout" initial={false}>
                  {verificationSentEmail ? (
                    <motion.div
                      key="verification-notice"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="w-full space-y-4 text-center py-2"
                    >
                      <div className="size-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary mx-auto shadow-xs">
                        <Mail className="size-6 animate-pulse" />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-base font-bold text-foreground">
                          Check Your Inbox!
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed px-2">
                          We sent an account confirmation link to{" "}
                          <span className="font-semibold text-foreground font-mono">
                            {verificationSentEmail}
                          </span>
                          . Click the link in your email to activate your
                          account, then sign in below.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/40 border border-border text-[11px] text-muted-foreground text-left space-y-1">
                        <p className="font-semibold text-foreground">
                          Didn&apos;t receive the email?
                        </p>
                        <p>
                          • Check your <strong>Spam / Junk</strong> folder.
                        </p>
                        <p>
                          • If you made a spelling mistake, click below to try
                          again with the correct email.
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          setVerificationSentEmail(null);
                          handleTabChange("signin");
                        }}
                        className="w-full bg-primary text-primary-foreground font-semibold text-xs h-9 cursor-pointer gap-2"
                      >
                        <span>Proceed to Sign In</span>
                        <ArrowRight className="size-3.5" />
                      </Button>
                    </motion.div>
                  ) : activeTab === "forgot" ? (
                    <motion.div
                      key="forgot"
                      initial={{ opacity: 0, x: -16, filter: "blur(4px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, x: -16, filter: "blur(4px)" }}
                      transition={{ duration: 0.22, ease: premiumEase }}
                      className="w-full space-y-4"
                    >
                      <div className="flex items-center gap-2 pb-1 border-b border-border/60">
                        <button
                          type="button"
                          onClick={() => handleTabChange("signin")}
                          className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title="Back to Sign In"
                        >
                          <ArrowLeft className="size-4" />
                        </button>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">
                            Reset Password
                          </h3>
                          <p className="text-[11px] text-muted-foreground">
                            We will send a recovery link to your email.
                          </p>
                        </div>
                      </div>

                      {forgotError && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -6 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-center gap-2"
                        >
                          <AlertCircle className="size-4 shrink-0" />
                          <span>{forgotError}</span>
                        </motion.div>
                      )}

                      {forgotSuccess ? (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-xl bg-positive/15 border border-positive/30 text-xs space-y-2 text-center"
                        >
                          <CheckCircle2 className="size-6 text-positive mx-auto" />
                          <h4 className="font-bold text-foreground">
                            Reset Link Sent!
                          </h4>
                          <p className="text-muted-foreground text-[11px]">
                            If an account exists for{" "}
                            <span className="font-semibold text-foreground font-mono">
                              {forgotEmail}
                            </span>
                            , you will receive password reset instructions
                            shortly.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleTabChange("signin")}
                            className="text-xs mt-2"
                          >
                            Back to Sign In
                          </Button>
                        </motion.div>
                      ) : (
                        <form
                          onSubmit={handleForgotPassword}
                          className="space-y-3"
                        >
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground">
                              Your Account Email
                            </label>
                            <Input
                              type="email"
                              required
                              autoFocus
                              value={forgotEmail}
                              onChange={(e) => setForgotEmail(e.target.value)}
                              placeholder="alex@example.com"
                              className="bg-background border-border text-sm"
                            />
                          </div>
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-primary text-primary-foreground font-semibold cursor-pointer gap-2 mt-2"
                          >
                            <span>Send Reset Link</span>
                            <ArrowRight className="size-4" />
                          </Button>
                        </form>
                      )}
                    </motion.div>
                  ) : activeTab === "reset" ? (
                    <motion.div
                      key="reset"
                      initial={{ opacity: 0, x: 16, filter: "blur(4px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, x: 16, filter: "blur(4px)" }}
                      transition={{ duration: 0.22, ease: premiumEase }}
                      className="w-full space-y-4"
                    >
                      <div className="flex items-center gap-2 pb-1 border-b border-border/60">
                        <KeyRound className="size-4 text-primary" />
                        <div>
                          <h3 className="text-sm font-bold text-foreground">
                            Set New Password
                          </h3>
                          <p className="text-[11px] text-muted-foreground">
                            Choose a secure new password for your account.
                          </p>
                        </div>
                      </div>

                      {resetError && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -6 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-center gap-2"
                        >
                          <AlertCircle className="size-4 shrink-0" />
                          <span>{resetError}</span>
                        </motion.div>
                      )}

                      {resetSuccess ? (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-xl bg-positive/15 border border-positive/30 text-xs space-y-2 text-center"
                        >
                          <CheckCircle2 className="size-6 text-positive mx-auto" />
                          <h4 className="font-bold text-foreground">
                            Password Updated!
                          </h4>
                          <p className="text-muted-foreground text-[11px]">
                            Your password has been changed successfully.
                            Redirecting to dashboard...
                          </p>
                        </motion.div>
                      ) : (
                        <form
                          onSubmit={handleUpdatePassword}
                          className="space-y-3"
                        >
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground">
                              New Password
                            </label>
                            <Input
                              type="password"
                              required
                              autoFocus
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Minimum 6 characters"
                              className="bg-background border-border text-sm"
                            />
                          </div>
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-primary text-primary-foreground font-semibold cursor-pointer gap-2 mt-2"
                          >
                            <span>Update Password & Sign In</span>
                            <ArrowRight className="size-4" />
                          </Button>
                        </form>
                      )}
                    </motion.div>
                  ) : activeTab === "signin" ? (
                    <motion.div
                      key="signin"
                      initial={{ opacity: 0, x: -16, filter: "blur(4px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, x: -16, filter: "blur(4px)" }}
                      transition={{ duration: 0.22, ease: premiumEase }}
                      className="w-full space-y-4"
                    >
                      {signInError && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -6 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -6 }}
                          className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-center gap-2"
                        >
                          <AlertCircle className="size-4 shrink-0" />
                          <span>{signInError}</span>
                        </motion.div>
                      )}

                      <motion.form
                        onSubmit={handleSignIn}
                        variants={formFieldsContainerVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-3"
                      >
                        <motion.div
                          variants={formFieldItemVariants}
                          className="space-y-1"
                        >
                          <label className="text-xs font-semibold text-muted-foreground">
                            Email Address
                          </label>
                          <Input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="alex@example.com"
                            className="bg-background border-border text-sm"
                          />
                        </motion.div>

                        <motion.div
                          variants={formFieldItemVariants}
                          className="space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-muted-foreground">
                              Password
                            </label>
                            <button
                              type="button"
                              onClick={() => handleTabChange("forgot")}
                              className="text-[11px] text-primary hover:underline cursor-pointer font-medium"
                            >
                              Forgot Password?
                            </button>
                          </div>
                          <Input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="bg-background border-border text-sm"
                          />
                        </motion.div>

                        <motion.div variants={formFieldItemVariants}>
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-primary text-primary-foreground font-semibold cursor-pointer gap-2 mt-2"
                          >
                            <span>Sign In</span>
                            <ArrowRight className="size-4" />
                          </Button>
                        </motion.div>
                      </motion.form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="register"
                      initial={{ opacity: 0, x: 16, filter: "blur(4px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, x: 16, filter: "blur(4px)" }}
                      transition={{ duration: 0.22, ease: premiumEase }}
                      className="w-full space-y-4"
                    >
                      {regError && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -6 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -6 }}
                          className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-center gap-2"
                        >
                          <AlertCircle className="size-4 shrink-0" />
                          <span>{regError}</span>
                        </motion.div>
                      )}

                      <motion.form
                        onSubmit={handleSignUp}
                        variants={formFieldsContainerVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-3"
                      >
                        <motion.div
                          variants={formFieldItemVariants}
                          className="space-y-1"
                        >
                          <label className="text-xs font-semibold text-muted-foreground">
                            Your Name
                          </label>
                          <Input
                            required
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            placeholder="e.g. Alex"
                            className="bg-background border-border text-sm"
                          />
                        </motion.div>

                        <motion.div
                          variants={formFieldItemVariants}
                          className="space-y-1"
                        >
                          <label className="text-xs font-semibold text-muted-foreground">
                            Email Address
                          </label>
                          <Input
                            type="email"
                            required
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="alex@example.com"
                            className="bg-background border-border text-sm"
                          />
                        </motion.div>

                        <motion.div
                          variants={formFieldItemVariants}
                          className="space-y-1"
                        >
                          <label className="text-xs font-semibold text-muted-foreground">
                            Create Password
                          </label>
                          <Input
                            type="password"
                            required
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Minimum 6 characters"
                            className="bg-background border-border text-sm"
                          />
                        </motion.div>

                        <motion.div
                          variants={formFieldItemVariants}
                          className="space-y-1.5"
                        >
                          <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                            <span>Apartment Invite Code</span>
                            <span className="text-[11px] text-muted-foreground font-normal">
                              Provided by roommate or admin
                            </span>
                          </label>
                          <Input
                            required
                            value={regHouseholdCode}
                            onChange={(e) =>
                              setRegHouseholdCode(e.target.value.toUpperCase())
                            }
                            placeholder="Enter invitation or admin key"
                            className="bg-background border-border text-sm uppercase placeholder:normal-case tracking-wider font-mono"
                          />

                          {regHouseholdCode.trim().toUpperCase() ===
                            APARTMENT_ADMIN_KEY && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-3 rounded-xl bg-primary/10 border border-primary/30 text-xs space-y-2"
                            >
                              <div className="flex items-center gap-1.5 font-semibold text-primary">
                                <ShieldCheck className="size-4 text-primary" />
                                <span>👑 Admin Master Key Recognized</span>
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                You are registering as the Household
                                Administrator with full apartment configuration
                                access.
                              </p>
                              <label className="flex items-start gap-2 pt-1 cursor-pointer select-none text-[11px] text-foreground">
                                <input
                                  type="checkbox"
                                  checked={isRoommateCheck}
                                  onChange={(e) =>
                                    setIsRoommateCheck(e.target.checked)
                                  }
                                  className="mt-0.5 rounded border-border text-primary focus:ring-primary/40"
                                />
                                <span>
                                  I also live here as an active roommate
                                  (participates in grocery splits and balances)
                                </span>
                              </label>
                            </motion.div>
                          )}
                        </motion.div>

                        <motion.div variants={formFieldItemVariants}>
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-primary text-primary-foreground font-semibold cursor-pointer gap-2 mt-2"
                          >
                            <span>Join & Create Account</span>
                            <ArrowRight className="size-4" />
                          </Button>
                        </motion.div>
                      </motion.form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </CardHeader>

          {/* QUICK 1-CLICK DEMO LOGIN FOR SEEDED ROOMMATES */}
          <CardContent className="p-5 pt-3 border-t border-border/60 bg-background/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-primary" />
                <span>1-Click Roommate Access</span>
              </span>
              <span className="text-[10px] text-muted-foreground">Flat 4B</span>
            </div>

            {householdUsers.length > 0 ? (
              <motion.div
                variants={roommateGridVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 gap-2"
              >
                {householdUsers.map((user) => (
                  <motion.button
                    key={user.id}
                    variants={roommateChipVariants}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => handleQuickLogin(user.id)}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/50 transition-colors text-left cursor-pointer group shadow-xs"
                  >
                    <UserAvatar user={user} size="xs" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {user.email || "Roommate"}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <div className="p-3 rounded-xl bg-background/50 border border-border/80 text-center space-y-1">
                <p className="text-xs font-medium text-foreground">
                  Clean Slate Apartment
                </p>
                <p className="text-[11px] text-muted-foreground">
                  No roommates registered in Flat 4B yet. Fill out the
                  &quot;Join Apartment&quot; form above to create your account!
                </p>
              </div>
            )}
          </CardContent>
        </motion.div>

        {/* Security / Strict Ownership Notice */}
        <motion.div
          variants={footerVariants}
          className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5"
        >
          <ShieldCheck className="size-4 text-primary" />
          <span>
            Strict Ownership active: roommates only manage their own expenses.
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}

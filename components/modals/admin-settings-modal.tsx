"use client";

import * as React from "react";
import { useExpenses } from "@/context/expense-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { UserBadge } from "@/components/ui/user-badge";
import { CurrencyAmount } from "@/components/ui/currency-amount";
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
import { GroceryCatalogItem } from "@/types";
import {
  ShieldCheck,
  Users,
  Building,
  Sliders,
  Lock,
  Copy,
  Check,
  Key,
  Eye,
  EyeOff,
  UserPlus,
  ArrowRight,
  Sparkles,
  Phone,
  CreditCard,
  Zap,
  Wifi,
  Share2,
  Download,
  AlertTriangle,
  RotateCcw,
  ShoppingBag,
  Search,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useGroceryCatalog } from "@/hooks/use-grocery-catalog";
import { useLanguage } from "@/context/language-context";
import { toBengaliNumerals } from "@/lib/utils";

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSettingsModal({
  isOpen,
  onClose,
}: AdminSettingsModalProps) {
  const {
    users,
    currentUser,
    householdSettings,
    updateHouseholdSettings,
    updateUserRole,
    updateUserResidentStatus,
    addUser,
    resetToDefaults,
    isCloudConnected,
    ledger,
    expenses,
  } = useExpenses();
  const { t, isBangla } = useLanguage();

  const [activeTab, setActiveTab] = React.useState<
    "members" | "catalog" | "vault" | "policies" | "audit"
  >("members");

  // Copy state
  const [copiedField, setCopiedField] = React.useState<string | null>(null);
  const [showAdminKey, setShowAdminKey] = React.useState(false);

  // Vault form state
  const [householdName, setHouseholdName] = React.useState(
    householdSettings.householdName || "HouseMint Flat 4B"
  );
  const [inviteCode, setInviteCode] = React.useState(
    householdSettings.inviteCode || "MINT-4B"
  );
  const [adminInviteCode, setAdminInviteCode] = React.useState(
    householdSettings.adminInviteCode || "MINT-ADMIN-4B"
  );
  const [landlordName, setLandlordName] = React.useState(
    householdSettings.landlordName || ""
  );
  const [landlordPhone, setLandlordPhone] = React.useState(
    householdSettings.landlordPhone || ""
  );
  const [landlordPaymentMethod, setLandlordPaymentMethod] = React.useState(
    householdSettings.landlordPaymentMethod || ""
  );
  const [electricityMeterNo, setElectricityMeterNo] = React.useState(
    householdSettings.electricityMeterNo || ""
  );
  const [internetClientId, setInternetClientId] = React.useState(
    householdSettings.internetClientId || ""
  );
  const [vaultSaved, setVaultSaved] = React.useState(false);

  // Policies state
  const [emergencyEnabled, setEmergencyEnabled] = React.useState(
    householdSettings.emergencyFundEnabled ?? false
  );
  const [emergencyBalance, setEmergencyBalance] = React.useState(
    (householdSettings.emergencyFundBalance ?? 0).toString()
  );
  const [policiesSaved, setPoliciesSaved] = React.useState(false);

  // Add User sub-dialog state
  const [isAddUserOpen, setIsAddUserOpen] = React.useState(false);
  const [newUserName, setNewUserName] = React.useState("");
  const [newUserEmail, setNewUserEmail] = React.useState("");
  const [newUserRole, setNewUserRole] = React.useState<"admin" | "member">(
    "member"
  );
  const [newUserIsRoommate, setNewUserIsRoommate] = React.useState(true);

  // Month lock state
  const lockedMonths = householdSettings.lockedMonths || [];

  // Grocery Catalog manager state
  const { catalog, addItem, deleteItem } = useGroceryCatalog();
  const [catalogSearch, setCatalogSearch] = React.useState("");
  const [selectedCatalogCategory, setSelectedCatalogCategory] = React.useState("all");
  const [isAddItemOpen, setIsAddItemOpen] = React.useState(false);
  const [itemBn, setItemBn] = React.useState("");
  const [itemEn, setItemEn] = React.useState("");
  const [itemAliases, setItemAliases] = React.useState("");
  const [itemUnit, setItemUnit] = React.useState("কেজি");
  const [itemCategory, setItemCategory] = React.useState("staples");
  const [isSavingItem, setIsSavingItem] = React.useState(false);
  const [itemSavedSuccess, setItemSavedSuccess] = React.useState(false);
  const [catalogItemToDelete, setCatalogItemToDelete] = React.useState<GroceryCatalogItem | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = React.useState(false);

  // Category pills horizontal scroll state
  const categoryScrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkCategoryScroll = React.useCallback(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  React.useEffect(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const timer = setTimeout(checkCategoryScroll, 60);
    el.addEventListener("scroll", checkCategoryScroll, { passive: true });
    window.addEventListener("resize", checkCategoryScroll);
    return () => {
      clearTimeout(timer);
      el.removeEventListener("scroll", checkCategoryScroll);
      window.removeEventListener("resize", checkCategoryScroll);
    };
  }, [checkCategoryScroll, activeTab]);

  const handleScrollCategories = (direction: "left" | "right") => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const offset = direction === "left" ? -180 : 180;
    el.scrollBy({ left: offset, behavior: "smooth" });
  };

  const handleAddCatalogItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemBn.trim() || !itemEn.trim()) return;

    setIsSavingItem(true);
    try {
      const rawAliases = itemAliases
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      await addItem({
        name_bn: itemBn.trim(),
        name_en: itemEn.trim(),
        banglish_aliases: Array.from(new Set([itemEn.trim().toLowerCase(), ...rawAliases])),
        category: itemCategory,
        default_unit: itemUnit,
        usage_count: 50,
      });

      setItemBn("");
      setItemEn("");
      setItemAliases("");
      setItemUnit("কেজি");
      setItemCategory("staples");
      setIsAddItemOpen(false);
      setItemSavedSuccess(true);
      setTimeout(() => setItemSavedSuccess(false), 3000);
    } finally {
      setIsSavingItem(false);
    }
  };

  const filteredCatalog = React.useMemo(() => {
    return catalog.filter((item) => {
      if (selectedCatalogCategory === "custom") {
        if (!item.household_id) return false;
      } else if (selectedCatalogCategory !== "all") {
        if (item.category !== selectedCatalogCategory) return false;
      }

      if (!catalogSearch.trim()) return true;

      const q = catalogSearch.trim().toLowerCase();
      return (
        item.name_bn.includes(q) ||
        item.name_en.toLowerCase().includes(q) ||
        item.banglish_aliases?.some((a) => a.toLowerCase().includes(q))
      );
    });
  }, [catalog, catalogSearch, selectedCatalogCategory]);

  // Sync initial state whenever modal opens or householdSettings change
  React.useEffect(() => {
    if (isOpen) {
      setHouseholdName(householdSettings.householdName || "HouseMint Flat 4B");
      setInviteCode(householdSettings.inviteCode || "MINT-4B");
      setAdminInviteCode(householdSettings.adminInviteCode || "MINT-ADMIN-4B");
      setLandlordName(householdSettings.landlordName || "");
      setLandlordPhone(householdSettings.landlordPhone || "");
      setLandlordPaymentMethod(householdSettings.landlordPaymentMethod || "");
      setElectricityMeterNo(householdSettings.electricityMeterNo || "");
      setInternetClientId(householdSettings.internetClientId || "");
      setEmergencyEnabled(householdSettings.emergencyFundEnabled ?? false);
      setEmergencyBalance(
        (householdSettings.emergencyFundBalance ?? 0).toString()
      );
      setVaultSaved(false);
      setPoliciesSaved(false);
      setIsAddUserOpen(false);
    }
  }, [isOpen, householdSettings]);

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveVault = (e: React.FormEvent) => {
    e.preventDefault();
    updateHouseholdSettings({
      householdName,
      inviteCode: inviteCode.trim().toUpperCase(),
      adminInviteCode: adminInviteCode.trim().toUpperCase(),
      landlordName,
      landlordPhone,
      landlordPaymentMethod,
      electricityMeterNo,
      internetClientId,
    });
    setVaultSaved(true);
    setTimeout(() => setVaultSaved(false), 2500);
  };

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    updateHouseholdSettings({
      emergencyFundEnabled: emergencyEnabled,
      emergencyFundBalance: Number(emergencyBalance) || 0,
    });
    setPoliciesSaved(true);
    setTimeout(() => setPoliciesSaved(false), 2500);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim() || undefined,
      accent_color: "user-1",
      role: newUserRole,
      is_roommate: newUserIsRoommate,
    });

    setNewUserName("");
    setNewUserEmail("");
    setNewUserRole("member");
    setNewUserIsRoommate(true);
    setIsAddUserOpen(false);
  };

  const toggleMonthLock = (monthKey: string) => {
    const currentLocked = householdSettings.lockedMonths || [];
    const nextLocked = currentLocked.includes(monthKey)
      ? currentLocked.filter((m) => m !== monthKey)
      : [...currentLocked, monthKey];

    updateHouseholdSettings({
      lockedMonths: nextLocked,
    });
  };

  const handleExportBackup = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      household: householdSettings,
      users,
      expenses,
      debts: ledger.debts,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `housemint-backup-${householdSettings.householdName.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-[calc(100%-1.25rem)] sm:w-full sm:max-w-3xl max-h-[92dvh] sm:max-h-[88vh] flex flex-col bg-card border-border shadow-2xl p-0 rounded-xl overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-5 pb-3 sm:pb-4 border-b border-border bg-card shrink-0 text-left">
          <div className="flex items-center gap-2.5 sm:gap-3 pr-8 sm:pr-0">
            <div className="size-10 sm:size-11 rounded-lg sm:rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-xs shrink-0">
              <ShieldCheck className="size-5 sm:size-5.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <DialogTitle className="text-lg sm:text-xl font-bold text-foreground tracking-tight truncate">
                  {isBangla ? "মেস ও ফ্ল্যাট অ্যাডমিন হাব" : "Apartment Admin Hub"}
                </DialogTitle>
                <Badge
                  variant="outline"
                  className="border-primary/40 text-primary bg-primary/10 text-[10px] sm:text-xs px-2 py-0.5 font-semibold shrink-0"
                >
                  {isBangla ? "অ্যাডমিনিস্ট্রেটর" : "Administrator"}
                </Badge>
              </div>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-1 sm:line-clamp-none">
                {isBangla ? (
                  <>
                    রুমমেট সদস্য, ইনভাইট কোড, বাড়িওয়ালার তথ্য ও মেসের নিয়মাবলী —{" "}
                    <span className="font-semibold text-foreground">
                      {householdSettings.householdName}
                    </span>
                  </>
                ) : (
                  <>
                    Manage household members, invite keys, utility credentials & policies for{" "}
                    <span className="font-semibold text-foreground">
                      {householdSettings.householdName}
                    </span>
                  </>
                )}
              </DialogDescription>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="pt-3 sm:pt-4 w-full">
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as any)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-5 w-full h-auto p-1.5 bg-muted/60 border border-border rounded-xl gap-1 sm:gap-1.5">
                <TabsTrigger
                  value="members"
                  className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1 sm:px-3 rounded-lg text-xs sm:text-sm font-bold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer select-none focus-visible:ring-1 focus-visible:ring-primary/40"
                >
                  <Users className="size-4 shrink-0" />
                  <span className="whitespace-nowrap tracking-tight">
                    {isBangla ? "সদস্যগণ" : "Members"}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="catalog"
                  className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1 sm:px-3 rounded-lg text-xs sm:text-sm font-bold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer select-none focus-visible:ring-1 focus-visible:ring-primary/40"
                >
                  <ShoppingBag className="size-4 shrink-0" />
                  <span className="whitespace-nowrap tracking-tight">
                    {isBangla ? "ক্যাটালগ" : "Catalog"}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="vault"
                  className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1 sm:px-3 rounded-lg text-xs sm:text-sm font-bold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer select-none focus-visible:ring-1 focus-visible:ring-primary/40"
                >
                  <Building className="size-4 shrink-0" />
                  <span className="whitespace-nowrap tracking-tight">
                    {isBangla ? "ভল্ট" : "Vault"}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="policies"
                  className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1 sm:px-3 rounded-lg text-xs sm:text-sm font-bold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer select-none focus-visible:ring-1 focus-visible:ring-primary/40"
                >
                  <Sliders className="size-4 shrink-0" />
                  <span className="whitespace-nowrap tracking-tight">
                    {isBangla ? "নীতিমালা" : "Policies"}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="audit"
                  className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1 sm:px-3 rounded-lg text-xs sm:text-sm font-bold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer select-none focus-visible:ring-1 focus-visible:ring-primary/40"
                >
                  <Lock className="size-4 shrink-0" />
                  <span className="whitespace-nowrap tracking-tight">
                    {isBangla ? "অডিট" : "Audit"}
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </DialogHeader>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 overscroll-contain custom-scrollbar">
          {/* TAB 1: MEMBERS & KEYS */}
          {activeTab === "members" && (
            <div className="space-y-6">
              {/* Apartment Invite Keys Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Roommate Invite Code */}
                <div className="p-4 rounded-xl bg-background border border-border/80 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="size-3.5 text-primary" />
                      <span>{isBangla ? "রুমমেট ইনভাইট কোড" : "Roommate Invite Code"}</span>
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border">
                      {isBangla ? "রুমমেট" : "Roommates"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-card border border-border/60 font-mono text-base tracking-wider font-bold text-foreground">
                    <span>{householdSettings.inviteCode}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 cursor-pointer hover:bg-muted text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        copyToClipboard(householdSettings.inviteCode, "memberCode")
                      }
                      title={isBangla ? "ইনভাইট কোড কপি করুন" : "Copy Roommate Invite Code"}
                    >
                      {copiedField === "memberCode" ? (
                        <Check className="size-3.5 text-positive" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isBangla
                      ? "মেসে নতুন রুমমেট জয়েন করলে তাদের সাথে এই কোড শেয়ার করুন।"
                      : "Share with new roommates moving into Flat 4B to join grocery splits."}
                  </p>
                </div>

                {/* Admin Master Key */}
                <div className="p-4 rounded-xl bg-background border border-border/80 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Key className="size-3.5 text-primary" />
                      <span>{isBangla ? "অ্যাডমিন মাস্টার কি" : "Admin Master Key"}</span>
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs px-2 py-0.5 border-primary/30 text-primary bg-primary/5"
                    >
                      {isBangla ? "গোপন চাবি" : "Secret Key"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-card border border-border/60 font-mono text-base tracking-wider font-bold text-foreground">
                    <span>
                      {showAdminKey
                        ? householdSettings.adminInviteCode
                        : "••••••••••••"}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 cursor-pointer hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={() => setShowAdminKey(!showAdminKey)}
                        title={showAdminKey ? (isBangla ? "লুকান" : "Hide key") : (isBangla ? "দেখুন" : "Show key")}
                      >
                        {showAdminKey ? (
                          <EyeOff className="size-3.5" />
                        ) : (
                          <Eye className="size-3.5" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 cursor-pointer hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          copyToClipboard(
                            householdSettings.adminInviteCode,
                            "adminKey"
                          )
                        }
                        title={isBangla ? "মাস্টার কি কপি করুন" : "Copy Master Admin Key"}
                      >
                        {copiedField === "adminKey" ? (
                          <Check className="size-3.5 text-positive" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isBangla
                      ? "অ্যাডমিন প্রিভিলেজ সহ অ্যাকাউন্ট রেজিস্ট্রেশনের জন্য গোপন চাবি।"
                      : "Private secret key used to grant Administrator privileges upon registration."}
                  </p>
                </div>
              </div>

              {/* Members Roster Section */}
              <div className="space-y-3">
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {isBangla
                        ? `মেসের সদস্য তালিকা (মোট ${toBengaliNumerals(users.length)} জন)`
                        : `Household Roster (${users.length} Total)`}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {isBangla
                        ? "অ্যাডমিন ভূমিকা এবং খরচে অংশগ্রহণের রোল কনফিগার করুন।"
                        : "Configure administrative roles and resident split participation."}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsAddUserOpen(!isAddUserOpen)}
                    className="text-xs font-semibold bg-primary text-primary-foreground gap-1.5 cursor-pointer w-full xs:w-auto shrink-0 justify-center"
                  >
                    <UserPlus className="size-3.5" />
                    <span>{isBangla ? "নতুন সদস্য যোগ" : "Add Member"}</span>
                  </Button>
                </div>

                {/* Add User Expandable Form */}
                <AnimatePresence>
                  {isAddUserOpen && (
                    <motion.form
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      onSubmit={handleCreateUser}
                      className="p-4 rounded-xl bg-muted/30 border border-border/80 space-y-3"
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-border/60">
                        <span className="text-xs font-bold text-foreground">
                          {isBangla ? "নতুন সদস্য বা ম্যানেজার যোগ করুন" : "Add New Member or External Manager"}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsAddUserOpen(false)}
                          className="h-6 text-[11px] text-muted-foreground"
                        >
                          {t.common.cancel}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">
                            {isBangla ? "পূর্ণ নাম *" : "Full Name *"}
                          </label>
                          <Input
                            required
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            placeholder={isBangla ? "যেমন: তারিকুল ইসলাম" : "e.g. Tariq / Building Manager"}
                            className="bg-background text-xs h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">
                            {isBangla ? "ইমেইল (ঐচ্ছিক)" : "Email (Optional)"}
                          </label>
                          <Input
                            type="email"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            placeholder="e.g. tariq@gmail.com"
                            className="bg-background text-xs h-8"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">
                            {isBangla ? "প্রশাসনিক ভূমিকা" : "Administrative Role"}
                          </label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant={newUserRole === "member" ? "default" : "outline"}
                              onClick={() => setNewUserRole("member")}
                              className="text-xs flex-1 h-8 cursor-pointer"
                            >
                              {isBangla ? "সাধারণ সদস্য" : "Member"}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant={newUserRole === "admin" ? "default" : "outline"}
                              onClick={() => setNewUserRole("admin")}
                              className="text-xs flex-1 h-8 cursor-pointer gap-1"
                            >
                              <ShieldCheck className="size-3.5" />
                              <span>{isBangla ? "অ্যাডমিন" : "Admin"}</span>
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">
                            {isBangla ? "আর্থিক অংশীদারিত্ব" : "Financial Participation"}
                          </label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant={newUserIsRoommate ? "default" : "outline"}
                              onClick={() => setNewUserIsRoommate(true)}
                              className="text-xs flex-1 h-8 cursor-pointer"
                              title={isBangla ? "মেসের বাজার ও বিল সমান ভাগে ভাগ হবে" : "Splits groceries and apartment bills"}
                            >
                              {isBangla ? "রুমমেট" : "Roommate"}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant={!newUserIsRoommate ? "default" : "outline"}
                              onClick={() => setNewUserIsRoommate(false)}
                              className="text-xs flex-1 h-8 cursor-pointer"
                              title={isBangla ? "শুধু হিসাব নিয়ন্ত্রণ করবে, খরচের ভাগে থাকবে না" : "Admin only, excluded from splits & debts"}
                            >
                              {isBangla ? "বহিরাগত ম্যানেজার" : "External Manager"}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <Button
                          type="submit"
                          size="sm"
                          className="bg-primary text-primary-foreground text-xs font-semibold"
                        >
                          {isBangla ? "নিশ্চিত ও যোগ করুন" : "Confirm & Add User"}
                        </Button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Member Cards */}
                <div className="space-y-2">
                  {users.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    const isUserAdmin = u.role === "admin";
                    const isRoommate = u.is_roommate !== false;

                    return (
                      <div
                        key={u.id}
                        className="p-3.5 rounded-xl bg-background border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:border-border"
                      >
                        {/* User Identity */}
                        <div className="flex items-center gap-3 min-w-0">
                          <UserAvatar user={u} size="md" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-foreground truncate">
                                {u.name}
                              </span>
                              {isSelf && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0 text-muted-foreground font-normal"
                                >
                                  {t.common.you}
                                </Badge>
                              )}
                              {isUserAdmin ? (
                                <Badge className="text-[10px] px-2 py-0 bg-primary/15 text-primary border border-primary/30 font-semibold flex items-center gap-1">
                                  <ShieldCheck className="size-3" />
                                  <span>{isBangla ? "অ্যাডমিন" : "Admin"}</span>
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0 border-border text-muted-foreground"
                                >
                                  {isBangla ? "সদস্য" : "Member"}
                                </Badge>
                              )}

                              {isRoommate ? (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0 border-positive/30 text-positive bg-positive/5 shrink-0"
                                >
                                  {isBangla ? "সক্রিয় রুমমেট" : "Active Roommate"}
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0 border-warning/30 text-warning bg-warning/5 shrink-0"
                                >
                                  <span className="xs:hidden">{isBangla ? "ম্যানেজার" : "External"}</span>
                                  <span className="hidden xs:inline">
                                    {isBangla ? "বহিরাগত ম্যানেজার (ভাগে নেই)" : "External Manager (No Splits)"}
                                  </span>
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {u.email || (isBangla ? "স্থানীয় অ্যাকাউন্ট" : "Local account")}
                            </p>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="w-full grid grid-cols-2 gap-2 pt-2.5 border-t border-border/40 sm:border-0 sm:pt-0 sm:w-auto sm:flex sm:items-center sm:gap-2 shrink-0">
                          {/* Toggle Role Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 sm:h-7.5 w-full sm:w-auto cursor-pointer justify-center"
                            onClick={() =>
                              updateUserRole(
                                u.id,
                                isUserAdmin ? "member" : "admin"
                              )
                            }
                            title={
                              isUserAdmin
                                ? (isBangla ? "অ্যাডমিন পদবি সরান" : "Demote to Member")
                                : (isBangla ? "অ্যাডমিন বানান" : "Promote to Admin")
                            }
                          >
                            {isUserAdmin
                              ? (isBangla ? "অ্যাডমিন সরান" : "Remove Admin")
                              : (isBangla ? "অ্যাডমিন বানান" : "Make Admin")}
                          </Button>

                          {/* Toggle Roommate Split Status */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 sm:h-7.5 w-full sm:w-auto cursor-pointer justify-center"
                            onClick={() =>
                              updateUserResidentStatus(u.id, !isRoommate)
                            }
                            title={
                              isRoommate
                                ? (isBangla ? "বাজার ও বিলের ভাগ থেকে বাদ দিন" : "Exclude from grocery & bill splits")
                                : (isBangla ? "রুমমেট হিসেবে ভাগে যুক্ত করুন" : "Include in roommate splits")
                            }
                          >
                            {isRoommate
                              ? (isBangla ? "ম্যানেজার করুন" : "Set Manager")
                              : (isBangla ? "রুমমেট করুন" : "Set Roommate")}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GROCERY CATALOG & SUGGESTIONS */}
          {activeTab === "catalog" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <ShoppingBag className="size-4 text-primary" />
                    <span>{isBangla ? "মেসের বাজারের পণ্যের ক্যাটালগ ও সাজেশন" : "Apartment Grocery Catalog & Suggestions"}</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isBangla
                      ? "সকল রুমমেটের সুবিধার্থে বাংলা পণ্যের নাম, বাংলিশ ও ডিফল্ট পরিমাপ একক কনফিগার করুন।"
                      : "Manage Bangla item suggestions, phonetic Banglish spellings, and default units for all roommates."}
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  {itemSavedSuccess && (
                    <Badge className="bg-positive/15 border border-positive/30 text-positive text-xs flex items-center gap-1 font-semibold">
                      <Check className="size-3" />
                      <span>{isBangla ? "সংরক্ষিত হয়েছে" : "Item Saved"}</span>
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    onClick={() => setIsAddItemOpen((prev) => !prev)}
                    className="text-xs font-semibold gap-1.5 h-8 bg-primary text-primary-foreground hover:opacity-90 cursor-pointer w-full sm:w-auto justify-center"
                  >
                    <Plus className="size-3.5" />
                    <span>{isAddItemOpen ? (isBangla ? "ফর্ম বন্ধ" : "Close Form") : (isBangla ? "পণ্য যোগ" : "Add Item")}</span>
                  </Button>
                </div>
              </div>

              {/* Collapsible Add Item Card */}
              <AnimatePresence>
                {isAddItemOpen && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddCatalogItem}
                    className="p-4 rounded-xl bg-card border border-border/80 shadow-md space-y-3 overflow-hidden"
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-border/50">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-primary" />
                        <span>{isBangla ? "নতুন বাজারের পণ্য ও সাজেশন যোগ" : "Add New Grocery Suggestion"}</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {isBangla ? "সকল রুমমেটের সাথে স্বয়ংক্রিয়ভাবে সিঙ্ক হবে" : "Syncs instantly to all roommates"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-foreground">
                          {isBangla ? "বাংলা নাম *" : "Bangla Name *"}
                        </label>
                        <Input
                          placeholder={isBangla ? "যেমন: কালা ভুনা মসলা বা মিনিকেট চাল" : "e.g. কালা ভুনা মসলা or মিনিকেট চাল"}
                          value={itemBn}
                          onChange={(e) => setItemBn(e.target.value)}
                          className="h-8.5 text-xs bg-background border-border"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-foreground">
                          {isBangla ? "ইংরেজি নাম *" : "English Name *"}
                        </label>
                        <Input
                          placeholder="e.g. Kala Bhuna Spice Mix or Miniket Rice"
                          value={itemEn}
                          onChange={(e) => setItemEn(e.target.value)}
                          className="h-8.5 text-xs bg-background border-border"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-foreground">
                        {isBangla ? "বাংলিশ কিওয়ার্ড / সার্চ ট্যাগ (কমা দিয়ে লিখুন)" : "Banglish Aliases / Phonetic Keywords (comma-separated)"}
                      </label>
                      <Input
                        placeholder="e.g. kala bhuna, kalabhuna, mezbani, moshla"
                        value={itemAliases}
                        onChange={(e) => setItemAliases(e.target.value)}
                        className="h-8.5 text-xs bg-background border-border"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        {isBangla
                          ? "রুমমেটরা এই কিওয়ার্ডগুলো লিখলেই স্বয়ংক্রিয়ভাবে পণ্যটি সাজেস্ট করবে।"
                          : "Roommates can type any of these keywords to match this item."}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-foreground">
                          {isBangla ? "ডিফল্ট একক" : "Default Unit"}
                        </label>
                        <select
                          value={itemUnit}
                          onChange={(e) => setItemUnit(e.target.value)}
                          className="w-full h-10 bg-background border border-border rounded-xl px-3 text-xs font-medium focus:ring-2 focus:ring-primary/40 focus:border-primary focus:outline-none cursor-pointer"
                        >
                          <option value="কেজি">কেজি (kg)</option>
                          <option value="গ্রাম">গ্রাম (gm)</option>
                          <option value="লিটার">লিটার (litre)</option>
                          <option value="মিলি">মিলি (ml)</option>
                          <option value="ডজন">ডজন (dozen)</option>
                          <option value="হালি">হালি (hali)</option>
                          <option value="পিস">পিস (pcs)</option>
                          <option value="প্যাকেট">প্যাকেট (pack)</option>
                          <option value="আঁটি">আঁটি (bunch)</option>
                          <option value="বোতল">বোতল (bottle)</option>
                          <option value="বক্স">বক্স (box)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-foreground">
                          {isBangla ? "ক্যাটাগরি" : "Category"}
                        </label>
                        <select
                          value={itemCategory}
                          onChange={(e) => setItemCategory(e.target.value)}
                          className="w-full h-10 bg-background border border-border rounded-xl px-3 text-xs font-medium focus:ring-2 focus:ring-primary/40 focus:border-primary focus:outline-none cursor-pointer"
                        >
                          <option value="staples">{isBangla ? "নিত্যপণ্য ও চাল-ডাল (চাল, ডাল, আটা)" : "Staples & Grains (চাল, ডাল, আটা)"}</option>
                          <option value="vegetables">{isBangla ? "শাকসবজি ও কাঁচাবাজার" : "Vegetables (শাকসবজি)"}</option>
                          <option value="meat_fish">{isBangla ? "মাংস ও মাছ" : "Meat & Fish (মাংস ও মাছ)"}</option>
                          <option value="spices">{isBangla ? "মসলা ও উপাদান" : "Spices & Seasonings (মসলা)"}</option>
                          <option value="dairy_eggs">{isBangla ? "দুধ ও ডিম" : "Dairy & Eggs (ডিম, দুধ)"}</option>
                          <option value="oil_ghee">{isBangla ? "তেল ও ঘি" : "Oil & Ghee (তেল ও ঘি)"}</option>
                          <option value="household">{isBangla ? "বাসার পরিচ্ছন্নতা সামগ্রী" : "Household & Cleaning (পরিচ্ছন্নতা)"}</option>
                          <option value="other">{isBangla ? "অন্যান্য" : "Other / Miscellaneous"}</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddItemOpen(false)}
                        className="h-8 text-xs cursor-pointer"
                      >
                        {t.common.cancel}
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isSavingItem}
                        className="h-8 text-xs font-semibold bg-primary text-primary-foreground cursor-pointer"
                      >
                        {isSavingItem ? (isBangla ? "সংরক্ষণ হচ্ছে..." : "Saving...") : (isBangla ? "ক্যাটালগে সংরক্ষণ" : "Save to Catalog")}
                      </Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Search & Category Filter */}
              <div className="space-y-2.5">
                <div className="relative">
                  <Search className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    placeholder={isBangla ? "বাংলা নাম, ইংরেজি বা বাংলিশ দিয়ে খুঁজুন (যেমন: chal, dim, chicken)..." : "Search by Bangla name, English, or Banglish (e.g. chal, dim, chicken)..."}
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    className="h-9 pl-9 text-xs bg-background border-border"
                  />
                  {catalogSearch && (
                    <button
                      type="button"
                      onClick={() => setCatalogSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground px-1 py-0.5 cursor-pointer"
                    >
                      {isBangla ? "মুছুন" : "Clear"}
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="relative flex items-center">
                  {canScrollLeft && (
                    <button
                      type="button"
                      onClick={() => handleScrollCategories("left")}
                      className="absolute -left-1.5 z-20 size-6 sm:size-7 rounded-full bg-card/95 border border-border shadow-md flex items-center justify-center text-foreground hover:bg-accent hover:text-primary transition-all cursor-pointer"
                      aria-label="Scroll categories left"
                    >
                      <ChevronLeft className="size-3.5" />
                    </button>
                  )}

                  {canScrollLeft && (
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-card to-transparent pointer-events-none z-10" />
                  )}

                  <div
                    ref={categoryScrollRef}
                    className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 scroll-smooth no-scrollbar text-xs w-full"
                  >
                    {[
                      { key: "all", label: isBangla ? "সকল পণ্য" : "All Items" },
                      { key: "custom", label: isBangla ? "মেসের কাস্টম" : "Apartment Custom" },
                      { key: "staples", label: isBangla ? "চাল-ডাল" : "Staples" },
                      { key: "vegetables", label: isBangla ? "শাকসবজি" : "Vegetables" },
                      { key: "meat_fish", label: isBangla ? "মাংস ও মাছ" : "Meat & Fish" },
                      { key: "spices", label: isBangla ? "মসলা" : "Spices" },
                      { key: "dairy_eggs", label: isBangla ? "ডিম ও দুধ" : "Dairy & Eggs" },
                      { key: "oil_ghee", label: isBangla ? "তেল-ঘি" : "Oil & Ghee" },
                      { key: "household", label: isBangla ? "পরিচ্ছন্নতা" : "Household" },
                    ].map((cat) => (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={(e) => {
                          setSelectedCatalogCategory(cat.key);
                          e.currentTarget.scrollIntoView({
                            behavior: "smooth",
                            block: "nearest",
                            inline: "nearest",
                          });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                          selectedCatalogCategory === cat.key
                            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                            : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:border-border"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {canScrollRight && (
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-card to-transparent pointer-events-none z-10" />
                  )}

                  {canScrollRight && (
                    <button
                      type="button"
                      onClick={() => handleScrollCategories("right")}
                      className="absolute -right-1.5 z-20 size-6 sm:size-7 rounded-full bg-card/95 border border-border shadow-md flex items-center justify-center text-foreground hover:bg-accent hover:text-primary transition-all cursor-pointer"
                      aria-label="Scroll categories right"
                    >
                      <ChevronRight className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Catalog Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                  <span>
                    {isBangla
                      ? `${toBengaliNumerals(filteredCatalog.length)}টি পণ্য প্রদর্শিত হচ্ছে`
                      : `Showing ${filteredCatalog.length} item${filteredCatalog.length === 1 ? "" : "s"}`}
                  </span>
                  <span>
                    {isBangla ? "খরচ যোগ করার সময় অটো-সাজেশন সক্রিয়" : "Auto-suggestions active in Add & Edit Expense"}
                  </span>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                  {filteredCatalog.map((item) => {
                    const isApartmentCustom = Boolean(item.household_id);

                    return (
                      <div
                        key={item.id || item.name_bn}
                        className="p-3 rounded-xl bg-background border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-border transition-all"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-foreground">
                              {item.name_bn}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({item.name_en})
                            </span>
                            {isApartmentCustom ? (
                              <Badge className="text-[10px] px-1.5 py-0 bg-primary/15 border-primary/30 text-primary font-semibold">
                                {isBangla ? "মেসের কাস্টম" : "Apartment Custom"}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border text-muted-foreground">
                                {isBangla ? "ডিফল্ট" : "Default"}
                              </Badge>
                            )}
                          </div>

                          {item.banglish_aliases && item.banglish_aliases.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap pt-0.5">
                              <span className="text-[10px] text-muted-foreground">
                                {isBangla ? "ট্যাগ:" : "Matches:"}
                              </span>
                              {item.banglish_aliases.slice(0, 5).map((alias, aIdx) => (
                                <span
                                  key={aIdx}
                                  className="text-[10px] bg-accent/60 text-muted-foreground px-1.5 py-0.5 rounded font-mono"
                                >
                                  {alias}
                                </span>
                              ))}
                              {item.banglish_aliases.length > 5 && (
                                <span className="text-[10px] text-muted-foreground opacity-60">
                                  +{item.banglish_aliases.length - 5}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 w-full sm:w-auto pt-2 border-t border-border/40 sm:border-0 sm:pt-0">
                          {item.default_unit && (
                            <span className="text-[11px] font-semibold bg-accent/70 text-foreground px-2 py-0.5 rounded border border-border/60">
                              {isBangla ? `একক: ${item.default_unit}` : `Unit: ${item.default_unit}`}
                            </span>
                          )}

                          {isApartmentCustom && (
                            <button
                              type="button"
                              onClick={() => setCatalogItemToDelete(item)}
                              className="size-7 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer ml-auto sm:ml-0"
                              title={isBangla ? "পণ্য মুছুন" : "Delete custom item"}
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {filteredCatalog.length === 0 && (
                    <div className="text-center py-8 border border-dashed border-border/60 rounded-xl">
                      <ShoppingBag className="size-8 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-xs font-semibold text-foreground">
                        {isBangla ? "কোনো পণ্য খুঁজে পাওয়া যায়নি" : "No matching grocery items found"}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {isBangla
                          ? "অন্য কোনো নামে খুঁজুন অথবা উপরে 'পণ্য যোগ' বোতামে চাপুন।"
                          : 'Try a different search query or click "Add Item" above to create it.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LANDLORD & UTILITIES VAULT */}
          {activeTab === "vault" && (
            <form onSubmit={handleSaveVault} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {isBangla ? "বাড়িওয়ালা ও ইউটিলিটি তথ্য ভল্ট" : "Apartment & Landlord Credentials Vault"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isBangla
                      ? "পেমেন্ট রেফারেন্স তথ্য যাতে রুমমেটদের বারবার চাইতে না হয়।"
                      : "Shared reference details so flatmates never have to ask for payment info."}
                  </p>
                </div>
                {vaultSaved && (
                  <Badge className="bg-positive/15 border border-positive/30 text-positive text-xs flex items-center gap-1 font-semibold">
                    <Check className="size-3.5" />
                    <span>{isBangla ? "সংরক্ষিত!" : "Saved!"}</span>
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? "মেস / ফ্ল্যাটের নাম" : "Apartment / Household Display Name"}
                  </label>
                  <Input
                    required
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    placeholder={isBangla ? "যেমন: ফ্ল্যাট ৪বি — ধানমন্ডি" : "e.g. Flat 4B — Dhanmondi"}
                    className="bg-background text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Building className="size-3.5" />
                      <span>{isBangla ? "বাড়িওয়ালা / কেয়ারটেকারের নাম" : "Landlord / Manager Name"}</span>
                    </label>
                    <Input
                      value={landlordName}
                      onChange={(e) => setLandlordName(e.target.value)}
                      placeholder={isBangla ? "যেমন: আলহাজ্ব রফিকুল ইসলাম" : "e.g. Alhaj Rafiqul Islam"}
                      className="bg-background text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Phone className="size-3.5" />
                      <span>{isBangla ? "বাড়িওয়ালার মোবাইল নম্বর" : "Landlord Contact Phone"}</span>
                    </label>
                    <Input
                      value={landlordPhone}
                      onChange={(e) => setLandlordPhone(e.target.value)}
                      placeholder="e.g. +880 1711-234567"
                      className="bg-background text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="size-3.5" />
                      <span>{isBangla ? "বাড়িওয়ালার পেমেন্ট মাধ্যম (বিকাশ / ব্যাংক অ্যাকাউন্ট)" : "Landlord Payment Details (bKash / Bank Account)"}</span>
                    </span>
                    {landlordPaymentMethod && (
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(landlordPaymentMethod, "landlordPay")
                        }
                        className="text-[11px] text-primary hover:underline cursor-pointer flex items-center gap-1"
                      >
                        {copiedField === "landlordPay" ? (
                          <Check className="size-3" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                        <span>{isBangla ? "কপি" : "Copy"}</span>
                      </button>
                    )}
                  </label>
                  <Input
                    value={landlordPaymentMethod}
                    onChange={(e) => setLandlordPaymentMethod(e.target.value)}
                    placeholder={isBangla ? "যেমন: বিকাশ ০১৭১১২৩৪৫৬৭ / সিটি ব্যাংক A/C ২০৪১২৮৯১২" : "e.g. bKash 01711234567 / City Bank A/C 204128912"}
                    className="bg-background text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Zap className="size-3.5 text-amber-400" />
                        <span>{isBangla ? "ডেসকো / ডিপিডিসি প্রিপেইড বিদ্যুৎ মিটার নং" : "DESCO / DPDC Electricity Meter No"}</span>
                      </span>
                      {electricityMeterNo && (
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(electricityMeterNo, "meter")
                          }
                          className="text-[11px] text-primary hover:underline cursor-pointer flex items-center gap-1"
                        >
                          {copiedField === "meter" ? (
                            <Check className="size-3" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                          <span>{isBangla ? "কপি" : "Copy"}</span>
                        </button>
                      )}
                    </label>
                    <Input
                      value={electricityMeterNo}
                      onChange={(e) => setElectricityMeterNo(e.target.value)}
                      placeholder="e.g. Pre-paid Meter #1420993821"
                      className="bg-background text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Wifi className="size-3.5 text-cyan-400" />
                        <span>{isBangla ? "ওয়াইফাই / ইন্টারনেট ক্লায়েন্ট আইডি" : "Wi-Fi / ISP Client ID"}</span>
                      </span>
                      {internetClientId && (
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(internetClientId, "wifi")
                          }
                          className="text-[11px] text-primary hover:underline cursor-pointer flex items-center gap-1"
                        >
                          {copiedField === "wifi" ? (
                            <Check className="size-3" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                          <span>{isBangla ? "কপি" : "Copy"}</span>
                        </button>
                      )}
                    </label>
                    <Input
                      value={internetClientId}
                      onChange={(e) => setInternetClientId(e.target.value)}
                      placeholder="e.g. Carnival User ID: DH-DHM-402"
                      className="bg-background text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">
                      {isBangla ? "রুমমেট ইনভাইট কোড পরিবর্তন" : "Edit Roommate Invite Code"}
                    </label>
                    <Input
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="e.g. CODE-4B"
                      className="bg-background text-sm font-mono uppercase tracking-wider"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">
                      {isBangla ? "অ্যাডমিন মাস্টার কি পরিবর্তন" : "Edit Admin Master Key"}
                    </label>
                    <Input
                      value={adminInviteCode}
                      onChange={(e) => setAdminInviteCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SECRET-KEY"
                      className="bg-background text-sm font-mono uppercase tracking-wider"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  className="bg-primary text-primary-foreground text-xs font-semibold cursor-pointer w-full sm:w-auto"
                >
                  {isBangla ? "ভল্ট তথ্য সংরক্ষণ করুন" : "Save Vault Details"}
                </Button>
              </div>
            </form>
          )}

          {/* TAB 4: HOUSE POLICIES & SPLIT DEFAULTS */}
          {activeTab === "policies" && (
            <form onSubmit={handleSavePolicies} className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {isBangla ? "মেসের হিসাব নীতিমালা ও ড্রয়ার ফান্ড" : "Household Policies & Fund Management"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isBangla
                      ? "খরচ ভাগের ডিফল্ট নিয়ম ও ড্রয়ারের নগদ তহবিল পরিচালনা করুন।"
                      : "Configure default splitting behavior and common cash funds."}
                  </p>
                </div>
                {policiesSaved && (
                  <Badge className="bg-positive/15 border border-positive/30 text-positive text-xs flex items-center gap-1 font-semibold">
                    <Check className="size-3.5" />
                    <span>{isBangla ? "সংরক্ষিত!" : "Saved!"}</span>
                  </Badge>
                )}
              </div>

              {/* Emergency Petty Cash Pool */}
              <div className="p-4 rounded-xl bg-background border border-border/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <Sparkles className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground">
                        {isBangla ? "সাধারণ ড্রয়ার ক্যাশ / জরুরি তহবিল" : "Common Emergency / Petty Cash Pool"}
                      </h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 sm:line-clamp-none">
                        {isBangla
                          ? "খাবার পানির জার, ময়লার বিল ও বুয়ার বকশিশের মতো নগদ খরচের জন্য।"
                          : "Fixed household drawer cash for daily drinking water jars, garbage bills & maid tips."}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={emergencyEnabled}
                      onChange={(e) => setEmergencyEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {emergencyEnabled ? (
                  <div className="p-3 rounded-lg bg-card border border-border/60 space-y-3">
                    <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] text-muted-foreground block">
                          {isBangla ? "বর্তমান ড্রয়ার ক্যাশ ব্যালেন্স:" : "Current Pool Cash Balance:"}
                        </span>
                        <CurrencyAmount
                          amount={Number(emergencyBalance) || 0}
                          size="md"
                          className="text-foreground font-bold"
                        />
                      </div>
                      <div className="flex items-center gap-2 w-full xs:w-auto">
                        <span className="text-xs text-muted-foreground font-medium shrink-0">
                          {isBangla ? "ব্যালেন্স ৳:" : "Set Balance ৳:"}
                        </span>
                        <Input
                          type="number"
                          min="0"
                          value={emergencyBalance}
                          onChange={(e) => setEmergencyBalance(e.target.value)}
                          className="w-full xs:w-28 text-xs font-mono h-8 bg-background"
                        />
                      </div>
                    </div>

                    {/* Quick Add Chips */}
                    <div className="flex items-center gap-1.5 pt-1.5 border-t border-border/40 flex-wrap">
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {isBangla ? "দ্রুত জমা:" : "Quick Deposit:"}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setEmergencyBalance((prev) =>
                            ((Number(prev) || 0) + 500).toString()
                          )
                        }
                        className="h-6 px-2.5 rounded-full bg-accent/80 hover:bg-accent text-[10px] font-mono font-semibold text-foreground border border-border/60 cursor-pointer inline-flex items-center transition-colors"
                      >
                        {isBangla ? "+৳৫০০" : "+৳500"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setEmergencyBalance((prev) =>
                            ((Number(prev) || 0) + 1000).toString()
                          )
                        }
                        className="h-6 px-2.5 rounded-full bg-accent/80 hover:bg-accent text-[10px] font-mono font-semibold text-foreground border border-border/60 cursor-pointer inline-flex items-center transition-colors"
                      >
                        {isBangla ? "+৳১,০০০" : "+৳1,000"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setEmergencyBalance((prev) =>
                            ((Number(prev) || 0) + 2000).toString()
                          )
                        }
                        className="h-6 px-2.5 rounded-full bg-accent/80 hover:bg-accent text-[10px] font-mono font-semibold text-foreground border border-border/60 cursor-pointer inline-flex items-center transition-colors"
                      >
                        {isBangla ? "+৳২,০০০" : "+৳2,000"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmergencyBalance("0")}
                        className="h-6 px-2.5 rounded-full text-[10px] font-mono text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer ml-auto inline-flex items-center transition-colors"
                      >
                        {isBangla ? "৳০ করুন" : "Reset to ৳0"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/40 text-center">
                    <p className="text-[11px] text-muted-foreground">
                      {isBangla
                        ? "ড্রয়ার তহবিল বর্তমানে নিষ্ক্রিয়। সক্রিয় করতে উপরের সুইচটি অন করুন।"
                        : "Petty cash pool is currently disabled. Toggle the switch above to activate common drawer cash."}
                    </p>
                  </div>
                )}
              </div>

              {/* Default Splitting Policy */}
              <div className="p-4 rounded-xl bg-background border border-border/80 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {isBangla ? "মেসের খরচ ভাগ করার ডিফল্ট নিয়ম" : "Default Household Expense Splitting Rule"}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {isBangla
                      ? "নতুন বিল বা বাজার কীভাবে সকল রুমমেটের মাঝে স্বয়ংক্রিয়ভাবে ভাগ হবে।"
                      : "How new groceries and shared bills are divided by default."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-card border-2 border-primary/40 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">
                        {isBangla ? "সমান ১/N ভাগ (সক্রিয়)" : "Equal 1/N Split (Active)"}
                      </span>
                      <Badge className="text-[9px] bg-primary/20 text-primary border-primary/30">
                        {isBangla ? "ডিফল্ট" : "Default"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {isBangla
                        ? "সকল সক্রিয় রুমমেট সমানভাবে খরচ ভাগ করে এবং পয়সার অমিল নিখুঁতভাবে সমন্বয় করা হয়।"
                        : "All active roommates share expenses equally with 1-poisha remainder handling."}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/20 border border-border text-left opacity-80">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">
                        {isBangla ? "রুম-রেশিও অনুযায়ী ভাগ" : "Room-Ratio Split"}
                      </span>
                      <Badge variant="outline" className="text-[9px]">
                        {isBangla ? "ঐচ্ছিক" : "Configurable"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {isBangla
                        ? "মাস্টার বেডরুম বা বারান্দা আকারের ওপর ভিত্তি করে কাস্টম শতাংশ অনুযায়ী ভাগ।"
                        : "Custom percentage ratios per roommate based on master room or balcony size."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground">
                  {isBangla
                    ? "সকল পরিবর্তন স্বয়ংক্রিয়ভাবে সংরক্ষিত ও রুমমেটদের সাথে সিঙ্ক হবে।"
                    : "Changes save directly to Supabase & sync real-time to all roommates."}
                </span>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-primary text-primary-foreground text-xs font-semibold cursor-pointer w-full xs:w-auto shrink-0"
                >
                  {isBangla ? "নীতিমালা সংরক্ষণ" : "Save Policies"}
                </Button>
              </div>
            </form>
          )}

          {/* TAB 5: PERIOD LOCK & AUDIT */}
          {activeTab === "audit" && (
            <div className="space-y-5">
              <div className="pb-2 border-b border-border/60">
                <h3 className="text-sm font-bold text-foreground">
                  {isBangla ? "আর্থিক নিরাপত্তা, মাস লক ও ব্যাকআপ" : "Financial Integrity, Month Lock & Export"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isBangla
                    ? "হিসাব নিষ্পত্তি হয়ে যাওয়া পূর্ববর্তী মাস লক করুন এবং মেসের ডেটা ডাউনলোড করুন।"
                    : "Protect past records once settled and generate apartment archives."}
                </p>
              </div>

              {/* Month Lock Control */}
              <div className="p-4 rounded-xl bg-background border border-border/80 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Lock className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      {isBangla ? "পূর্ববর্তী মাসের হিসাব লক করুন" : "Lock Past Billing Months"}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      {isBangla
                        ? "লক করা থাকলে পূর্ববর্তী মাসের খরচ বা ভাউচার অনিচ্ছাকৃতভাবে পরিবর্তন করা যাবে না।"
                        : "Locked months freeze previous grocery logs so historical balances cannot be accidentally altered."}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {["2026-08", "2026-07"].map((mKey) => {
                    const isLocked = lockedMonths.includes(mKey);
                    const label = mKey === "2026-08"
                      ? (isBangla ? "আগস্ট ২০২৬ (চলতি মাস)" : "August 2026 (Current)")
                      : (isBangla ? "জুলাই ২০২৬ (নিষ্পত্তিকৃত)" : "July 2026 (Settled)");

                    return (
                      <div
                        key={mKey}
                        className="p-2.5 rounded-lg bg-card border border-border/60 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground font-mono">
                            {label}
                          </span>
                          {isLocked && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 border-amber-500/30 text-amber-400 bg-amber-500/10"
                            >
                              {isBangla ? "লক করা" : "Locked"}
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant={isLocked ? "default" : "outline"}
                          className="text-xs h-7 cursor-pointer"
                          onClick={() => toggleMonthLock(mKey)}
                        >
                          {isLocked
                            ? (isBangla ? "আনলক করুন" : "Unlock Month")
                            : (isBangla ? "লক করুন" : "Lock Month")}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Data Export & Backup */}
              <div className="p-4 rounded-xl bg-background border border-border/80 space-y-3">
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      {isBangla ? "সম্পূর্ণ মেসের ডেটা ব্যাকআপ ডাউনলোড" : "Download Full Apartment Backup"}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      {isBangla
                        ? "সকল খরচ, হিসাব, বকেয়া এবং মেসের সেটিংস JSON ফাইল হিসেবে এক্সপোর্ট করুন।"
                        : "Exports all expenses, splits, debts, and household settings as a JSON archive."}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExportBackup}
                    className="text-xs font-semibold gap-1.5 cursor-pointer w-full xs:w-auto shrink-0 justify-center"
                  >
                    <Download className="size-3.5" />
                    <span>{isBangla ? "JSON এক্সপোর্ট" : "Export JSON"}</span>
                  </Button>
                </div>
              </div>

              {/* Danger Zone */}
              {!isCloudConnected && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 space-y-3">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="size-4 shrink-0" />
                    <h4 className="text-xs font-bold">
                      {isBangla ? "ডেমো ডেটা রিসেট করুন" : "Reset Demo Household Data"}
                    </h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {isBangla
                      ? "অফলাইন মেসের ডেটা পূর্ববর্তী ডেমো অবস্থায় রিসেট করে দেবে।"
                      : "Resets offline data to default mock seeds."}
                  </p>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setIsResetConfirmOpen(true)}
                      className="text-xs font-semibold gap-1.5 cursor-pointer w-full xs:w-auto justify-center"
                    >
                      <RotateCcw className="size-3.5" />
                      <span>{isBangla ? "ডিফল্টে রিসেট" : "Reset to Defaults"}</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {/* Delete Custom Grocery Item Alert Dialog */}
    <AlertDialog open={Boolean(catalogItemToDelete)} onOpenChange={(open) => !open && setCatalogItemToDelete(null)}>
      <AlertDialogContent className="w-[95vw] sm:max-w-md bg-card border-border rounded-2xl p-5 sm:p-6 shadow-2xl">
        <AlertDialogHeader className="text-left space-y-2">
          <div className="size-10 rounded-full bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive mb-1">
            <AlertTriangle className="size-5" />
          </div>
          <AlertDialogTitle className="text-lg font-bold text-foreground">
            {isBangla ? "পণ্যটি তালিকা থেকে বাদ দিতে চান?" : "Delete Custom Item?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground space-y-1">
            <span>{isBangla ? "আপনি কি নিশ্চিতভাবে " : "Are you sure you want to remove "}</span>
            <strong className="text-foreground font-semibold">
              &ldquo;{catalogItemToDelete?.name_bn || catalogItemToDelete?.name_en}&rdquo;
            </strong>
            <span>{isBangla ? " মেসের ক্যাটালগ সাজেশন থেকে মুছে ফেলতে চান?" : " from apartment catalog suggestions?"}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pt-3 gap-2 flex-col-reverse sm:flex-row">
          <AlertDialogCancel className="h-10 rounded-xl border-border hover:bg-accent cursor-pointer">
            {t.common.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (catalogItemToDelete) {
                deleteItem(catalogItemToDelete.id);
                toast.success(isBangla ? "ক্যাটালগ পণ্য মুছে ফেলা হয়েছে" : "Catalog item removed", {
                  description: isBangla
                    ? `"${catalogItemToDelete.name_bn || catalogItemToDelete.name_en}" মুছে ফেলা হয়েছে।`
                    : `"${catalogItemToDelete.name_bn || catalogItemToDelete.name_en}" was deleted.`,
                });
                setCatalogItemToDelete(null);
              }
            }}
            className="h-10 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold cursor-pointer shadow-md shadow-destructive/20"
          >
            {isBangla ? "হ্যাঁ, মুছে ফেলুন" : "Yes, Remove Item"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Reset Household Data Alert Dialog */}
    <AlertDialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
      <AlertDialogContent className="w-[95vw] sm:max-w-md bg-card border-border rounded-2xl p-5 sm:p-6 shadow-2xl">
        <AlertDialogHeader className="text-left space-y-2">
          <div className="size-10 rounded-full bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive mb-1">
            <AlertTriangle className="size-5" />
          </div>
          <AlertDialogTitle className="text-lg font-bold text-foreground">
            {isBangla ? "সকল মেসের ডেটা রিসেট করতে চান?" : "Reset All Household Data?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground space-y-1">
            <span>
              {isBangla
                ? "আপনি কি নিশ্চিতভাবে মেসের সকল খরচ, লেনদেন ও হিসাব ডেমো অবস্থায় রিসেট করতে চান? "
                : "Are you sure you want to reset all household expenses, settlements, and recurring bills back to demo defaults? "}
            </span>
            <strong className="text-destructive font-semibold">
              {isBangla ? "এই কাজটি আর ফেরানো সম্ভব নয়।" : "This action cannot be undone."}
            </strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pt-3 gap-2 flex-col-reverse sm:flex-row">
          <AlertDialogCancel className="h-10 rounded-xl border-border hover:bg-accent cursor-pointer">
            {t.common.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              resetToDefaults();
              toast.success(isBangla ? "মেসের ডেটা সফলভাবে রিসেট করা হয়েছে" : "Household data reset to default demo seeds");
              setIsResetConfirmOpen(false);
              onClose();
            }}
            className="h-10 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold cursor-pointer shadow-md shadow-destructive/20"
          >
            {isBangla ? "হ্যাঁ, সব রিসেট করুন" : "Yes, Reset Everything"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
}

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
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useGroceryCatalog } from "@/hooks/use-grocery-catalog";

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
    householdSettings.emergencyFundEnabled ?? true
  );
  const [emergencyBalance, setEmergencyBalance] = React.useState(
    (householdSettings.emergencyFundBalance ?? 3500).toString()
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
      setEmergencyEnabled(householdSettings.emergencyFundEnabled ?? true);
      setEmergencyBalance(
        (householdSettings.emergencyFundBalance ?? 3500).toString()
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col bg-card border-border shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-5 pb-4 border-b border-border/80 bg-muted/20 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-xs">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg font-bold text-foreground">
                    Apartment Admin Hub
                  </DialogTitle>
                  <Badge
                    variant="outline"
                    className="border-primary/40 text-primary bg-primary/10 text-[10px] px-2 py-0 font-semibold"
                  >
                    Administrator
                  </Badge>
                </div>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Manage household members, invite keys, utility credentials & policies for{" "}
                  <span className="font-semibold text-foreground">
                    {householdSettings.householdName}
                  </span>
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="pt-4">
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as any)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full bg-background/80 border border-border/80 p-1">
                <TabsTrigger
                  value="members"
                  className="text-xs font-semibold gap-1.5 py-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground"
                >
                  <Users className="size-3.5" />
                  <span className="hidden sm:inline">Members & Keys</span>
                  <span className="sm:hidden">Members</span>
                </TabsTrigger>
                <TabsTrigger
                  value="catalog"
                  className="text-xs font-semibold gap-1.5 py-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground"
                >
                  <ShoppingBag className="size-3.5" />
                  <span className="hidden sm:inline">Grocery Catalog</span>
                  <span className="sm:hidden">Catalog</span>
                </TabsTrigger>
                <TabsTrigger
                  value="vault"
                  className="text-xs font-semibold gap-1.5 py-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground"
                >
                  <Building className="size-3.5" />
                  <span className="hidden sm:inline">Landlord & Vault</span>
                  <span className="sm:hidden">Vault</span>
                </TabsTrigger>
                <TabsTrigger
                  value="policies"
                  className="text-xs font-semibold gap-1.5 py-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground"
                >
                  <Sliders className="size-3.5" />
                  <span className="hidden sm:inline">House Policies</span>
                  <span className="sm:hidden">Policies</span>
                </TabsTrigger>
                <TabsTrigger
                  value="audit"
                  className="text-xs font-semibold gap-1.5 py-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground"
                >
                  <Lock className="size-3.5" />
                  <span className="hidden sm:inline">Period Lock & Audit</span>
                  <span className="sm:hidden">Lock</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </DialogHeader>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
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
                      <span>Roommate Invite Code</span>
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border">
                      Roommates
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-card border border-border/60 font-mono text-sm tracking-wider font-bold text-foreground">
                    <span>{householdSettings.inviteCode}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 cursor-pointer hover:bg-muted text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        copyToClipboard(householdSettings.inviteCode, "memberCode")
                      }
                      title="Copy Roommate Invite Code"
                    >
                      {copiedField === "memberCode" ? (
                        <Check className="size-3.5 text-positive" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Share with new roommates moving into Flat 4B to join grocery splits.
                  </p>
                </div>

                {/* Admin Master Key */}
                <div className="p-4 rounded-xl bg-background border border-border/80 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Key className="size-3.5 text-primary" />
                      <span>Admin Master Key</span>
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 border-primary/30 text-primary bg-primary/5"
                    >
                      Secret Key
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-card border border-border/60 font-mono text-sm tracking-wider font-bold text-foreground">
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
                        title={showAdminKey ? "Hide key" : "Show key"}
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
                        title="Copy Master Admin Key"
                      >
                        {copiedField === "adminKey" ? (
                          <Check className="size-3.5 text-positive" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Private secret key used to grant Administrator privileges upon registration.
                  </p>
                </div>
              </div>

              {/* Members Roster Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      Household Roster ({users.length} Total)
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Configure administrative roles and resident split participation.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsAddUserOpen(!isAddUserOpen)}
                    className="text-xs font-semibold bg-primary text-primary-foreground gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="size-3.5" />
                    <span>Add Member</span>
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
                          Add New Member or External Manager
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsAddUserOpen(false)}
                          className="h-6 text-[11px] text-muted-foreground"
                        >
                          Cancel
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">
                            Full Name
                          </label>
                          <Input
                            required
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            placeholder="e.g. Tariq / Building Manager"
                            className="bg-background text-xs h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">
                            Email (Optional)
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
                            Administrative Role
                          </label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant={newUserRole === "member" ? "default" : "outline"}
                              onClick={() => setNewUserRole("member")}
                              className="text-xs flex-1 h-8 cursor-pointer"
                            >
                              Member
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant={newUserRole === "admin" ? "default" : "outline"}
                              onClick={() => setNewUserRole("admin")}
                              className="text-xs flex-1 h-8 cursor-pointer gap-1"
                            >
                              <ShieldCheck className="size-3.5" />
                              <span>Admin</span>
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">
                            Financial Participation
                          </label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant={newUserIsRoommate ? "default" : "outline"}
                              onClick={() => setNewUserIsRoommate(true)}
                              className="text-xs flex-1 h-8 cursor-pointer"
                              title="Splits groceries and apartment bills"
                            >
                              Roommate
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant={!newUserIsRoommate ? "default" : "outline"}
                              onClick={() => setNewUserIsRoommate(false)}
                              className="text-xs flex-1 h-8 cursor-pointer"
                              title="Admin only, excluded from splits & debts"
                            >
                              External Manager
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
                          Confirm & Add User
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
                                  You
                                </Badge>
                              )}
                              {isUserAdmin ? (
                                <Badge className="text-[10px] px-2 py-0 bg-primary/15 text-primary border border-primary/30 font-semibold flex items-center gap-1">
                                  <ShieldCheck className="size-3" />
                                  <span>Admin</span>
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0 border-border text-muted-foreground"
                                >
                                  Member
                                </Badge>
                              )}

                              {isRoommate ? (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0 border-positive/30 text-positive bg-positive/5"
                                >
                                  Active Roommate
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0 border-warning/30 text-warning bg-warning/5"
                                >
                                  External Manager (No Splits)
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {u.email || "Local account"}
                            </p>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {/* Toggle Role Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7.5 cursor-pointer"
                            onClick={() =>
                              updateUserRole(
                                u.id,
                                isUserAdmin ? "member" : "admin"
                              )
                            }
                            title={
                              isUserAdmin
                                ? "Demote to Member"
                                : "Promote to Admin"
                            }
                          >
                            {isUserAdmin ? "Remove Admin" : "Make Admin"}
                          </Button>

                          {/* Toggle Roommate Split Status */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7.5 cursor-pointer"
                            onClick={() =>
                              updateUserResidentStatus(u.id, !isRoommate)
                            }
                            title={
                              isRoommate
                                ? "Exclude from grocery & bill splits"
                                : "Include in roommate splits"
                            }
                          >
                            {isRoommate ? "Set Manager" : "Set Roommate"}
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
                    <span>Apartment Grocery Catalog & Suggestions</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Manage Bangla item suggestions, phonetic Banglish spellings, and default units for all roommates.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {itemSavedSuccess && (
                    <Badge className="bg-positive/15 border border-positive/30 text-positive text-xs flex items-center gap-1 font-semibold">
                      <Check className="size-3" />
                      <span>Item Saved</span>
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    onClick={() => setIsAddItemOpen((prev) => !prev)}
                    className="text-xs font-semibold gap-1.5 h-8 bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>{isAddItemOpen ? "Close Form" : "Add Item"}</span>
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
                        <span>Add New Grocery Suggestion</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground">Syncs instantly to all roommates via Supabase</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-foreground">Bangla Name *</label>
                        <Input
                          placeholder="e.g. কালা ভুনা মসলা or মিনিকেট চাল"
                          value={itemBn}
                          onChange={(e) => setItemBn(e.target.value)}
                          className="h-8.5 text-xs bg-background border-border"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-foreground">English Name *</label>
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
                        Banglish Aliases / Phonetic Keywords (comma-separated)
                      </label>
                      <Input
                        placeholder="e.g. kala bhuna, kalabhuna, mezbani, moshla"
                        value={itemAliases}
                        onChange={(e) => setItemAliases(e.target.value)}
                        className="h-8.5 text-xs bg-background border-border"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Roommates can type any of these keywords to match this item.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-foreground">Default Unit</label>
                        <select
                          value={itemUnit}
                          onChange={(e) => setItemUnit(e.target.value)}
                          className="w-full h-8.5 bg-background border border-border rounded-md px-2.5 text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
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
                        <label className="text-[11px] font-semibold text-foreground">Category</label>
                        <select
                          value={itemCategory}
                          onChange={(e) => setItemCategory(e.target.value)}
                          className="w-full h-8.5 bg-background border border-border rounded-md px-2.5 text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                        >
                          <option value="staples">Staples & Grains (চাল, ডাল, আটা)</option>
                          <option value="vegetables">Vegetables (শাকসবজি)</option>
                          <option value="meat_fish">Meat & Fish (মাংস ও মাছ)</option>
                          <option value="spices">Spices & Seasonings (মসলা)</option>
                          <option value="dairy_eggs">Dairy & Eggs (ডিম, দুধ)</option>
                          <option value="oil_ghee">Oil & Ghee (তেল ও ঘি)</option>
                          <option value="household">Household & Cleaning (পরিচ্ছন্নতা)</option>
                          <option value="other">Other / Miscellaneous</option>
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
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isSavingItem}
                        className="h-8 text-xs font-semibold bg-primary text-primary-foreground cursor-pointer"
                      >
                        {isSavingItem ? "Saving..." : "Save to Catalog"}
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
                    placeholder="Search by Bangla name, English, or Banglish (e.g. chal, dim, chicken)..."
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
                      Clear
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                  {[
                    { key: "all", label: "All Items" },
                    { key: "custom", label: "Apartment Custom" },
                    { key: "staples", label: "Staples" },
                    { key: "vegetables", label: "Vegetables" },
                    { key: "meat_fish", label: "Meat & Fish" },
                    { key: "spices", label: "Spices" },
                    { key: "dairy_eggs", label: "Dairy & Eggs" },
                    { key: "oil_ghee", label: "Oil & Ghee" },
                    { key: "household", label: "Household" },
                  ].map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setSelectedCatalogCategory(cat.key)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                        selectedCatalogCategory === cat.key
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "bg-card border border-border/80 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Catalog Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                  <span>
                    Showing {filteredCatalog.length} item{filteredCatalog.length === 1 ? "" : "s"}
                  </span>
                  <span>Auto-suggestions active in Add & Edit Expense</span>
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
                                Apartment Custom
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border text-muted-foreground">
                                Default
                              </Badge>
                            )}
                          </div>

                          {item.banglish_aliases && item.banglish_aliases.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap pt-0.5">
                              <span className="text-[10px] text-muted-foreground">Matches:</span>
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
                                  +{item.banglish_aliases.length - 5} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {item.default_unit && (
                            <span className="text-[11px] font-semibold bg-accent/70 text-foreground px-2 py-0.5 rounded border border-border/60">
                              Unit: {item.default_unit}
                            </span>
                          )}

                          {isApartmentCustom && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Remove "${item.name_bn}" from apartment suggestions?`)) {
                                  deleteItem(item.id);
                                }
                              }}
                              className="size-7 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete custom item"
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
                      <p className="text-xs font-semibold text-foreground">No matching grocery items found</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Try a different search query or click "Add Item" above to create it.
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
                    Apartment & Landlord Credentials Vault
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Shared reference details so flatmates never have to ask for payment info.
                  </p>
                </div>
                {vaultSaved && (
                  <Badge className="bg-positive/15 border border-positive/30 text-positive text-xs flex items-center gap-1 font-semibold">
                    <Check className="size-3.5" />
                    <span>Saved!</span>
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Apartment / Household Display Name
                  </label>
                  <Input
                    required
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    placeholder="e.g. Flat 4B — Dhanmondi"
                    className="bg-background text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Building className="size-3.5" />
                      <span>Landlord / Manager Name</span>
                    </label>
                    <Input
                      value={landlordName}
                      onChange={(e) => setLandlordName(e.target.value)}
                      placeholder="e.g. Alhaj Rafiqul Islam"
                      className="bg-background text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Phone className="size-3.5" />
                      <span>Landlord Contact Phone</span>
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
                      <span>Landlord Payment Details (bKash / Bank Account)</span>
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
                        <span>Copy</span>
                      </button>
                    )}
                  </label>
                  <Input
                    value={landlordPaymentMethod}
                    onChange={(e) => setLandlordPaymentMethod(e.target.value)}
                    placeholder="e.g. bKash 01711234567 / City Bank A/C 204128912"
                    className="bg-background text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Zap className="size-3.5 text-amber-400" />
                        <span>DESCO / DPDC Electricity Meter No</span>
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
                          <span>Copy</span>
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
                        <span>Wi-Fi / ISP Client ID</span>
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
                          <span>Copy</span>
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
                      Edit Roommate Invite Code
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
                      Edit Admin Master Key
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
                  className="bg-primary text-primary-foreground text-xs font-semibold cursor-pointer"
                >
                  Save Vault Details
                </Button>
              </div>
            </form>
          )}

          {/* TAB 3: HOUSE POLICIES & SPLIT DEFAULTS */}
          {activeTab === "policies" && (
            <form onSubmit={handleSavePolicies} className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Household Policies & Fund Management
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Configure default splitting behavior and common cash funds.
                  </p>
                </div>
                {policiesSaved && (
                  <Badge className="bg-positive/15 border border-positive/30 text-positive text-xs flex items-center gap-1 font-semibold">
                    <Check className="size-3.5" />
                    <span>Saved!</span>
                  </Badge>
                )}
              </div>

              {/* Emergency Petty Cash Pool */}
              <div className="p-4 rounded-xl bg-background border border-border/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Sparkles className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        Common Emergency / Petty Cash Pool
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Fixed household drawer cash for daily drinking water jars, garbage bills & maid tips.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emergencyEnabled}
                      onChange={(e) => setEmergencyEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {emergencyEnabled && (
                  <div className="p-3 rounded-lg bg-card border border-border/60 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] text-muted-foreground block">
                        Current Pool Cash Balance:
                      </span>
                      <CurrencyAmount
                        amount={Number(emergencyBalance) || 0}
                        size="md"
                        className="text-foreground font-bold"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-medium">
                        Update ৳:
                      </span>
                      <Input
                        type="number"
                        value={emergencyBalance}
                        onChange={(e) => setEmergencyBalance(e.target.value)}
                        className="w-28 text-xs font-mono h-8 bg-background"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Default Splitting Policy */}
              <div className="p-4 rounded-xl bg-background border border-border/80 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    Default Household Expense Splitting Rule
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    How new groceries and shared bills are divided by default.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-card border-2 border-primary/40 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">
                        Equal 1/N Split (Active)
                      </span>
                      <Badge className="text-[9px] bg-primary/20 text-primary border-primary/30">
                        Default
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      All active roommates share expenses equally with 1-poisha remainder handling.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/20 border border-border text-left opacity-80">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">
                        Room-Ratio Split
                      </span>
                      <Badge variant="outline" className="text-[9px]">
                        Configurable
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Custom percentage ratios per roommate based on master room or balcony size.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  className="bg-primary text-primary-foreground text-xs font-semibold cursor-pointer"
                >
                  Save Policies
                </Button>
              </div>
            </form>
          )}

          {/* TAB 4: PERIOD LOCK & AUDIT */}
          {activeTab === "audit" && (
            <div className="space-y-5">
              <div className="pb-2 border-b border-border/60">
                <h3 className="text-sm font-bold text-foreground">
                  Financial Integrity, Month Lock & Export
                </h3>
                <p className="text-xs text-muted-foreground">
                  Protect past records once settled and generate apartment archives.
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
                      Lock Past Billing Months
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Locked months freeze previous grocery logs so historical balances cannot be accidentally altered.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {["2026-08", "2026-07"].map((mKey) => {
                    const isLocked = lockedMonths.includes(mKey);
                    const label = mKey === "2026-08" ? "August 2026 (Current)" : "July 2026 (Settled)";

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
                              Locked
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant={isLocked ? "default" : "outline"}
                          className="text-xs h-7 cursor-pointer"
                          onClick={() => toggleMonthLock(mKey)}
                        >
                          {isLocked ? "Unlock Month" : "Lock Month"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Data Export & Backup */}
              <div className="p-4 rounded-xl bg-background border border-border/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      Download Full Apartment Backup
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Exports all expenses, splits, debts, and household settings as a JSON archive.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExportBackup}
                    className="text-xs font-semibold gap-1.5 cursor-pointer"
                  >
                    <Download className="size-3.5" />
                    <span>Export JSON</span>
                  </Button>
                </div>
              </div>

              {/* Danger Zone (offline prototype only) */}
              {!isCloudConnected && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 space-y-3">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="size-4" />
                    <h4 className="text-xs font-bold">Reset Demo Household Data</h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Resets offline data to default mock seeds.
                  </p>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (
                          confirm(
                            "Are you sure you want to reset all household data to default seeds?"
                          )
                        ) {
                          resetToDefaults();
                          onClose();
                        }
                      }}
                      className="text-xs font-semibold gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="size-3.5" />
                      <span>Reset to Defaults</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

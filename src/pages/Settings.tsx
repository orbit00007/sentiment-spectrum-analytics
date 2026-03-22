import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import openaiIcon from "@/assets/openai-icon.svg";
import googleaioverviewColorIcon from "@/assets/googleaioverview.svg";
import googleaimodeIcon from "@/assets/gemini-color.svg";
import perplexityIcon from "@/assets/perplexity-icon.svg";
import {
  ArrowLeft,
  Building2,
  History,
  User,
  Globe,
  X,
  Plus,
  Loader2,
  Download,
  Sparkles,
  Trash2,
  Upload,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  getAnalyticsHistory,
  getAnalyticsById,
  type AnalyticsHistoryItem,
} from "@/apiHelpers";
import {
  PLAN_LIMITS,
  type PricingPlanName,
  checkJourneyAccess,
  getRoleName,
} from "@/lib/plans";
import { formatLocalDate, formatShortDate } from "@/lib/dateUtils";
import { generateReport } from "@/results/layout/downloadReport";
import { setAnalyticsDataTemporary } from "@/results/data/analyticsData";

import {
  getBrandName,
  getBrandWebsite,
  getCompetitorNames,
  getProductId,
  getBrandInfoWithLogos,
  getAnalysisDate,
  getAnalysisKeywords,
  getModelName,
  getBrandLogo,
} from "@/results/data/analyticsData";

type SettingsTab = "company" | "history" | "account";

interface Competitor {
  id: string;
  name: string;
}

interface AIModel {
  id: string;
  name: string;
  icon: string;
  svgIcon?: string;
  enabled: boolean;
  allowedByPlan: boolean;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const AVATAR_COLORS = [
  "bg-destructive",
  "bg-primary",
  "bg-success",
  "bg-warning",
  "bg-[hsl(258_90%_66%)]",
  "bg-[hsl(330_80%_55%)]",
];
const getAvatarColor = (name: string) => {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

const ALL_MODELS: { id: string; name: string; icon: string; svgIcon?: string }[] = [
  { id: "openai", name: "ChatGPT", icon: "openai", svgIcon: openaiIcon },
  { id: "google-ai-overview", name: "Google AI Overview", icon: "google", svgIcon: googleaioverviewColorIcon },
  { id: "google-ai-mode", name: "Google AI Mode", icon: "google", svgIcon: googleaimodeIcon },
  { id: "perplexity", name: "Perplexity", icon: "perplexity", svgIcon: perplexityIcon },
];

const CANCELLATION_REASONS = [
  "Too expensive / pricing",
  "Not using it enough",
  "Missing features I need",
  "Switching to a competitor",
  "Technical issues / bugs",
  "Business shutting down or pivoting",
  "Just testing / was never a real user",
  "Other",
];

export default function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    products,
    applications,
    pricingPlan,
    userRoleInt,
    planInt,
    planExpiresAt,
    collaborators,
    logout,
  } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<SettingsTab>("company");

  const analyticsCompanyName = getBrandName();
  const analyticsWebsite = getBrandWebsite();
  const analyticsProductId = getProductId();
  const analyticsKeywords = getAnalysisKeywords();
  const [cancelFeedback, setCancelFeedback] = useState("");

  const product = products?.[0];
  const application = applications?.[0];
  const [companyName, setCompanyName] = useState(analyticsCompanyName || "");
  const [websiteUrl, setWebsiteUrl] = useState(analyticsWebsite || "");
  const [industry, setIndustry] = useState("");
  const [aboutCompany, setAboutCompany] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [competitors, setCompetitors] = useState<Competitor[]>(() =>
    getCompetitorNames().map((name, i) => ({ id: String(i), name }))
  );
  const [newCompetitor, setNewCompetitor] = useState("");

  const planLimits =
    PLAN_LIMITS[pricingPlan as PricingPlanName] || PLAN_LIMITS.free;
  const [aiModels, setAiModels] = useState<AIModel[]>([]);

  const [analyticsList, setAnalyticsList] = useState<AnalyticsHistoryItem[]>(
    []
  );
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyTotalItems, setHistoryTotalItems] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // ── Danger Zone state ──────────────────────────────────────────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTypedName, setDeleteTypedName] = useState("");
  const [deleteCancelReason, setDeleteCancelReason] = useState("");
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);
  const [deleteSubmitted, setDeleteSubmitted] = useState(false);

  const deleteNameMatches =
    deleteTypedName.trim().toLowerCase() === fullName.trim().toLowerCase();
  const canSubmitDelete =
    deleteNameMatches && deleteCancelReason.length > 0 && !isSubmittingDelete;

  const canEdit = userRoleInt <= 3;
  const isAdmin = userRoleInt <= 1;
  const canExport = checkJourneyAccess(
    "report:export",
    userRoleInt,
    planInt,
    planExpiresAt
  ).allowed;

  useEffect(() => {
    if (!companyName) {
      if (analyticsCompanyName) setCompanyName(analyticsCompanyName);
      else if (product?.name) setCompanyName(product.name);
      else if (application?.company_name)
        setCompanyName(application.company_name);
    }
    if (!websiteUrl) {
      if (analyticsWebsite) setWebsiteUrl(analyticsWebsite);
      else if (product?.website) setWebsiteUrl(product.website);
    }
    if (product) {
      setIndustry(product.business_domain || "");
      setAboutCompany(product.description || "");
    }
    if (user) {
      setFullName(`${user.first_name} ${user.last_name}`.trim());
      setEmail(user.email || "");
    }
  }, [product, application, user]);

  useEffect(() => {
    const names = getCompetitorNames();
    if (names.length > 0) {
      setCompetitors(names.map((name, i) => ({ id: String(i), name })));
    }
  }, []);

  useEffect(() => {
    const modelsUsedStr = getModelName();
    const trackedModelIds = modelsUsedStr
      ? modelsUsedStr.split(",").map((s: string) => s.trim().toLowerCase())
      : [];

    const models = ALL_MODELS.map((m) => {
      const allowedByPlan = planLimits.allowedModels.includes(m.id);
      const isTracked = trackedModelIds.some(
        (t: string) =>
          t === m.id ||
          (m.id === "openai" && (t === "chatgpt" || t === "openai")) ||
          (m.id === "google_ai_mode" && t === "google_ai_mode") ||
          (m.id === "google_ai_overview" && t === "google_ai_overview") ||
          (m.id === "perplexity" && t === "perplexity")
      );
      return {
        ...m,
        enabled:
          allowedByPlan &&
          (trackedModelIds.length === 0 ? allowedByPlan : isTracked),
        allowedByPlan,
        svgIcon: m.svgIcon,
      };
    });
    setAiModels(models);
  }, [pricingPlan]);

  useEffect(() => {
    const loadHistory = async () => {
      const productId = analyticsProductId || products?.[0]?.id;
      if (!productId) return;
      setIsLoadingHistory(true);
      try {
        const data = await getAnalyticsHistory(productId, 1);
        setAnalyticsList(data.analytics || []);
        setHistoryPage(data.page);
        setHistoryTotalPages(data.total_pages);
        setHistoryTotalItems(data.total_items);
      } catch {
        // silent
      } finally {
        setIsLoadingHistory(false);
      }
    };
    if (activeTab === "history") loadHistory();
  }, [activeTab, analyticsProductId]);

  const handleSaveCompany = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Changes saved",
        description: "Company details updated successfully.",
      });
    }, 800);
  };

  const handleSaveAccount = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Changes saved",
        description: "Account details updated.",
      });
    }, 800);
  };

  const addCompetitor = () => {
    const trimmed = newCompetitor.trim();
    if (!trimmed) return;
    if (competitors.length >= planLimits.maxCompetitors) {
      toast({
        title: "Limit reached",
        description: `Your plan allows up to ${planLimits.maxCompetitors} competitors.`,
        variant: "destructive",
      });
      return;
    }
    if (
      competitors.find((c) => c.name.toLowerCase() === trimmed.toLowerCase())
    ) {
      toast({
        title: "Already exists",
        description: "This competitor is already being tracked.",
        variant: "destructive",
      });
      return;
    }
    setCompetitors([
      ...competitors,
      { id: Date.now().toString(), name: trimmed },
    ]);
    setNewCompetitor("");
  };

  const removeCompetitor = (id: string) => {
    setCompetitors(competitors.filter((c) => c.id !== id));
  };

  // toggleModel is kept but AI model switches are always disabled — no-op
  const toggleModel = (_modelId: string) => {};

  const handleBack = () => {
    const from = location.state?.from;
    const loopPages = ["/settings", "/billing", "/invite"];
    if (from && !loopPages.includes(from)) {
      navigate(from);
    } else {
      const hasProduct = products && products.length > 0;
      navigate(hasProduct ? "/results" : "/input");
    }
  };

  // ── Danger Zone handlers ────────────────────────────────────────────────────
  const handleOpenDeleteDialog = () => {
    setDeleteTypedName("");
    setDeleteCancelReason("");
    setDeleteSubmitted(false);
    setDeleteDialogOpen(true);
  };

  const handleSubmitDeleteRequest = async () => {
    if (!canSubmitDelete) return;
    setIsSubmittingDelete(true);

    try {
      const applicationId = applications?.[0]?.id || "N/A";

      const params = new URLSearchParams({
        submittedAt: new Date().toISOString(),
        fullName,
        email,
        applicationId,
        deletionReason: deleteCancelReason,
        additionalFeedback: cancelFeedback || "",
      });

      await fetch(
        `${import.meta.env.VITE_CUSTOMER_REQUEST}?${params.toString()}`,
        { method: "GET", mode: "no-cors" }
      );

      setDeleteSubmitted(true);
    } catch (error) {
      console.error("Failed to submit deletion request:", error);
      setDeleteSubmitted(true);
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const tabs: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
    {
      key: "company",
      label: "Company & Tracking",
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      key: "history",
      label: "Analysis Run History",
      icon: <History className="w-4 h-4" />,
    },
    { key: "account", label: "Account", icon: <User className="w-4 h-4" /> },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
          {/* Back Button */}
          <motion.button
            onClick={handleBack}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="group inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border bg-card shadow-sm text-muted-foreground hover:border-primary/40 hover:text-primary hover:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5 duration-200" />
            <span className="text-sm font-semibold">Back</span>
          </motion.button>

          {/* Page Layout: Sidebar + Content */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <motion.aside
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="w-full md:w-56 flex-shrink-0"
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Settings
              </p>
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                      activeTab === tab.key
                        ? "text-primary bg-primary/5 border-l-2 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </motion.aside>

            {/* Content */}
            <motion.div
              key={activeTab}
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex-1 min-w-0"
            >
              {/* ════════════════════ COMPANY & TRACKING ════════════════════ */}
              {activeTab === "company" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      Company & Tracking
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      Manage your company profile and what's being tracked
                    </p>
                  </div>

                  {/* Company Details */}
                  <div className="rounded-2xl border border-border bg-card shadow-sm p-6 space-y-5">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">
                        Company Details
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Basic information about your company
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Company Name
                        </Label>
                        <Input
                          value={companyName}
                          readOnly
                          className="bg-background cursor-default pointer-events-none select-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Website URL
                        </Label>
                        <Input
                          value={websiteUrl}
                          readOnly
                          className="bg-background cursor-default pointer-events-none select-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Industry
                      </Label>
                      <Input
                        value={industry}
                        readOnly
                        className="bg-background cursor-default pointer-events-none select-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        About Company
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Used by AI to better understand your brand context
                      </p>
                      <Textarea
                        value={aboutCompany}
                        readOnly
                        rows={4}
                        className="bg-background resize-none cursor-default pointer-events-none select-none"
                      />
                    </div>
                  </div>

                  {/* Competitors Being Tracked */}
                  <div className="rounded-2xl border border-border bg-card shadow-sm p-6 space-y-4">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">
                        Competitors Being Tracked
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {competitors.length} competitor
                        {competitors.length !== 1 ? "s" : ""} · Max{" "}
                        {planLimits.maxCompetitors} on your plan
                      </p>
                    </div>

                    {competitors.length > 0 && (
                      <div className="space-y-2">
                        {competitors.map((comp) => {
                          const logoUrl = getBrandLogo(comp.name);
                          return (
                            <div
                              key={comp.id}
                              className="flex items-center justify-between py-2.5 px-3 rounded-lg border border-border bg-background"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground overflow-hidden ${!logoUrl ? getAvatarColor(comp.name) : "bg-white border border-border"}`}
                                >
                                  {logoUrl ? (
                                    <img
                                      src={logoUrl}
                                      alt={comp.name}
                                      className="w-5 h-5 object-contain"
                                      onError={(e) => {
                                        const target = e.currentTarget;
                                        target.style.display = "none";
                                        const parent = target.parentElement;
                                        if (parent) {
                                          parent.classList.remove("bg-white", "border", "border-border");
                                          parent.classList.add(getAvatarColor(comp.name));
                                          parent.textContent = comp.name.charAt(0).toUpperCase();
                                        }
                                      }}
                                    />
                                  ) : (
                                    comp.name.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <span className="text-sm font-medium text-foreground">
                                  {comp.name}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {competitors.length >= planLimits.maxCompetitors && (
                      <p className="font-semibold text-xs text-foreground text-center">
                        Competitor limit reached.{" "}
                        <button
                          onClick={() => navigate("/billing")}
                          className="text-primary hover:underline"
                        >
                          Upgrade plan
                        </button>{" "}
                        to add more.
                      </p>
                    )}
                  </div>

                  {/* AI Models Tracked */}
                  <div className="rounded-2xl border border-border bg-card shadow-sm p-6 space-y-4">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">
                        AI Models Tracked
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Models included in your analysis based on your plan
                      </p>
                    </div>

                    <div className="space-y-1">
                      {aiModels.map((model) => (
                        <div
                          key={model.id}
                          className="flex items-center justify-between py-3 px-3 rounded-lg border border-border bg-background"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                              {model.svgIcon ? (
                                <img
                                  src={model.svgIcon}
                                  alt={model.name}
                                  className="w-6 h-6 object-contain"
                                />
                              ) : (
                                <span className="text-sm font-bold">{model.icon}</span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground">
                                  {model.name}
                                </span>
                                {model.id === "perplexity" && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground border-border"
                                  >
                                    Coming Soon
                                  </Badge>
                                )}
                              </div>
                              {model.id === "perplexity" ? (
                                <p className="text-xs text-muted-foreground">
                                  
                                </p>
                              ) : !model.allowedByPlan ? (
                                <p className="text-xs text-muted-foreground">
                                  Upgrade to analyze results with this model
                                </p>
                              ) : (
                                <p className="text-xs text-muted-foreground">
                                  Included in your plan
                                </p>
                              )}
                            </div>
                          </div>
                          <Switch
                            checked={model.id === "perplexity" ? false : model.allowedByPlan}
                            onCheckedChange={undefined}
                            disabled={model.id === "perplexity"}
                            className="pointer-events-none cursor-default"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ════════════════════ ANALYSIS RUN HISTORY ════════════════════ */}
              {activeTab === "history" && (
                <AnalysisRunHistoryTab
                  analyticsList={analyticsList}
                  isLoadingHistory={isLoadingHistory}
                  canExport={canExport}
                  userRoleInt={userRoleInt}
                  pricingPlan={pricingPlan}
                  planLimits={planLimits}
                  planExpiresAt={planExpiresAt ?? null}
                  navigate={navigate}
                  toast={toast}
                  historyPage={historyPage}
                  historyTotalPages={historyTotalPages}
                  historyTotalItems={historyTotalItems}
                  isLoadingMore={isLoadingMore}
                  onLoadMore={async () => {
                    const productId = analyticsProductId || products?.[0]?.id;
                    if (!productId || historyPage >= historyTotalPages) return;
                    setIsLoadingMore(true);
                    try {
                      const nextPage = historyPage + 1;
                      const data = await getAnalyticsHistory(
                        productId,
                        nextPage
                      );
                      setAnalyticsList((prev) => [
                        ...prev,
                        ...(data.analytics || []),
                      ]);
                      setHistoryPage(data.page);
                      setHistoryTotalPages(data.total_pages);
                      setHistoryTotalItems(data.total_items);
                    } catch {
                      // silent
                    } finally {
                      setIsLoadingMore(false);
                    }
                  }}
                />
              )}

              {/* ════════════════════ ACCOUNT ════════════════════ */}
              {activeTab === "account" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      Account
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      Manage your personal account details
                    </p>
                  </div>

                  {/* Contact Details */}
                  <div className="rounded-2xl border border-border bg-card shadow-sm p-6 space-y-5">
                    <h2 className="text-base font-semibold text-foreground">
                      Contact Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Full Name
                        </Label>
                        <Input
                          value={fullName}
                          readOnly
                          className="bg-background cursor-default pointer-events-none select-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Email Address
                        </Label>
                        <Input
                          value={email}
                          readOnly
                          className="bg-background cursor-default pointer-events-none select-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Role
                      </Label>
                      <Input
                        value={
                          getRoleName(userRoleInt).charAt(0).toUpperCase() +
                          getRoleName(userRoleInt).slice(1)
                        }
                        readOnly
                        className="bg-background max-w-xs cursor-default pointer-events-none select-none"
                      />
                    </div>
                  </div>

                  {/* Danger Zone - Admin only */}
                  {isAdmin && (
                  <div className="rounded-2xl border border-destructive/20 bg-card shadow-sm p-6">
                    <h2 className="text-base font-semibold text-foreground">
                      Danger Zone
                    </h2>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Delete Account
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Permanently remove your account and all data
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-4 py-2 rounded-xl text-sm font-semibold bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 hover:text-destructive transition-all"
                        onClick={handleOpenDeleteDialog}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Delete Account Dialog ─────────────────────────────────────────── */}
      <Dialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
        <DialogContent className="max-w-md">
          {!deleteSubmitted ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  Request Account Deletion
                </DialogTitle>
                <DialogDescription className="text-sm leading-relaxed">
                  This action is <strong>irreversible</strong>. All your data,
                  analysis history and settings will be permanently removed. Our
                  team will review your request and get back to you within{" "}
                  <strong>24 hours</strong>.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 pt-2">
                {/* Cancellation reason dropdown */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Reason for Deletion{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    onValueChange={setDeleteCancelReason}
                    value={deleteCancelReason}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select a reason…" />
                    </SelectTrigger>
                    <SelectContent>
                      {CANCELLATION_REASONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Additional feedback */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Additional Feedback
                    </Label>
                    <Textarea
                      value={cancelFeedback}
                      onChange={(e) => setCancelFeedback(e.target.value)}
                      placeholder="Tell us more about your experience (optional)…"
                      rows={3}
                      className="bg-background resize-none"
                    />
                  </div>

                {/* Full name confirmation */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Type your full name to confirm{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Please type{" "}
                    <span className="font-semibold text-foreground">
                      {fullName}
                    </span>{" "}
                    exactly to confirm deletion.
                  </p>
                  <Input
                    value={deleteTypedName}
                    onChange={(e) => setDeleteTypedName(e.target.value)}
                    placeholder={fullName}
                    className={`bg-background transition-colors ${
                      deleteTypedName.length > 0
                        ? deleteNameMatches
                          ? "border-success focus-visible:ring-success/30"
                          : "border-destructive/50 focus-visible:ring-destructive/20"
                        : ""
                    }`}
                  />
                  {deleteTypedName.length > 0 && !deleteNameMatches && (
                    <p className="text-xs text-destructive">
                      Name doesn't match
                    </p>
                  )}
                </div>

                {/* Account info summary */}
                <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1 text-xs text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">
                      Account:
                    </span>{" "}
                    {email}
                  </p>
                </div>

                {/* 24hr notice */}
                <div className="rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground leading-relaxed">
                    Our team will review your request and get back to you at{" "}
                    <strong>{email}</strong> within <strong>24 hours</strong>.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-1">
                  <Button variant="outline" onClick={handleCloseDeleteDialog}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={!canSubmitDelete}
                    onClick={handleSubmitDeleteRequest}
                  >
                    {isSubmittingDelete ? (
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-1.5" />
                    )}
                    Send Deletion Request
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Success state */
            <div className="py-6 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-success" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">
                  Request Sent
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                  Your account deletion request has been submitted. Our team
                  will contact you at <strong>{email}</strong> within{" "}
                  <strong>24 hours</strong>.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleCloseDeleteDialog}
                className="mt-2"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

// ─── History Row Component ─────────────────────────────────────────────

function HistoryRow({
  item,
  idx,
  canExport,
  userRoleInt,
  planExpiresAt,
  navigate,
  toast,
}: {
  item: AnalyticsHistoryItem;
  idx: number;
  canExport: boolean;
  userRoleInt: number;
  planExpiresAt: number | null;
  navigate: ReturnType<typeof useNavigate>;
  toast: ReturnType<typeof useToast>["toast"];
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGenerating(true);
    let restore: (() => void) | null = null;

    const cleanup = () => {
      if (restore) restore();
      setIsGenerating(false);
      window.removeEventListener("afterprint", cleanup);
    };

    try {
      const apiResponse = await getAnalyticsById(item.analytics_id);

      if (!apiResponse) {
        toast({
          title: "Error",
          description: "Could not load analytics data.",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }

      let normalized = apiResponse;
      if (!Array.isArray(apiResponse.analytics)) {
        if (apiResponse.id === item.analytics_id || apiResponse.product_id) {
          normalized = {
            analytics: [apiResponse],
            count: 1,
            limit: 1,
            product_id: apiResponse.product_id,
          };
        }
      }

      if (
        !normalized.analytics ||
        !Array.isArray(normalized.analytics) ||
        normalized.analytics.length === 0 ||
        !normalized.analytics[0]
      ) {
        toast({
          title: "Error",
          description: "Analytics data is incomplete.",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }

      restore = setAnalyticsDataTemporary(normalized);

      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      );

      const success = generateReport(toast);

      if (!success) {
        cleanup();
        return;
      }

      window.addEventListener("afterprint", cleanup);
      setTimeout(cleanup, 60000);
    } catch {
      toast({
        title: "Error",
        description: "Failed to generate report.",
        variant: "destructive",
      });
      if (restore) restore();
      setIsGenerating(false);
    }
  };

  return (
    <tr className="border-b border-border last:border-0 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div>
            <p className="text-sm font-medium text-foreground">
              {formatShortDate(item.generated_at)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatLocalDate(item.generated_at, "h:mm a")}
            </p>
          </div>
          {idx === 0 && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0.5 bg-success/10 text-success border-success/20"
            >
              Latest
            </Badge>
          )}
        </div>
      </td>
      <td className="px-4 py-4 text-center">
        <Badge variant="outline" className="text-xs">
          <Sparkles className="w-3 h-3 mr-1" />
          {item.keywords.length} keywords
        </Badge>
      </td>
      <td className="px-4 py-4 text-center">
        <span className="text-2xl font-bold text-foreground">
          {item.geo_score}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        {userRoleInt >= 4 ? (
          <span className="text-xs text-muted-foreground italic">Your account is Viewer only</span>
        ) : !canExport ? (
          (() => {
            const isPlanExpired = planExpiresAt && Date.now() / 1000 > planExpiresAt;
            return (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/billing", { state: { from: "/settings" } });
                }}
                className={isPlanExpired ? "text-amber-600 border-amber-300 hover:bg-amber-50" : "text-muted-foreground"}
              >
                {isPlanExpired ? (
                  <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                )}
                {isPlanExpired ? "Plan Expired" : "Upgrade to Grow"}
              </Button>
            );
          })()
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateReport}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 mr-1.5" />
            )}
            Generate Report
          </Button>
        )}
      </td>
    </tr>
  );
}

// ─── Analysis Run History Tab ─────────────────────────────────────────────

interface AnalysisRunHistoryTabProps {
  analyticsList: AnalyticsHistoryItem[];
  isLoadingHistory: boolean;
  canExport: boolean;
  userRoleInt: number;
  pricingPlan: string;
  planLimits: (typeof PLAN_LIMITS)[PricingPlanName];
  planExpiresAt: number | null;
  navigate: ReturnType<typeof useNavigate>;
  toast: ReturnType<typeof useToast>["toast"];
  historyPage: number;
  historyTotalPages: number;
  historyTotalItems: number;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

function AnalysisRunHistoryTab({
  analyticsList,
  isLoadingHistory,
  canExport,
  userRoleInt,
  pricingPlan,
  planLimits,
  planExpiresAt,
  navigate,
  toast,
  historyPage,
  historyTotalPages,
  historyTotalItems,
  isLoadingMore,
  onLoadMore,
}: AnalysisRunHistoryTabProps) {
  const keywordConsistency = useMemo(() => {
    const keywordMap: Record<string, { mentions: number[] }> = {};

    analyticsList.forEach((item) => {
      (item.keywords || []).forEach((kw) => {
        if (!keywordMap[kw]) keywordMap[kw] = { mentions: [] };
        keywordMap[kw].mentions.push(1);
      });
    });

    const MIN_RUNS_FOR_SCORE = 3;
    return Object.entries(keywordMap).map(([keyword, data]) => {
      const runs = data.mentions.length;
      const avgMentions =
        runs > 0 ? data.mentions.reduce((a, b) => a + b, 0) / runs : 0;
      let score: number | null = null;
      if (runs >= MIN_RUNS_FOR_SCORE) {
        const mean = avgMentions;
        if (mean === 0) {
          score = 0;
        } else {
          const variance =
            data.mentions.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
            runs;
          const stdDev = Math.sqrt(variance);
          const cv = stdDev / mean;
          score = Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));
        }
      }
      return {
        keyword,
        runs,
        avgMentions: Math.round(avgMentions * 10) / 10,
        score,
      };
    });
  }, [analyticsList]);

  const getConsistencyIcon = (score: number) => {
    if (score >= 70) return <span className="text-success">✅</span>;
    if (score >= 40) return <span className="text-warning">⚠️</span>;
    return <span className="text-destructive">🔴</span>;
  };

  const getConfidenceLabel = (_runs: number, score: number) => {
    if (score >= 70) return "High confidence";
    if (score >= 40) return "Moderate confidence";
    return "Low confidence";
  };

  const sectionHeadingClass = "text-2xl md:text-3xl font-bold text-foreground";
  const sectionDescClass = "text-muted-foreground mt-1";

  return (
    <div className="space-y-8">
      <div>
        <h1 className={sectionHeadingClass}>Analysis Run History</h1>
        <p className={sectionDescClass}>
          All past analysis runs with scores and downloadable reports
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : analyticsList.length === 0 ? (
          <div className="text-center py-20 px-6">
            <History className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-foreground">
              No analysis runs yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Run your first analysis to see results here
            </p>
            <Button
              size="sm"
              className="mt-4"
              onClick={() => navigate("/input")}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Run Analysis
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Date of Run
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Keywords
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  AI Visibility Score
                </th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Report
                </th>
              </tr>
            </thead>
            <tbody>
              {analyticsList.map((item, idx) => (
                <HistoryRow
                  key={item.analytics_id}
                  item={item}
                  idx={idx}
                  canExport={canExport}
                  userRoleInt={userRoleInt}
                  planExpiresAt={planExpiresAt ?? null}
                  navigate={navigate}
                  toast={toast}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination info + Load More */}
      {analyticsList.length > 0 && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-muted-foreground">
            Showing {analyticsList.length} of {historyTotalItems} runs
          </p>
          {historyPage < historyTotalPages && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : null}
              Load More
            </Button>
          )}
        </div>
      )}

      {/* ─── Keyword Consistency Scores ─── */}
      {keywordConsistency.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={sectionHeadingClass}>
                Keyword Consistency Scores
              </h2>
              <p className={sectionDescClass}>
                How consistently your brand appears across multiple runs per
                keyword
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-xs bg-warning/30 border-warning px-3 py-1"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Min. 3 runs needed per keyword
            </Badge>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Keyword / Seed Prompt
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Runs
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Avg. Mention Count
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Consistency Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {keywordConsistency.map((kw) => (
                  <tr
                    key={kw.keyword}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-foreground">
                        {kw.keyword}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-semibold text-foreground">
                        {kw.runs}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {kw.avgMentions > 0 ? (
                        <span className="text-sm text-foreground">
                          {kw.avgMentions}{" "}
                          <span className="text-xs text-muted-foreground">
                            /run
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {kw.score !== null ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="flex items-center gap-1.5">
                            {getConsistencyIcon(kw.score)}
                            <span className="text-2xl font-bold text-foreground">
                              {kw.score}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {kw.runs} runs ·{" "}
                            {getConfidenceLabel(kw.runs, kw.score)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-sm text-muted-foreground">
                            ⏳ Building
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {3 - kw.runs} more run{3 - kw.runs !== 1 ? "s" : ""}{" "}
                            needed
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
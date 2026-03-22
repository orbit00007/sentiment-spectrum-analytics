import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Zap,
  X,
  CreditCard,
  Receipt,
  Package,
  AlertTriangle,
  Download,
  Sparkles,
  Shield,
  TrendingUp,
  ChevronDown,
  Star,
  Trash2,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Layout } from "@/components/Layout";
import {
  getPlanExpiryInfo,
  formatShortDate,
  formatFullDateTime,
} from "@/lib/dateUtils";
import { PLAN_LIMITS, type PricingPlanName, getRoleName } from "@/lib/plans";
import { getChatHistory, type ChatUsage } from "@/apiHelpers";
import { getSecureAccessToken } from "@/lib/secureStorage";
import {
  getUsageStatus,
  getUsageProgress,
  formatResetsAt,
  USAGE_PROGRESS_COPY,
  type UsageStatus,
} from "@/components/chat/usageUtils";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

type PlanState = "trial" | "active" | "expiring";

const plans = [
  {
    name: "Launch",
    planKey: "launch" as PricingPlanName,
    monthlyPrice: 49,
    quarterlyPrice: 41,
    description: "Perfect for getting started",
    icon: "🚀",
    features: [
      { label: "Seed Prompts", value: "Up to 3" },
      { label: "Overall AI Prompts Tracked", value: "Up to 30" },
      { label: "LLMs Tracked", value: "ChatGPT" },
      { label: "Competitors Tracked", value: "3" },
      {
        label: "GEO Agent Intelligence",
        value: "10 conversations/day/user",
        sub: "Additional Conv @ $0.01/conv",
      },
      { label: "Seats", value: "1" },
      { label: "Prompt Run", value: "1 Run every 48 hours" },
      { label: "Support", value: "Email" },
      { label: "Analytics History", value: "Last 2 Runs" },
    ],
  },
  {
    name: "Grow",
    planKey: "grow" as PricingPlanName,
    monthlyPrice: 159,
    quarterlyPrice: 129,
    popular: true,
    description: "For growing teams & brands",
    icon: "⚡",
    features: [
      { label: "Seed Prompts", value: "Up to 6" },
      { label: "Overall AI Prompts Tracked", value: "Up to 60" },
      { label: "LLMs Tracked", value: "ChatGPT, Google AI Mode, Perplexity*" },
      { label: "Competitors Tracked", value: "5" },
      {
        label: "GEO Agent Intelligence",
        value: "20 conversations/day/user",
        sub: "Additional Conv @ $0.01/conv",
      },
      { label: "Seats", value: "3" },
      { label: "Prompt Run", value: "1 Run every 24 hours" },
      { label: "Report Export", value: "Yes" },
      { label: "Support", value: "Email, Slack" },
      { label: "Analytics History", value: "Last 5 Runs" },
    ],
  },
  {
    name: "Enterprise",
    planKey: "enterprise" as PricingPlanName,
    monthlyPrice: null,
    quarterlyPrice: null,
    description: "Custom everything, dedicated team",
    icon: "🏢",
    features: [
      { label: "Seed Prompts", value: "Custom" },
      { label: "Overall AI Prompts Tracked", value: "Custom" },
      { label: "LLMs Tracked", value: "ChatGPT, Google AI Mode, Perplexity*" },
      { label: "Competitors Tracked", value: "Custom" },
      { label: "GEO Agent Intelligence", value: "Custom" },
      { label: "Seats", value: "Custom" },
      { label: "Prompt Run", value: "Custom" },
      { label: "Report Export", value: "Yes" },
      { label: "Support", value: "Email, Slack" },
      { label: "Dedicated Account Manager", value: "Yes" },
      { label: "Analytics History", value: "Custom" },
      { label: "Dedicated GEO Specialist", value: "Yes" },
    ],
  },
];

const invoices = [
  {
    id: "#INV-0012",
    date: "Dec 16, 2025",
    plan: "Grow – Monthly",
    amount: "$159.00",
    status: "Paid",
  },
  {
    id: "#INV-0011",
    date: "Nov 16, 2025",
    plan: "Grow – Monthly",
    amount: "$159.00",
    status: "Paid",
  },
  {
    id: "#INV-0010",
    date: "Oct 16, 2025",
    plan: "Launch – Monthly",
    amount: "$49.00",
    status: "Paid",
  },
  {
    id: "#INV-0009",
    date: "Sep 10, 2025",
    plan: "Launch – Monthly",
    amount: "$49.00",
    status: "Overdue",
  },
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

// Blue gradient for healthy/warning/critical, red only when locked (matches trial banner style)
const CHAT_BAR_STYLE: Record<UsageStatus, { className: string; style?: React.CSSProperties }> = {
  healthy:  { className: "", style: { background: "linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)" } },
  warning:  { className: "", style: { background: "linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)" } },
  critical: { className: "", style: { background: "linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)" } },
  locked:   { className: "bg-destructive", style: undefined },
};

const Billing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    products,
    applications,
    pricingPlan,
    planExpiresAt,
    planInt,
    userRoleInt,
    collaborators,
  } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly">(
    "monthly"
  );
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState("");
  const [checkoutPrice, setCheckoutPrice] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("plans");

  // ── Live chat usage ────────────────────────────────────────────────────────
  const [chatUsage, setChatUsage] = useState<ChatUsage | null>(null);
  const [chatUsageLoading, setChatUsageLoading] = useState(true);
  const accessToken = getSecureAccessToken();

  useEffect(() => {
    const productId = products?.[0]?.id;
    if (!accessToken || !productId) {
      setChatUsageLoading(false);
      return;
    }
    getChatHistory(productId, accessToken, 1)
      .then(({ usage }) => {
        if (usage) setChatUsage(usage);
      })
      .catch(() => {/* silently ignore */})
      .finally(() => setChatUsageLoading(false));
  }, [accessToken, products]);

  const chatStatus = getUsageStatus(chatUsage);
  const chatProgress = getUsageProgress(chatUsage);
  const chatProgressCopy = USAGE_PROGRESS_COPY[chatStatus];
  const chatResetText = chatUsage?.resets_at ? formatResetsAt(chatUsage.resets_at) : null;
  const chatBarStyle = CHAT_BAR_STYLE[chatStatus];
  const chatAtLimit = chatStatus === "locked";

  // ── Cancel subscription state ──────────────────────────────────────────────
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelFeedback, setCancelFeedback] = useState("");
  const [cancelTypedName, setCancelTypedName] = useState("");
  const [isCancelSubmitting, setIsCancelSubmitting] = useState(false);
  const [cancelSubmitted, setCancelSubmitted] = useState(false);

  // Admin gate: god(0) or admin(1) only
  const isAdmin = userRoleInt <= 1;

  // User info for the cancel dialog
  const userFullName = user
    ? `${user.first_name} ${user.last_name}`.trim()
    : "";
  const userEmail = user?.email || "";

  const cancelNameMatches =
    cancelTypedName.trim().toLowerCase() === userFullName.trim().toLowerCase();
  const canSubmitCancel =
    cancelNameMatches && cancelReason.length > 0 && !isCancelSubmitting;

  const handleOpenCancel = () => {
    setCancelReason("");
    setCancelFeedback("");
    setCancelTypedName("");
    setCancelSubmitted(false);
    setCancelOpen(true);
  };

  const handleCloseCancel = () => {
    setCancelOpen(false);
  };

  const handleSubmitCancel = async () => {
    if (!canSubmitCancel) return;
    setIsCancelSubmitting(true);

    try {
      const applicationId = applications?.[0]?.id || "N/A";

      const params = new URLSearchParams({
        submittedAt: new Date().toISOString(),
        fullName: userFullName,
        email: userEmail,
        applicationId,
        currentPlan,
        cancelReason,
        cancelFeedback: cancelFeedback || "",
      });

      await fetch(
        `${import.meta.env.VITE_CUSTOMER_REQUEST}?${params.toString()}`,
        { method: "GET", mode: "no-cors" }
      );

      setCancelSubmitted(true);
    } catch (error) {
      console.error("Failed to submit cancellation:", error);
      setCancelSubmitted(true);
    } finally {
      setIsCancelSubmitting(false);
    }
  };

  const trialDurationDays = 7;

  // Compute plan expiry info from JWT epoch
  const expiryInfo = useMemo(() => {
    if (!planExpiresAt) return null;
    return getPlanExpiryInfo(planExpiresAt, trialDurationDays);
  }, [planExpiresAt, trialDurationDays]);

  // Dynamic plan state — only "free" is a trial; launch/grow/enterprise are proper plans
  // Free plan never becomes "expiring" — only paid plans do
  const planState: PlanState = useMemo(() => {
    if (!expiryInfo) return pricingPlan === "free" ? "trial" : "active";
    if (expiryInfo.isExpired && pricingPlan !== "free") return "expiring";
    if (pricingPlan === "free") return "trial";
    return "active";
  }, [expiryInfo, pricingPlan]);

  const currentPlan =
    pricingPlan === "free"
      ? "Free Trial"
      : plans.find((p) => p.name.toLowerCase() === pricingPlan)?.name ||
        pricingPlan.charAt(0).toUpperCase() + pricingPlan.slice(1);

  // Get plan limits for display
  const currentLimits =
    PLAN_LIMITS[pricingPlan as PricingPlanName] || PLAN_LIMITS.free;

  const handleBack = () => {
    const from = location.state?.from;
    const loopPages = ["/billing", "/invite"];
    if (from && !loopPages.includes(from)) {
      navigate(from);
    } else {
      const hasProduct = products && products.length > 0;
      navigate(hasProduct ? "/results" : "/input");
    }
  };

  const openCheckout = (planName: string, price: number | null) => {
    if (!price) return;
    setCheckoutPlan(planName);
    setCheckoutPrice(`$${price}.00`);
    setCheckoutOpen(true);
  };

  // ── Helper: open checkout for the user's current paid plan ────────────────
  const openRenewCheckout = () => {
    const currentPlanData = plans.find(
      (p) => p.name.toLowerCase() === pricingPlan
    );
    const price =
      billingCycle === "monthly"
        ? currentPlanData?.monthlyPrice
        : currentPlanData?.quarterlyPrice;
    if (currentPlanData && price) {
      openCheckout(currentPlanData.name, price);
    } else {
      // Enterprise or unrecognised plan — fall back to plans tab
      setActiveTab("plans");
    }
  };

  // ── Auto-open renew checkout when navigated here with { autoRenew: true } ─
  useEffect(() => {
    if (location.state?.autoRenew && pricingPlan && pricingPlan !== "free") {
      openRenewCheckout();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, pricingPlan]);

  const handlePay = () => {
    setCheckoutOpen(false);
    setSuccessOpen(true);
  };

  return (
    <Layout>
      {/* Subtle ambient background */}
      <div className="min-h-screen relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
          {/* ── Back Button ── */}
          <motion.button
            onClick={handleBack}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="group inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border bg-card shadow-sm text-muted-foreground hover:border-primary/40 hover:text-primary hover:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span className="text-sm font-semibold">Back</span>
          </motion.button>

          {/* ── Page Header ── */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Billing & Plans
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mt-2">
              Manage your subscription, usage, and payment details
            </p>
          </motion.div>

          {/* ── Trial Banner (Free plan, not yet expired) ── */}
          {planState === "trial" && expiryInfo && !expiryInfo.isExpired && (
            <motion.div
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="relative overflow-hidden rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              style={{
                background: "var(--gradient-hero-reverse)",
              }}
            >
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
              <div className="absolute -right-4 top-6 w-24 h-24 rounded-full bg-white/5" />

              <div className="relative flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">
                    Free trial active — {expiryInfo.daysRemaining} day
                    {expiryInfo.daysRemaining !== 1 ? "s" : ""} remaining
                  </p>
                  <p className="text-white/70 text-xs mt-0.5">
                    {expiryInfo.trialDaysUsed} of {expiryInfo.trialDurationDays}{" "}
                    days used · Expires {formatShortDate(expiryInfo.expiryDate)}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 w-40 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all"
                        style={{ width: `${expiryInfo.trialProgress}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/70 font-medium">
                      {expiryInfo.trialProgress}%
                    </span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                className="relative z-10 bg-white text-primary hover:bg-white/90 font-semibold shadow-sm border-0 flex-shrink-0 cursor-default pointer-events-none select-none"
                onClick={() => setActiveTab("plans")}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Upgrade Now
              </Button>
            </motion.div>
          )}

          {/* ── Trial Expired Banner (Free plan, expired) ── */}
          {planState === "trial" && expiryInfo?.isExpired && (
            <motion.div
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="relative overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-900 text-sm">
                    Your free trial is over
                  </p>
                  <p className="text-amber-700 text-xs mt-0.5">
                    Please choose a plan to continue accessing your dashboard and analytics.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold flex-shrink-0"
                onClick={() => setActiveTab("plans")}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Choose a Plan
              </Button>
            </motion.div>
          )}

          {/* ── Active Plan Banner (Launch, Grow, Enterprise) ── */}
          {planState === "active" && expiryInfo && (
            <motion.div
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="relative overflow-hidden rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              style={{
                background: "var(--gradient-hero-reverse)",
              }}
            >
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
              <div className="absolute -right-4 top-6 w-24 h-24 rounded-full bg-white/5" />

              <div className="relative flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">
                    {currentPlan} plan active — {expiryInfo.daysRemaining} day
                    {expiryInfo.daysRemaining !== 1 ? "s" : ""} remaining
                  </p>
                  <p className="text-white/70 text-xs mt-0.5">
                    Renews {formatShortDate(expiryInfo.expiryDate)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Expiring / Expired Banner (paid plans only) ── */}
          {planState === "expiring" && expiryInfo && (
            <motion.div
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="relative overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-900 text-sm">
                    {expiryInfo.isExpired
                      ? `Your ${currentPlan} plan has expired`
                      : `Your ${currentPlan} plan expires ${expiryInfo.relativeText}`}
                  </p>
                  <p className="text-amber-700 text-xs mt-0.5">
                    {expiryInfo.isExpired
                      ? `Expired on ${formatShortDate(
                          expiryInfo.expiryDate
                        )}. Renew to restore access.`
                      : `Expires on ${formatFullDateTime(
                          expiryInfo.expiryDate
                        )}. Renew now to avoid interruption.`}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-amber-300 text-amber-800 hover:bg-amber-100"
                onClick={openRenewCheckout}
              >
                Renew Plan
              </Button>
            </motion.div>
          )}

          {/* ── Tabs ── */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="bg-muted/80 border border-border h-11 p-1 mb-8 rounded-xl">
              <TabsTrigger
                value="plans"
                className="rounded-lg text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground"
              >
                Plans
              </TabsTrigger>
              <TabsTrigger
                value="billing"
                className="rounded-lg text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground"
              >
                Billing Details
              </TabsTrigger>
              <TabsTrigger
                value="invoices"
                className="rounded-lg text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground"
              >
                Invoices
              </TabsTrigger>
            </TabsList>

            {/* ──────── PLANS TAB ──────── */}
            <TabsContent value="plans" className="space-y-8">
              {/* Billing Toggle */}
              <motion.div
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex items-center justify-between flex-wrap gap-3"
              >
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Choose a Plan
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    All plans include a 7-day free trial
                  </p>
                </div>
                <div className="flex items-center bg-muted border border-border rounded-full p-1 gap-0.5">
                  <button
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      billingCycle === "monthly"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle("quarterly")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      billingCycle === "quarterly"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Quarterly
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      −16%
                    </span>
                  </button>
                </div>
              </motion.div>

              {/* Plan Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                {plans.map((plan, i) => {
                  const price =
                    billingCycle === "monthly"
                      ? plan.monthlyPrice
                      : plan.quarterlyPrice;
                  const isCurrent =
                    plan.planKey === pricingPlan;
                  const isCurrentExpired = isCurrent && (planState === "expiring" || (planState === "trial" && expiryInfo?.isExpired));
                  
                  // Plan hierarchy for upgrade/downgrade labels
                  const planHierarchy: Record<string, number> = { free: 0, launch: 1, grow: 2, enterprise: 3, agency: 4 };
                  const currentPlanLevel = planHierarchy[pricingPlan] ?? 0;
                  const thisPlanLevel = planHierarchy[plan.planKey] ?? 0;
                  const isUpgrade = thisPlanLevel > currentPlanLevel;
                  const getCtaLabel = () => {
                    if (isCurrent && isCurrentExpired) return "Renew Plan";
                    if (isCurrent) return "✓ Current Plan";
                    if (isUpgrade) return `Upgrade to ${plan.name}`;
                    return `Downgrade to ${plan.name}`;
                  };
                  const isCurrentActive = isCurrent && planState === "active";
                  const isPopular = !!plan.popular && !isCurrent;

                  return (
                    <motion.div
                      key={plan.name}
                      custom={i + 3}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      whileHover={{
                        scale: 1.02,
                        boxShadow: isPopular
                          ? "0 0 0 3px rgba(37,99,235,0.12), 0 20px 48px rgba(37,99,235,0.22)"
                          : "0 12px 36px rgba(0,0,0,0.14)",
                        transition: { duration: 0.18, ease: "easeOut" },
                      }}
                      className={`relative flex flex-col rounded-2xl bg-card cursor-pointer border-2 ${
                        isPopular
                          ? "border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.08),0_8px_24px_hsl(var(--primary)/0.12)]"
                          : isCurrentExpired
                          ? "border-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.15)]"
                          : isCurrentActive
                          ? "border-success"
                          : "border-border shadow-card"
                      }`}
                    >
                      {isPopular && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                          <span
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold text-amber-950"
                            style={{
                              background:
                                "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                              boxShadow: "0 2px 8px rgba(245,158,11,0.4)",
                            }}
                          >
                            <Star className="w-2.5 h-2.5 fill-amber-950" />
                            Most Popular
                          </span>
                        </div>
                      )}
                      {isCurrentExpired && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-sm">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Plan Expired
                          </span>
                        </div>
                      )}
                      {isCurrentActive && !isPopular && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-sm">
                            <Check className="w-2.5 h-2.5" />
                            Current Plan
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col flex-1 p-6 pt-8">
                        {/* Plan header */}
                        <div className="flex items-center gap-2.5 mb-4">
                          <span className="text-xl">{plan.icon}</span>
                          <div>
                            <p
                              className={`text-xs font-semibold uppercase tracking-widest ${
                                isPopular
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {plan.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {plan.description}
                            </p>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="mb-1">
                          {price ? (
                            <div className="flex items-end gap-1">
                              <span className="text-4xl font-bold text-foreground tracking-tight">
                                ${price}
                              </span>
                              <span className="text-sm text-muted-foreground mb-1.5 font-medium">
                                / mo
                              </span>
                            </div>
                          ) : (
                            <div className="text-4xl font-bold text-foreground tracking-tight">
                              Custom
                            </div>
                          )}
                        </div>

                        <p
                          className={`text-xs font-medium mb-5 ${
                            price ? "text-success" : "text-muted-foreground"
                          }`}
                        >
                          {price
                            ? billingCycle === "quarterly"
                              ? `Save $${
                                  (plan.monthlyPrice! - plan.quarterlyPrice!) *
                                  12
                                }/yr`
                              : `$${plan.quarterlyPrice}/mo if billed quarterly`
                            : "Tailored to your team's needs"}
                        </p>

                        {/* CTA */}
                        {isCurrent ? (
                          <button
                            disabled
                            className="w-full py-2.5 rounded-xl text-sm font-semibold border border-emerald-200 bg-emerald-50 text-emerald-600 cursor-default mb-5"
                          >
                            ✓ Current Plan
                          </button>
                        ) : isPopular ? (
                          <button
                            onClick={() => openCheckout(plan.name, price!)}
                            className="w-full py-2.5 rounded-xl text-sm font-bold text-amber-950 mb-5 transition-all duration-200 hover:brightness-105 active:scale-[0.98]"
                            style={{
                              background:
                                "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                              boxShadow: "0 3px 10px rgba(245,158,11,0.35)",
                            }}
                          >
                            Get Started →
                          </button>
                        ) : price ? (
                          <button
                            onClick={() => openCheckout(plan.name, price)}
                            className="w-full py-2.5 rounded-xl text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 hover:border-gray-300 transition-all duration-200 mb-5"
                          >
                            Get Started
                          </button>
                        ) : (
                          <a href="mailto:support@georankers.co" className="w-full py-2.5 rounded-xl text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 transition-colors mb-5 block text-center">
                            Contact Sales →
                          </a>
                        )}

                        {/* Divider */}
                        <div className="border-t border-gray-100 mb-4" />

                        {/* Features */}
                        <ul className="space-y-2 flex-1">
                          {plan.features.map((f: any) => (
                            <li
                              key={f.label}
                              className={`flex items-start gap-2.5 text-sm ${
                                f.disabled ? "opacity-50" : ""
                              }`}
                            >
                              <span
                                className={`flex-shrink-0 w-4 h-4 mt-0.5 rounded-full flex items-center justify-center ${
                                  f.disabled
                                    ? "bg-muted"
                                    : isPopular
                                    ? "bg-primary/10"
                                    : "bg-success/10"
                                }`}
                              >
                                {f.disabled ? (
                                  <X className="w-2.5 h-2.5 text-muted-foreground" />
                                ) : (
                                  <Check
                                    className={`w-2.5 h-2.5 ${
                                      isPopular
                                        ? "text-primary"
                                        : "text-success"
                                    }`}
                                  />
                                )}
                              </span>
                              <div>
                                <span className="text-muted-foreground">
                                  <span className="font-medium text-foreground/80">
                                    {f.label}:
                                  </span>{" "}
                                  {f.value}
                                </span>
                                {f.sub && (
                                  <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                                    {f.sub}
                                  </p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Trust strip */}
              <motion.div
                custom={7}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-6 py-4 border-t border-border flex-wrap"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5" />
                  SSL encrypted
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="w-3.5 h-3.5 text-success" />
                  Cancel anytime
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="w-3.5 h-3.5" />
                  No setup fees
                </div>
                <p className="text-xs text-muted-foreground ml-auto">
                  * Coming soon - Perplexity, Google Analytics, Google Search
                  Console
                </p>
              </motion.div>
              <p className="text-s text-foreground text-center pb-5">
                Have any questions? Reach out to us at{" "}
                <a
                  href="mailto:support@georankers.co"
                  className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
                >
                  support@georankers.co
                </a>
              </p>
            </TabsContent>

            {/* ──────── BILLING DETAILS TAB ──────── */}
            <TabsContent value="billing" className="space-y-5">
              {/* Current Plan */}
              <motion.div
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Current Plan
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Your active subscription
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      expiryInfo?.isExpired
                        ? "bg-destructive/10 text-destructive border border-destructive/20"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        expiryInfo?.isExpired
                          ? "bg-destructive"
                          : "bg-emerald-500 animate-pulse"
                      }`}
                    />
                    {expiryInfo?.isExpired ? "Expired" : "Active"}
                  </span>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      {
                        label: "Plan",
                        value: currentPlan,
                        highlight: true as boolean,
                      },
                      {
                        label: "Analytics Cooldown",
                        value: `${currentLimits.analyticsCooldownHrs}h`,
                      },
                      {
                        label: "Plan Expires",
                        value: expiryInfo
                          ? formatShortDate(expiryInfo.expiryDate)
                          : "—",
                      },
                      {
                        label: "Days Remaining",
                        value: expiryInfo
                          ? `${expiryInfo.daysRemaining} day${
                              expiryInfo.daysRemaining !== 1 ? "s" : ""
                            }`
                          : "—",
                      },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                          {item.label}
                        </p>
                        <p
                          className={`text-sm font-semibold ${
                            item.highlight ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Usage Meters */}
                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                      Usage This Cycle
                    </p>

                    {/* ── Conversations / Day — live from chat API ── */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-s">
                        <span
                          className={`font-bold ${
                            chatAtLimit
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }`}
                        >
                          Conversations / Day
                        </span>
                        {chatUsageLoading ? (
                          <span className="h-4 w-12 rounded bg-muted animate-pulse inline-block" />
                        ) : chatUsage ? (
                          <span
                            className={`font-bold tabular-nums ${
                              chatAtLimit ? "text-destructive" : "text-foreground"
                            }`}
                          >
                            {chatUsage.used}
                            <span
                              className={
                                chatAtLimit
                                  ? "text-destructive/70"
                                  : "text-muted-foreground"
                              }
                            >
                              {" "}
                              / {chatUsage.limit}
                            </span>
                          </span>
                        ) : (
                          <span className="font-bold text-foreground tabular-nums">
                            0
                            <span className="text-muted-foreground">
                              {" "}
                              / {currentLimits.maxConversationsPerDay}
                            </span>
                          </span>
                        )}
                      </div>
                      {chatUsageLoading ? (
                        <div className="h-1.5 w-full rounded-full bg-muted animate-pulse" />
                      ) : (
                        <div
                          className="h-1.5 w-full bg-muted rounded-full overflow-hidden"
                          role="progressbar"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={Math.round(chatProgress)}
                          aria-label="Conversations used today"
                        >
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${chatBarStyle.className}`}
                            style={{ width: `${chatProgress}%`, ...chatBarStyle.style }}
                          />
                        </div>
                      )}
                      {!chatUsageLoading && chatUsage && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground">
                            {chatProgressCopy.detail}
                          </span>
                          {chatResetText && (
                            <span className="text-xs text-muted-foreground/70 whitespace-nowrap">
                              Resets {chatResetText}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ── Team Seats — static from collaborators ── */}
                    {(() => {
                      const seatsUsed =
                        collaborators && collaborators.length > 0
                          ? collaborators.length
                          : 1;
                      const max = currentLimits.maxUsers;
                      const pct =
                        max > 0
                          ? Math.min((seatsUsed / max) * 100, 100)
                          : 0;
                      const atLimit = seatsUsed >= max;
                      return (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-s">
                            <span
                              className={`font-bold ${
                                atLimit
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                              }`}
                            >
                              Team Seats
                            </span>
                            <span
                              className={`font-bold ${
                                atLimit ? "text-destructive" : "text-foreground"
                              }`}
                            >
                              {seatsUsed}
                              <span
                                className={
                                  atLimit
                                    ? "text-destructive/70"
                                    : "text-muted-foreground"
                                }
                              >
                                {" "}
                                / {max}
                              </span>
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                atLimit ? "bg-destructive" : "bg-amber-500"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setActiveTab("plans")}
                      className="px-4 py-2 rounded-xl text-sm font-semibold border border-border bg-card text-foreground hover:bg-muted transition-all"
                    >
                      ⬆ Change Plan
                    </button>
                    {/* ── Cancel Subscription — admin/god only ── */}
                    {isAdmin ? (
                      <button
                        onClick={handleOpenCancel}
                        className="px-4 py-2 rounded-xl text-sm font-semibold bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 transition-all"
                      >
                        Cancel Subscription
                      </button>
                    ) : (
                      <button
                        disabled
                        title={`Only admins can cancel the subscription. Your role: ${getRoleName(
                          userRoleInt
                        )}`}
                        className="px-4 py-2 rounded-xl text-sm font-semibold bg-muted border border-border text-muted-foreground cursor-not-allowed opacity-50"
                      >
                        Cancel Subscription
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-border flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Payment Method
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Your saved card
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted border border-border">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{
                          background:
                            "linear-gradient(135deg, #1a1f71 0%, #1a73e8 100%)",
                          color: "white",
                          letterSpacing: "0.05em",
                        }}
                      >
                        VISA
                      </div>
                      <div>
                        <p className="text-sm font-mono tracking-widest text-foreground">
                          •••• •••• •••• 4242
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Expires 08 / 27
                        </p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted transition-colors">
                      Update
                    </button>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* ──────── INVOICES TAB ──────── */}
            <TabsContent value="invoices">
              <motion.div
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-border flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Invoice History
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {invoices.length} invoices
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {invoices.map((inv, i) => (
                    <motion.div
                      key={inv.id}
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                          <Receipt className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {inv.plan}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                            {inv.id} · {inv.date}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <p className="text-sm font-bold text-foreground">
                          {inv.amount}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            inv.status === "Paid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              inv.status === "Paid"
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                          />
                          {inv.status}
                        </span>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-all opacity-0 group-hover:opacity-100">
                          <Download className="w-3 h-3" />
                          PDF
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Checkout Modal ── */}
        <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
          <DialogContent className="max-w-md rounded-2xl border-gray-200 p-0 overflow-hidden gap-0">
            <div
              className="px-6 py-5 border-b border-gray-100"
              style={{
                background:
                  "linear-gradient(135deg, rgba(59,130,246,0.04) 0%, transparent 100%)",
              }}
            >
              <DialogTitle className="text-base font-bold text-gray-900">
                Complete Your Purchase
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Upgrading to{" "}
                <strong className="text-gray-700">{checkoutPlan}</strong> plan
              </DialogDescription>
            </div>

            <div className="p-6 space-y-5">
              {/* Order summary */}
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{checkoutPlan} Plan</span>
                  <span className="font-semibold text-gray-800">
                    {checkoutPrice}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Billing cycle</span>
                  <span className="capitalize text-gray-700">
                    {billingCycle}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-600 text-xs">
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Trial credit applied
                  </span>
                  <span>−$0.00</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200 mt-1">
                  <span className="text-gray-900">Total due today</span>
                  <span className="text-gray-900">{checkoutPrice}</span>
                </div>
              </div>

              {/* Card fields */}
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Cardholder Name
                  </Label>
                  <Input
                    placeholder="Jane Smith"
                    className="mt-1.5 rounded-xl border-gray-200 focus:border-blue-300 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Card Number
                  </Label>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    className="mt-1.5 rounded-xl border-gray-200 focus:border-blue-300 focus:ring-blue-100 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Expiry
                    </Label>
                    <Input
                      placeholder="MM / YY"
                      className="mt-1.5 rounded-xl border-gray-200 font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      CVV
                    </Label>
                    <Input
                      placeholder="•••"
                      className="mt-1.5 rounded-xl border-gray-200 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 py-1">
                  <Shield className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-[11px] text-gray-400">
                    Secured with 256-bit SSL encryption. We never store your
                    card details.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCheckoutOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePay}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
                >
                  Pay {checkoutPrice}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Success Modal ── */}
        <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl border-gray-200 p-0 overflow-hidden text-center gap-0">
            <div
              className="px-6 pt-10 pb-6 flex flex-col items-center gap-3"
              style={{
                background:
                  "linear-gradient(180deg, rgba(16,185,129,0.05) 0%, transparent 60%)",
              }}
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-3xl mb-1">
                🎉
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                You're all set!
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Your <strong className="text-gray-700">{checkoutPlan}</strong>{" "}
                plan is active. A confirmation has been sent to your email.
              </DialogDescription>
            </div>

            <div className="px-6 pb-6 space-y-4">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3">
                  Plan Activated
                </p>
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-[11px] text-gray-400">Plan</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">
                      {checkoutPlan}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">Next Billing</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">
                      Jan 16, 2026
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSuccessOpen(false);
                  handleBack();
                }}
                className="w-full py-3 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
              >
                Go to Dashboard →
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Cancel Subscription Modal ── */}
        <Dialog open={cancelOpen} onOpenChange={handleCloseCancel}>
          <DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto">
            {!cancelSubmitted ? (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    Request Subscription Cancellation
                  </DialogTitle>
                  <DialogDescription className="text-sm leading-relaxed">
                    This action is <strong>irreversible</strong>. All your
                    subscription benefits will be removed. Our team will review
                    your request and get back to you within{" "}
                    <strong>24 hours</strong>.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 pt-2 overflow-y-auto flex-1 pr-1">
                  {/* Reason dropdown */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Reason for cancellation{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={setCancelReason}
                      value={cancelReason}
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
                        {userFullName}
                      </span>{" "}
                      exactly to confirm cancellation.
                    </p>
                    <Input
                      value={cancelTypedName}
                      onChange={(e) => setCancelTypedName(e.target.value)}
                      placeholder={userFullName}
                      className={`bg-background transition-colors ${
                        cancelTypedName.length > 0
                          ? cancelNameMatches
                            ? "border-success focus-visible:ring-success/30"
                            : "border-destructive/50 focus-visible:ring-destructive/20"
                          : ""
                      }`}
                    />
                    {cancelTypedName.length > 0 && !cancelNameMatches && (
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
                      {userEmail}
                    </p>
                  </div>

                  {/* 24hr notice */}
                  <div className="rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground leading-relaxed">
                      Our team will review your request and get back to you at{" "}
                      <strong>{userEmail}</strong> within{" "}
                      <strong>24 hours</strong>.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-1">
                    <Button variant="outline" onClick={handleCloseCancel}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={!canSubmitCancel}
                      onClick={handleSubmitCancel}
                      className="flex items-center gap-1.5"
                    >
                      {isCancelSubmitting ? (
                        <Loader2 className="w-4 h-4 shrink-2 mr-1.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 shrink-2 mr-1.5" />
                      )}
                      <span className="hidden sm:inline font-bold">
                        Send Cancellation Request
                      </span>
                      <span className="flex sm:hidden flex-col text-left leading-tight">
                        <span className="text-s font-bold">
                          Send Cancellation
                        </span>
                        <span className="text-s font-bold text-center">
                          Request
                        </span>
                      </span>
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
                    Your cancellation request has been submitted. Our team will
                    contact you at <strong>{userEmail}</strong> within{" "}
                    <strong>24 hours</strong>.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleCloseCancel}
                  className="mt-2"
                >
                  Close
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Billing;
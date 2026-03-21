import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowRight,
  Check,
  Search,
  Globe,
  Briefcase,
  Users,
  Tag,
  Rocket,
  Plus,
  RotateCcw,
  Zap,
  Cpu,
  ShieldCheck,
  Network,
} from "lucide-react";
import {
  fetchProductsWithKeywords,
  generateWithKeywords,
  getOnboardingSuggestions,
  getProductAnalytics,
} from "@/apiHelpers";
import { useAnalysisState } from "@/hooks/useAnalysisState";
import {
  getSecureAccessToken,
  getSecureKeywords,
  getSecureKeywordCount,
  setSecureProductId,
  setSecureKeywords,
  setSecureKeywordCount,
} from "@/lib/secureStorage";
import { cn } from "@/lib/utils";
import { formatLogoUrl } from "@/results/data/analyticsData";

interface OnboardingCompetitor {
  name: string;
  website: string;
  reason?: string;
}

const normalizeDomain = (input: string) => {
  let domain = input.trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//i, "");
  domain = domain.replace(/^www\./i, "");
  domain = domain.replace(/\/+$/, "");
  return `https://${domain}/`;
};

const isValidKeyword = (keyword: string) => {
  if (!keyword) return false;
  return !/^\{\{keyword\d+\}\}$/.test(keyword.trim());
};

const getDisplayDomain = (url: string) => {
  if (!url) return "";
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

const getBrandNameFromWebsite = (website: string) => {
  try {
    const hostname = new URL(normalizeDomain(website)).hostname;
    const root = hostname.replace(/^www\./, "").split(".")[0] || "";
    if (!root) return "";
    return root.charAt(0).toUpperCase() + root.slice(1);
  } catch {
    return "";
  }
};

const isSameCompetitor = (a: OnboardingCompetitor, b: OnboardingCompetitor) => {
  if (a.website && b.website) {
    return normalizeDomain(a.website) === normalizeDomain(b.website);
  }
  return a.name.toLowerCase().trim() === b.name.toLowerCase().trim();
};

const isSelfCompetitor = (website: string, competitorWebsite: string) => {
  if (!website || !competitorWebsite) return false;
  try {
    return normalizeDomain(website) === normalizeDomain(competitorWebsite);
  } catch {
    return false;
  }
};

const getCompetitorLogoUrl = (website: string) => {
  if (!website) return "";
  return formatLogoUrl(website);
};

/** Same domain check as inside checkDNS; does not fetch onboarding suggestions. */
const getWebsiteFormatValidity = (url: string): boolean => {
  if (!url.trim()) return false;
  try {
    const normalized = normalizeDomain(url);
    const domainOnly = normalized.replace(/^https:\/\//, "").replace(/\/$/, "");
    const domainRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domainOnly);
  } catch {
    return false;
  }
};

const DEFAULT_MAX_COMPETITORS_ALLOWED = 3;
const DEFAULT_MAX_KEYWORDS_ALLOWED = 3;

const normalizeCompetitorCap = (value?: number) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_MAX_COMPETITORS_ALLOWED;
  }
  return Math.max(1, Math.floor(value));
};

const normalizeKeywordCap = (value?: number) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_MAX_KEYWORDS_ALLOWED;
  }
  return Math.max(1, Math.floor(value));
};

const saveKeywordsOnce = (data: any) => {
  const existingKeywords = getSecureKeywords();
  const existingCount = getSecureKeywordCount();
  if (existingKeywords.length > 0 && existingCount !== "0") {
    return;
  }

  const rawKeywords = Array.isArray(data?.search_keywords)
    ? data.search_keywords
    : [];
  const validKeywords = rawKeywords
    .filter((kw: any) => isValidKeyword(kw?.keyword))
    .map((kw: any) => ({
      id: kw.id,
      keyword: kw.keyword,
    }));

  setSecureKeywords(validKeywords);
  setSecureKeywordCount(validKeywords.length.toString());
};

export default function InputPage() {
  const [brand, setBrand] = useState("");
  const [brandName, setBrandName] = useState("");
  const [dnsStatus, setDnsStatus] = useState<
    "valid" | "invalid" | "checking" | null
  >(null);

  const [brandDescription, setBrandDescription] = useState("");
  const [isLoadingDescription, setIsLoadingDescription] = useState(false);
  const [suggestedCompetitors, setSuggestedCompetitors] = useState<
    OnboardingCompetitor[]
  >([]);
  const [selectedCompetitors, setSelectedCompetitors] = useState<
    OnboardingCompetitor[]
  >([]);
  const [maxCompetitorsAllowed, setMaxCompetitorsAllowed] = useState(
    DEFAULT_MAX_COMPETITORS_ALLOWED,
  );
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [maxKeywordsAllowed, setMaxKeywordsAllowed] = useState(
    DEFAULT_MAX_KEYWORDS_ALLOWED,
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeAgentIndex, setActiveAgentIndex] = useState(0);

  const AGENTS = [
    {
      name: "Web Crawler",
      status: "Scanning digital footprint...",
      icon: Globe,
      color: "text-blue-500",
    },
    {
      name: "OpenAI",
      status: "Synthesizing brand identity...",
      icon: Zap,
      color: "text-emerald-500",
    },
    {
      name: "Claude",
      status: "Analyzing competitive landscape...",
      icon: Network,
      color: "text-purple-500",
    },
    {
      name: "Gemini",
      status: "Processing search intent...",
      icon: Sparkles,
      color: "text-orange-500",
    },
    {
      name: "Deep Research",
      status: "Generating final report...",
      icon: ShieldCheck,
      color: "text-indigo-500",
    },
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setActiveAgentIndex((prev) => (prev < AGENTS.length - 1 ? prev + 1 : prev));
      }, 2000);
    } else {
      setActiveAgentIndex(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing, AGENTS.length]);

  const [customKeyword, setCustomKeyword] = useState("");
  const [customCompName, setCustomCompName] = useState("");
  const [customCompWebsite, setCustomCompWebsite] = useState("");
  const [isAddingCustomComp, setIsAddingCustomComp] = useState(false);
  const [isAddingCustomKeyword, setIsAddingCustomKeyword] = useState(false);
  const [hasShownKeywordSuggestion, setHasShownKeywordSuggestion] = useState(false);
  const [websiteInput, setWebsiteInput] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"change-website" | "reset">("reset");
  const [pendingWebsite, setPendingWebsite] = useState("");
  const dnsCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionsRequestIdRef = useRef(0);
  const latestWebsiteRef = useRef("");
  const isBrandNameAutoRef = useRef(true);
  const currentProductIdRef = useRef<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isNewAnalysis, setIsNewAnalysis] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [isWebsiteDisabled, setIsWebsiteDisabled] = useState(false);

  const { user, applicationId, userRoleInt } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { startAnalysis } = useAnalysisState();
  const requiredCompetitorsForKeywords = Math.min(3, maxCompetitorsAllowed);
  const requiredCompetitorsToContinue = Math.min(1, maxCompetitorsAllowed);
  const hasOnboardingProgress =
    Boolean(brandDescription) ||
    selectedCompetitors.length > 0 ||
    selectedKeywords.length > 0 ||
    suggestedCompetitors.length > 0 ||
    suggestedKeywords.length > 0;

  useEffect(() => {
    return () => {
      if (dnsCheckTimeoutRef.current) {
        clearTimeout(dnsCheckTimeoutRef.current);
      }
    };
  }, []);

  // ── Viewer role guard — redirect away from input page ──────────────────────
  useEffect(() => {
    if (userRoleInt >= 4) {
      navigate("/results", { replace: true });
    }
  }, [userRoleInt, navigate]);

  useEffect(() => {
    if (!user) navigate("/login");

    const state = location.state as any;
    if (state?.prefillWebsite) {
      setBrand(state.prefillWebsite);
      setWebsiteInput(state.prefillWebsite);
      latestWebsiteRef.current = state.prefillWebsite;
      // When productId is present, handlePrePopulateData → handleGenerateBrandDescription
      // loads onboarding suggestions. Skip checkDNS here to avoid a duplicate API call.
      if (state?.productId) {
        if (dnsCheckTimeoutRef.current) {
          clearTimeout(dnsCheckTimeoutRef.current);
        }
        setDnsStatus(
          getWebsiteFormatValidity(state.prefillWebsite) ? "valid" : "invalid",
        );
      } else {
        checkDNS(state.prefillWebsite);
      }
    }
    if (state?.prefillName) {
      setBrandNameFromUser(state.prefillName);
    }
    if (state?.isNewAnalysis) {
      setIsNewAnalysis(true);
    }
    if (state?.productId) {
      setProductId(state.productId);
      handlePrePopulateData(state.productId, state.prefillWebsite);
    }
    if (state?.disableWebsiteEdit) {
      setIsWebsiteDisabled(true);
    }
  }, [user, navigate, location.state]);

  useEffect(() => {
    if (!brand) {
      setWebsiteInput("");
    }
  }, [brand]);

  useEffect(() => {
    currentProductIdRef.current = productId;
  }, [productId]);

  const setBrandNameFromUser = (value: string) => {
    isBrandNameAutoRef.current = false;
    setBrandName(value);
  };

  const setBrandNameFromSystem = (value?: string) => {
    if (!value) return;
    if (!isBrandNameAutoRef.current) return;
    setBrandName(value);
  };

  const handlePrePopulateData = async (pid: string, website?: string) => {
    setIsLoading(true);
    const prefillWebsiteNormalized = website ? normalizeDomain(website) : "";
    try {
      const accessToken = getSecureAccessToken();
      const res = await getProductAnalytics(pid, accessToken);

      if (currentProductIdRef.current !== pid) {
        return;
      }
      if (
        prefillWebsiteNormalized &&
        latestWebsiteRef.current &&
        normalizeDomain(latestWebsiteRef.current) !== prefillWebsiteNormalized
      ) {
        return;
      }

      if (res?.analytics && Array.isArray(res.analytics) && res.analytics.length > 0) {
        const mostRecent = res.analytics[0];
        const analytics = mostRecent?.analytics;

        if (analytics) {
          if (analytics.search_keywords) {
            const keywordsObj = analytics.search_keywords;
            const keywords = Object.values(keywordsObj)
              .map((kw: any) => kw?.name)
              .filter((kw: any) => typeof kw === "string" && kw.trim().length > 0);

            setSuggestedKeywords((prev) => {
              const combined = [...keywords, ...prev];
              return Array.from(new Set(combined));
            });

            setSelectedKeywords((prev) => {
              const combined = [...prev, ...keywords];
              return Array.from(new Set(combined)).slice(0, maxKeywordsAllowed);
            });
          }

          if (Array.isArray(analytics.brands)) {
            const competitors = analytics.brands
              .filter(
                (b: any) =>
                  typeof b?.brand === "string" &&
                  b.brand.toLowerCase() !==
                    String(analytics.brand_name || "").toLowerCase(),
              )
              .map((b: any) => ({
                name: b.brand,
                website: analytics.brand_websites?.[b.brand] || "",
              }));

            setSuggestedCompetitors((prev) => {
              const newCompetitors = competitors.filter(
                (nc: OnboardingCompetitor) =>
                  !prev.some((pc) => isSameCompetitor(nc, pc)),
              );
              return [...newCompetitors, ...prev];
            });

            setSelectedCompetitors((prev) => {
              const merged = [...prev];
              competitors.forEach((nc: OnboardingCompetitor) => {
                if (
                  !merged.some((pc) => isSameCompetitor(nc, pc)) &&
                  merged.length < maxCompetitorsAllowed
                ) {
                  merged.push(nc);
                }
              });
              return merged;
            });
          }

          setBrandNameFromSystem(analytics.brand_name);

          if (analytics.executive_summary?.conclusion && !brandDescription) {
            setBrandDescription(analytics.executive_summary.conclusion);
          }
        }
      }

      if (website) {
        await handleGenerateBrandDescription(website, pid);
      }
    } catch (error) {
      console.error("Failed to pre-populate data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkDNS = async (url: string) => {
    if (dnsCheckTimeoutRef.current) {
      clearTimeout(dnsCheckTimeoutRef.current);
    }

    if (!url.trim()) {
      setDnsStatus(null);
      return;
    }

    const currentInput = url;
    setDnsStatus("checking");
    dnsCheckTimeoutRef.current = setTimeout(() => {
      if (currentInput !== latestWebsiteRef.current) {
        return;
      }

      try {
        const isValid = getWebsiteFormatValidity(currentInput);
        setDnsStatus(isValid ? "valid" : "invalid");

        if (isValid) {
          handleGenerateBrandDescription(currentInput);
        }
      } catch {
        setDnsStatus("invalid");
      }
    }, 500);
  };

  const resetOnboardingForWebsiteChange = () => {
    setBrandDescription("");
    setSuggestedCompetitors([]);
    setSelectedCompetitors([]);
    setSuggestedKeywords([]);
    setSelectedKeywords([]);
    setCustomKeyword("");
    setCustomCompName("");
    setCustomCompWebsite("");
    setIsAddingCustomComp(false);
    setIsAddingCustomKeyword(false);
    setHasShownKeywordSuggestion(false);
    setMaxCompetitorsAllowed(DEFAULT_MAX_COMPETITORS_ALLOWED);
    setMaxKeywordsAllowed(DEFAULT_MAX_KEYWORDS_ALLOWED);
  };

  const startFreshOnboardingSession = (value: string) => {
    suggestionsRequestIdRef.current += 1;
    latestWebsiteRef.current = value;
    setProductId(null);
    setIsNewAnalysis(false);
    isBrandNameAutoRef.current = true;
    setBrandName("");
    resetOnboardingForWebsiteChange();
  };

  const applyWebsiteChange = (value: string) => {
    setBrand(value);
    startFreshOnboardingSession(value);
    checkDNS(value);
  };

  const handleWebsiteInputChange = (value: string) => {
    setWebsiteInput(value);
  };

  const commitWebsiteInput = () => {
    if (isWebsiteDisabled) return;
    const nextWebsite = websiteInput.trim();
    const currentWebsite = brand.trim();

    if (nextWebsite === currentWebsite) return;

    if (!nextWebsite) {
      startFreshOnboardingSession("");
      setBrand("");
      setWebsiteInput("");
      setDnsStatus(null);
      return;
    }

    if (hasOnboardingProgress && currentWebsite) {
      setPendingWebsite(nextWebsite);
      setConfirmAction("change-website");
      setConfirmOpen(true);
      return;
    }

    applyWebsiteChange(nextWebsite);
    setWebsiteInput(nextWebsite);
  };

  const handleWebsiteInputBlur = () => {
    commitWebsiteInput();
  };

  const handleWebsiteInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitWebsiteInput();
    }
  };

  const handleResetClick = () => {
    setConfirmAction("reset");
    setPendingWebsite("");
    setConfirmOpen(true);
  };

  const handleConfirmAction = () => {
    if (confirmAction === "change-website") {
      applyWebsiteChange(pendingWebsite);
      setWebsiteInput(pendingWebsite);
    } else {
      startFreshOnboardingSession("");
      setBrand("");
      setWebsiteInput("");
      setPendingWebsite("");
      setDnsStatus(null);
    }
    setConfirmOpen(false);
  };

  const handleConfirmCancel = () => {
    if (confirmAction === "change-website") {
      setWebsiteInput(brand);
    }
    setConfirmOpen(false);
  };

  const handleConfirmOpenChange = (open: boolean) => {
    if (!open && confirmOpen && confirmAction === "change-website") {
      setWebsiteInput(brand);
    }
    setConfirmOpen(open);
  };

  const handleGenerateBrandDescription = async (
    url: string,
    productIdParam?: string,
  ) => {
    const requestId = ++suggestionsRequestIdRef.current;
    const normalizedUrl = normalizeDomain(url);
    setIsLoadingDescription(true);
    try {
      const fallbackBrand = getBrandNameFromWebsite(url);
      if (!brandName) {
        setBrandNameFromSystem(fallbackBrand);
      }

      const suggestions = await getOnboardingSuggestions({
        website: normalizedUrl,
        name: isBrandNameAutoRef.current ? undefined : brandName || undefined,
        business_domain: "General",
      });

      if (
        requestId !== suggestionsRequestIdRef.current ||
        !latestWebsiteRef.current.trim() ||
        (latestWebsiteRef.current &&
          normalizeDomain(latestWebsiteRef.current) !== normalizedUrl)
      ) {
        return;
      }

      if (suggestions) {
        const nextMaxCompetitorsAllowed = normalizeCompetitorCap(
          suggestions.max_competitors_allowed,
        );
        setMaxCompetitorsAllowed(nextMaxCompetitorsAllowed);
        setSelectedCompetitors((prev) => prev.slice(0, nextMaxCompetitorsAllowed));
        const nextMaxKeywordsAllowed = normalizeKeywordCap(
          suggestions.max_keywords_allowed,
        );
        setMaxKeywordsAllowed(nextMaxKeywordsAllowed);
        setSelectedKeywords((prev) => prev.slice(0, nextMaxKeywordsAllowed));

        setBrandNameFromSystem(suggestions.product_name);
        if (suggestions.description) {
          setBrandDescription(suggestions.description);
        }

        const incomingCompetitors = (suggestions.competitors || [])
          .filter((c) => c?.name && c?.website)
          .filter((c) => !isSelfCompetitor(url, c.website))
          .slice(0, 8)
          .map((c) => ({
            name: c.name.trim(),
            website: c.website.trim(),
            reason: c.reason?.trim(),
          }));

        setSuggestedCompetitors(incomingCompetitors.slice(0, 8));

        const incomingKeywords = (suggestions.keywords || [])
          .map((k) => k.trim())
          .filter((k) => k.length > 0);

        setSuggestedKeywords(Array.from(new Set(incomingKeywords)).slice(0, 12));
      }
    } catch (error: any) {
      console.error("Failed to fetch onboarding data:", error);
      toast({
        title: "Error",
        description:
          error?.message ||
          "Failed to load onboarding data. Please continue by filling details manually.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDescription(false);
    }
  };

  const toggleCompetitor = (competitor: OnboardingCompetitor) => {
    const isSelected = selectedCompetitors.some((c) => isSameCompetitor(c, competitor));

    if (isSelected) {
      setSelectedCompetitors((prev) =>
        prev.filter((c) => !isSameCompetitor(c, competitor)),
      );
    } else {
      if (selectedCompetitors.length >= maxCompetitorsAllowed) {
        toast({
          title: "Selection full",
          description: `${maxCompetitorsAllowed} competitors selected. Please remove one to pick another.`,
          variant: "destructive",
        });
        return;
      }
      setSelectedCompetitors((prev) => [...prev, competitor]);
    }
  };

  const handleAddCustomCompetitor = () => {
    if (!customCompName.trim() || !customCompWebsite.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a name and a website for the competitor.",
        variant: "destructive",
      });
      return;
    }

    if (selectedCompetitors.length >= maxCompetitorsAllowed) {
      toast({
        title: "Selection full",
        description: `${maxCompetitorsAllowed} competitors selected. Please remove one to pick another.`,
        variant: "destructive",
      });
      return;
    }

    const normalizedWeb = normalizeDomain(customCompWebsite);
    const newComp: OnboardingCompetitor = {
      name: customCompName.trim(),
      website: normalizedWeb,
    };

    setSelectedCompetitors((prev) => [...prev, newComp]);
    setSuggestedCompetitors((prev) => {
      if (!prev.some((c) => isSameCompetitor(c, newComp))) {
        return [newComp, ...prev];
      }
      return prev;
    });

    const addedName = customCompName.trim();
    setCustomCompName("");
    setCustomCompWebsite("");
    setIsAddingCustomComp(false);

    toast({
      title: "Competitor Added",
      description: `${addedName} has been added to your selection.`,
    });
  };

  const maybeSuggestMoreCompetitorsForKeywords = () => {
    if (
      !hasShownKeywordSuggestion &&
      selectedCompetitors.length > 0 &&
      selectedCompetitors.length < requiredCompetitorsForKeywords
    ) {
      toast({
        title: "Suggestion",
        description:
          `Please select at least ${requiredCompetitorsForKeywords} competitors for a more comprehensive comparison.`,
      });
      setHasShownKeywordSuggestion(true);
    }
  };

  const toggleKeyword = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords((prev) => prev.filter((k) => k !== keyword));
    } else {
      maybeSuggestMoreCompetitorsForKeywords();

      if (selectedKeywords.length >= maxKeywordsAllowed) {
        return;
      }
      setSelectedKeywords((prev) => [...prev, keyword]);
    }
  };

  const handleAddCustomKeyword = () => {
    if (!customKeyword.trim()) return;

    maybeSuggestMoreCompetitorsForKeywords();

    if (selectedKeywords.length >= maxKeywordsAllowed) {
      toast({
        title: "Selection full",
        description: `${maxKeywordsAllowed} keywords selected. Please remove one to pick another.`,
        variant: "destructive",
      });
      return;
    }

    const newKw = customKeyword.trim();
    setSelectedKeywords((prev) => [...prev, newKw]);
    setSuggestedKeywords((prev) => {
      if (!prev.includes(newKw)) return [newKw, ...prev];
      return prev;
    });
    setCustomKeyword("");
    setIsAddingCustomKeyword(false);

    toast({
      title: "Keyword Added",
      description: `"${newKw}" has been added to your selection.`,
    });
  };

  const handleStartAnalysis = async () => {
    if (selectedCompetitors.length < requiredCompetitorsToContinue) {
      toast({
        title: "Selection incomplete",
        description: `Please select at least ${requiredCompetitorsToContinue} competitors to continue.`,
        variant: "destructive",
      });
      return;
    }

    if (selectedKeywords.length < 1) {
      toast({
        title: "Selection incomplete",
        description: "Please select at least one keyword.",
        variant: "destructive",
      });
      return;
    }

    if (!applicationId) {
      toast({
        title: "Authentication error",
        description: "Please try logging out and logging back in.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setIsLoading(true);
    const analysisTriggeredAt = Date.now();

    try {
      const trimmedBrand = brand.trim();
      const normalizedWebsite = normalizeDomain(trimmedBrand);
      startAnalysis(productId);

      const keywordStrings = selectedKeywords;

      if (isNewAnalysis && productId) {
        await generateWithKeywords(productId, keywordStrings);

        setSecureProductId(productId);
        setSecureKeywords(keywordStrings.map((k) => ({ keyword: k })));
        setSecureKeywordCount(keywordStrings.length.toString());

        setTimeout(() => {
          toast({
            title: "Analysis in Progress",
            description:
              "Your analysis has begun. You'll receive a notification on your email when it's ready.",
            duration: Infinity,
          });

          navigate("/results", {
            state: {
              website: trimmedBrand,
              keywords: keywordStrings,
              productId,
              analysisTriggeredAt,
              isNew: true,
            },
          });

          setIsLoading(false);
        }, 10000);
      } else {
        const data = await fetchProductsWithKeywords({
          website: normalizedWebsite,
          name: brandName || trimmedBrand,
          description: brandDescription || trimmedBrand,
          business_domain: "General",
          application_id: applicationId,
          search_keywords: keywordStrings,
          competitors: selectedCompetitors.map((competitor) => ({
            name: competitor.name,
            website: competitor.website,
            reason: competitor.reason,
          })),
        });

        if (!data?.product?.id) {
          toast({
            title: "Error starting analysis",
            description: "Failed to initialize analysis. Please try again.",
            variant: "destructive",
            duration: 5000,
          });
          setIsLoading(false);
          setIsAnalyzing(false);
          return;
        }

        startAnalysis(data.product.id);
        setSecureProductId(data.product.id);

        saveKeywordsOnce(data);
        setSecureKeywords(keywordStrings.map((k) => ({ keyword: k })));
        setSecureKeywordCount(keywordStrings.length.toString());

        setTimeout(() => {
          toast({
            title: "Analysis in Progress",
            description:
              "Your analysis has begun. You'll receive a notification on your email when it's ready.",
            duration: Infinity,
          });

          navigate("/results", {
            state: {
              website: trimmedBrand,
              keywords: keywordStrings,
              productId: data.product?.id,
              analysisTriggeredAt,
              isNew: true,
            },
          });

          setIsLoading(false);
        }, 10000);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to start analysis. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  };

  const canProceed =
    dnsStatus === "valid" &&
    Boolean(brandDescription) &&
    selectedCompetitors.length >= requiredCompetitorsToContinue &&
    selectedKeywords.length >= 1;

  return (
    <Layout showNavigation={false}>
      <div className="min-h-screen bg-transparent">
        <main className="container mx-auto px-4 py-12 max-w-5xl mt-14 mb-24 relative">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -z-10 animate-pulse delay-700" />

          {!isAnalyzing ? (
            <>
              <div className="space-y-4 text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                  <span className="gradient-text">Analysis</span> Setup
                </h1>
                <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Configure your brand, keywords, and competitors for AI visibility tracking.
                </p>
              </div>

              <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
                <aside className="lg:col-span-3 mb-10 lg:mb-0">
                  <div className="lg:sticky lg:top-32 space-y-10 animate-in fade-in slide-in-from-left-6 duration-700">
                    <div className="space-y-1">
                      <h3 className="text-xs md:text-sm font-semibold uppercase tracking-wide text-muted-foreground/60">
                        Your Progress
                      </h3>
                      <p className="text-sm font-bold text-foreground/80">Analysis Configuration</p>
                    </div>

                    <div className="flex flex-col gap-8 relative">
                      <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-muted rounded-full overflow-hidden z-0">
                        <div
                          className="w-full bg-emerald-500 transition-all duration-1000"
                          style={{
                            height:
                              selectedCompetitors.length >= requiredCompetitorsToContinue
                                ? "100%"
                                : brandDescription
                                  ? "50%"
                                  : "0%",
                          }}
                        />
                      </div>

                      {[
                        {
                          id: 1,
                          label: "Brand Identity",
                          desc: "Identity & Vision",
                          active: true,
                          completed: Boolean(brandDescription),
                        },
                        {
                          id: 2,
                          label: "Competitors",
                          desc: "Market Benchmarks",
                          active: Boolean(brandDescription),
                          completed: selectedCompetitors.length >= requiredCompetitorsToContinue,
                        },
                        {
                          id: 3,
                          label: "Keywords",
                          desc: "Visibility Targets",
                          active: selectedCompetitors.length >= requiredCompetitorsToContinue,
                          completed: selectedKeywords.length >= 1,
                        },
                      ].map((step) => (
                        <div
                          key={step.id}
                          className={cn(
                            "flex items-start gap-5 transition-all duration-500 relative z-10",
                            step.active ? "opacity-100" : "opacity-30",
                          )}
                        >
                          <div
                            className={cn(
                              "w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold transition-all duration-500 border-2 shrink-0 bg-background",
                              step.completed
                                ? "bg-emerald-500 border-emerald-500 text-white shadow-glow-emerald"
                                : step.active
                                  ? "bg-primary border-primary text-primary-foreground shadow-glow"
                                  : "border-muted text-muted-foreground",
                            )}
                          >
                            {step.completed ? <Check className="w-5 h-5" /> : step.id}
                          </div>
                          <div className="flex flex-col gap-0.5 pt-0.5">
                            <span
                              className={cn(
                                "text-xs md:text-sm font-semibold uppercase tracking-wide",
                                step.active ? "text-foreground" : "text-muted-foreground",
                              )}
                            >
                              {step.label}
                            </span>
                            <span className="text-xs text-muted-foreground/70 tracking-normal">
                              {step.desc}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 backdrop-blur-sm flex flex-col gap-3 transition-all duration-300 hover:bg-primary/10">
                      <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-primary uppercase tracking-wide">
                        <Tag className="w-3 h-3" />
                        Requirements
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs md:text-sm font-medium">
                          <span
                            className={
                              selectedCompetitors.length >= requiredCompetitorsToContinue
                                ? "text-emerald-500"
                                : "text-muted-foreground/70"
                            }
                          >
                            Min. {requiredCompetitorsToContinue} Competitors
                          </span>
                          {selectedCompetitors.length >= requiredCompetitorsToContinue ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border border-muted-foreground/30" />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs md:text-sm font-medium">
                          <span
                            className={
                              selectedKeywords.length >= 1
                                ? "text-emerald-500"
                                : "text-muted-foreground/70"
                            }
                          >
                            Min. 1 Keyword
                          </span>
                          {selectedKeywords.length >= 1 ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border border-muted-foreground/30" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </aside>

                <div className="lg:col-span-9 space-y-12">
                  <Card className="border-none shadow-elevated bg-card/60 backdrop-blur-md overflow-hidden relative group transition-all duration-500 hover:shadow-glow/20">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="pb-4 pt-8">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-sm transition-transform duration-500 group-hover:scale-110">
                            <Globe className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-bold tracking-tight">
                              Brand Details
                            </CardTitle>
                            <CardDescription className="text-sm text-muted-foreground/80">
                              How the world recognizes your business
                            </CardDescription>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleResetClick}
                          disabled={!hasOnboardingProgress}
                          className="text-xs md:text-sm"
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                          Reset
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-8 p-8 pt-0">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="brand-name" className="text-xs font-medium text-foreground/80">
                            Brand Name
                          </Label>
                          <Input
                            id="brand-name"
                            placeholder="e.g. Acme Corp"
                            value={brandName}
                            onChange={(e) => setBrandNameFromUser(e.target.value)}
                            disabled={isWebsiteDisabled}
                            className="h-10 text-sm bg-background border-input hover:border-primary/50 focus:border-primary transition-all rounded-md px-3"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="website" className="text-xs font-medium text-foreground/80">
                            Website URL
                          </Label>
                          <div className="relative group/input">
                            <Input
                              id="website"
                              placeholder="e.g. acme.com"
                              value={websiteInput}
                              onChange={(e) => handleWebsiteInputChange(e.target.value)}
                              onBlur={handleWebsiteInputBlur}
                              onKeyDown={handleWebsiteInputKeyDown}
                              className={cn(
                                "h-10 pl-3 pr-10 text-sm bg-background border-input hover:border-primary/50 focus:border-primary transition-all rounded-md",
                                dnsStatus === "valid" &&
                                  "border-emerald-500/50 focus:border-emerald-500",
                              )}
                              disabled={isWebsiteDisabled}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                              {dnsStatus === "checking" && (
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                              )}
                              {dnsStatus === "valid" && (
                                <CheckCircle className="w-4 h-4 text-emerald-500 animate-in zoom-in duration-300" />
                              )}
                              {dnsStatus === "invalid" && (
                                <XCircle className="w-4 h-4 text-destructive animate-in shake duration-300" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {dnsStatus === "valid" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-6 duration-700">
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="description"
                              className="text-sm font-bold flex items-center gap-2 text-foreground/90"
                            >
                              <Briefcase className="w-4 h-4 text-primary" />
                              Brand Description
                            </Label>
                            {!productId && (
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 animate-pulse shadow-sm">
                                <Sparkles className="w-3.5 h-3.5" />
                                AI INTELLIGENCE ACTIVE
                              </div>
                            )}
                          </div>
                          {isLoadingDescription ? (
                            <div className="p-12 border-2 border-dashed border-primary/20 rounded-2xl bg-primary/5 space-y-6 flex flex-col items-center justify-center text-center overflow-hidden relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-progress-loop" />
                              <div className="relative">
                                <div className="w-16 h-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                                <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                              </div>
                              <div className="space-y-2 relative">
                                <p className="text-lg font-bold text-foreground">Analyzing Digital Footprint</p>
                                <p className="text-sm text-muted-foreground">
                                  Synthesizing brand character and market positioning...
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="relative group/textarea">
                              <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-transparent rounded-xl opacity-0 group-focus-within/textarea:opacity-100 transition-opacity duration-500" />
                              <Textarea
                                id="description"
                                value={brandDescription}
                                onChange={(e) => setBrandDescription(e.target.value)}
                                readOnly
                                disabled={!!productId}
                                className={cn(
                                  "min-h-[160px] text-base bg-background/50 border-input resize-none focus:border-primary transition-all p-6 leading-relaxed rounded-xl shadow-inner relative z-10",
                                  (productId || brandDescription) &&
                                    "opacity-80 cursor-not-allowed bg-muted/30",
                                )}
                                placeholder="Describe your brand and its offerings..."
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-elevated bg-card/60 backdrop-blur-md overflow-hidden relative animate-in fade-in slide-in-from-bottom-10 duration-700 hover:shadow-glow/20 transition-all duration-500">
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                      <CardHeader className="pb-4 pt-8">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-sm">
                              <Users className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold tracking-tight">
                                Competitive Brands
                              </CardTitle>
                              <CardDescription className="text-sm text-muted-foreground/80">
                                Select key competitors to measure against
                              </CardDescription>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "h-8 px-4 font-bold transition-all duration-500 shadow-sm rounded-full",
                              selectedCompetitors.length >= requiredCompetitorsToContinue
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-600 border border-amber-500/20",
                            )}
                          >
                            {selectedCompetitors.length} / {maxCompetitorsAllowed} Selected
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-8 p-8 pt-0">
                        <div className="p-6 rounded-2xl border-2 border-dashed border-muted bg-muted/20 min-h-[100px] flex flex-col gap-4 relative overflow-hidden group/selected">
                          <div className="flex items-center justify-between relative z-10">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/60">
                              Active Comparison Group
                            </span>
                            {selectedCompetitors.length > 0 && (
                              <button
                                onClick={() => setSelectedCompetitors([])}
                                className="text-xs font-medium text-muted-foreground hover:text-destructive transition-colors uppercase tracking-normal"
                              >
                                Clear All
                              </button>
                            )}
                          </div>
                          {selectedCompetitors.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-1 py-2">
                              <p className="text-xs text-muted-foreground/60 font-medium">
                                Add competitors
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {selectedCompetitors.map((competitor, idx) => (
                                <TooltipProvider key={`${normalizeDomain(competitor.website || competitor.name)}-${idx}`}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge
                                        variant="secondary"
                                        className="pl-4 pr-2 py-2 bg-background border shadow-elevated hover:bg-muted/80 flex items-center gap-3 group animate-in zoom-in-95 duration-300 rounded-xl"
                                      >
                                        {getCompetitorLogoUrl(competitor.website) ? (
                                          <img
                                            src={getCompetitorLogoUrl(competitor.website)}
                                            alt={`${competitor.name} logo`}
                                            className="w-5 h-5 rounded object-cover bg-primary/10"
                                            loading="lazy"
                                          />
                                        ) : (
                                          <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                                            {competitor.name.charAt(0)}
                                          </div>
                                        )}
                                        <span className="font-bold text-sm">{competitor.name}</span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleCompetitor(competitor);
                                          }}
                                          className="p-1 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                                        >
                                          <XCircle className="w-4 h-4" />
                                        </button>
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="font-medium">{competitor.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {getDisplayDomain(competitor.website)}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label className="text-xs font-medium text-foreground/70">
                            Suggested Competitors
                          </Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {suggestedCompetitors
                              .filter((c) => !selectedCompetitors.some((sc) => isSameCompetitor(sc, c)))
                              .slice(0, 9)
                              .map((competitor, idx) => (
                                <TooltipProvider
                                  key={`${normalizeDomain(competitor.website || competitor.name)}-suggestion-${idx}`}
                                >
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => toggleCompetitor(competitor)}
                                        className="flex items-center gap-4 p-4 rounded-xl border bg-card/40 hover:bg-card hover:border-primary/50 hover:shadow-glow/10 hover:-translate-y-1 transition-all duration-300 text-left group relative overflow-hidden"
                                      >
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {getCompetitorLogoUrl(competitor.website) ? (
                                          <img
                                            src={getCompetitorLogoUrl(competitor.website)}
                                            alt={`${competitor.name} logo`}
                                            className="w-10 h-10 rounded-lg object-cover bg-muted border relative z-10"
                                            loading="lazy"
                                          />
                                        ) : (
                                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500 relative z-10">
                                            {competitor.name.charAt(0)}
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0 relative z-10">
                                          <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                                            {competitor.name}
                                          </p>
                                          <p className="text-xs text-muted-foreground font-medium truncate opacity-70 group-hover:opacity-100 transition-opacity">
                                            {getDisplayDomain(competitor.website)}
                                          </p>
                                        </div>
                                        <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-all duration-500 opacity-20 group-hover:opacity-100 group-hover:rotate-90 relative z-10" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="font-medium">{competitor.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {getDisplayDomain(competitor.website)}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ))}
                            {isAddingCustomComp ? (
                              <div className="col-span-full sm:col-span-2 md:col-span-1 p-3 rounded-md border border-dashed bg-muted/20 flex flex-col gap-2 animate-in fade-in zoom-in-95">
                                <Input
                                  placeholder="Name"
                                  value={customCompName}
                                  onChange={(e) => setCustomCompName(e.target.value)}
                                  className="h-8 text-xs bg-background"
                                  autoFocus
                                />
                                <Input
                                  placeholder="Website"
                                  value={customCompWebsite}
                                  onChange={(e) => setCustomCompWebsite(e.target.value)}
                                  className="h-8 text-xs bg-background"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={handleAddCustomCompetitor}
                                    className="h-7 text-xs flex-1"
                                  >
                                    Add
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setIsAddingCustomComp(false)}
                                    className="h-7 text-xs px-2"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setIsAddingCustomComp(true)}
                                className="flex flex-col items-center justify-center gap-2 p-3 rounded-md border border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary group h-full min-h-[60px]"
                              >
                                <Plus className="w-5 h-5" />
                                <span className="text-xs font-medium">Add Manual</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                  <Card className="border-none shadow-elevated bg-card/60 backdrop-blur-md overflow-hidden relative animate-in fade-in slide-in-from-bottom-10 duration-700 delay-100 hover:shadow-glow/20 transition-all duration-500">
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                      <CardHeader className="pb-4 pt-8">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-sm">
                              <Search className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold tracking-tight">Keywords</CardTitle>
                              <CardDescription className="text-sm text-muted-foreground/80">
                                Target queries to analyze for visibility
                              </CardDescription>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "h-8 px-4 font-bold transition-all duration-500 shadow-sm rounded-full",
                              selectedKeywords.length >= 1
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-600 border border-amber-500/20",
                            )}
                          >
                            {selectedKeywords.length} / {maxKeywordsAllowed} Selected
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-8 p-8 pt-0">
                        <div className="p-6 rounded-2xl border-2 border-dashed border-muted bg-muted/20 min-h-[100px] flex flex-col gap-4 relative overflow-hidden">
                          <div className="flex items-center justify-between relative z-10">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/60">
                              Active Keyword Set
                            </span>
                            {selectedKeywords.length > 0 && (
                              <button
                                onClick={() => setSelectedKeywords([])}
                                className="text-xs font-medium text-muted-foreground hover:text-destructive transition-colors uppercase tracking-normal"
                              >
                                Clear All
                              </button>
                            )}
                          </div>
                          {selectedKeywords.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-1 py-2">
                              <p className="text-xs text-muted-foreground/60 font-medium">
                                Add keywords
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {selectedKeywords.map((keyword, idx) => (
                                <Badge
                                  key={`selected-kw-${idx}-${keyword}`}
                                  variant="secondary"
                                  className="pl-4 pr-2 py-2 bg-background border shadow-elevated hover:bg-muted/80 flex items-center gap-3 group animate-in zoom-in-95 duration-300 rounded-xl"
                                >
                                  <span className="font-bold text-sm">{keyword}</span>
                                  <button
                                    onClick={() => toggleKeyword(keyword)}
                                    className="p-1 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label className="text-xs font-medium text-foreground/70">
                            Suggested Keywords
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {suggestedKeywords
                              .filter((k) => !selectedKeywords.includes(k))
                              .slice(0, 15)
                              .map((keyword, idx) => (
                                <button
                                  key={`suggestion-kw-${idx}`}
                                  onClick={() => toggleKeyword(keyword)}
                                  className="px-3 py-1.5 rounded-full border bg-card/40 text-xs font-medium text-foreground/70 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300"
                                >
                                  + {keyword}
                                </button>
                              ))}

                            {isAddingCustomKeyword ? (
                              <div className="p-3 rounded-md border border-dashed bg-muted/20 flex flex-col gap-2 animate-in fade-in zoom-in-95 min-w-[220px]">
                                <Input
                                  value={customKeyword}
                                  onChange={(e) => setCustomKeyword(e.target.value)}
                                  placeholder="Keyword"
                                  className="h-8 text-xs bg-background"
                                  autoFocus
                                  onKeyDown={(e) =>
                                    e.key === "Enter" && handleAddCustomKeyword()
                                  }
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={handleAddCustomKeyword}
                                    className="h-7 text-xs flex-1"
                                  >
                                    Add
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setIsAddingCustomKeyword(false)}
                                    className="h-7 text-xs px-2"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  maybeSuggestMoreCompetitorsForKeywords();
                                  setIsAddingCustomKeyword(true);
                                }}
                                className="px-3 py-1.5 rounded-full border border-dashed border-muted-foreground/30 text-xs font-medium text-muted-foreground hover:border-primary/50 hover:text-primary transition-all flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span className="text-xs font-medium">Add Manual</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                  <div className="flex justify-center pt-8 z-30">
                    <Button
                      size="lg"
                      className={cn(
                        "h-16 px-12 rounded-full shadow-glow font-semibold text-base transition-all duration-700 flex items-center gap-3 overflow-hidden group/btn relative",
                        canProceed
                          ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:scale-105 active:scale-95 text-white opacity-100"
                          : "bg-muted text-muted-foreground scale-95 opacity-50 cursor-not-allowed",
                      )}
                      onClick={handleStartAnalysis}
                      disabled={!canProceed || isLoading}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out" />
                      {isLoading ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="animate-pulse">Launching AI Swarm...</span>
                        </>
                      ) : (
                        <>
                          <Rocket
                            className={cn(
                              "w-6 h-6 transition-transform duration-500",
                              canProceed && "group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1",
                            )}
                          />
                          <span className="tracking-wide">LAUNCH DEEP ANALYSIS</span>
                          <ArrowRight className="w-5 h-5 ml-1 transition-transform duration-500 group-hover/btn:translate-x-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="min-h-[85vh] flex flex-col items-center justify-center p-8 relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse delay-700" />

              <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-16 items-center relative z-10">
                <div className="flex flex-col items-center justify-center space-y-12 order-2 lg:order-1">
                  <div className="relative group">
                    <div className="relative w-64 h-64">
                      <div className="absolute inset-0 rounded-full border-[8px] border-primary/5 animate-[spin_8s_linear_infinite]" />
                      <div className="absolute inset-2 rounded-full border-[2px] border-dashed border-primary/20 animate-[spin_12s_linear_infinite_reverse]" />
                      <div className="absolute inset-0 rounded-full border-t-[8px] border-primary shadow-glow duration-1000 animate-[spin_3s_cubic-bezier(0.4,0,0.2,1)_infinite]" />

                      <div className="absolute inset-8 rounded-full border border-indigo-500/20 animate-[spin_6s_linear_infinite]">
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 p-2 bg-background border border-indigo-500/40 rounded-lg shadow-glow-sm">
                          <Cpu className="w-4 h-4 text-indigo-500" />
                        </div>
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <div className="absolute -inset-6 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                          {(() => {
                            const Icon = AGENTS[activeAgentIndex].icon;
                            return (
                              <div className="relative p-6 bg-background rounded-3xl border-2 border-primary/30 shadow-elevated animate-in zoom-in duration-500">
                                <Icon
                                  className={cn(
                                    "w-12 h-12 transition-colors duration-500",
                                    AGENTS[activeAgentIndex].color,
                                  )}
                                />
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary animate-pulse shadow-sm">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs md:text-sm font-semibold uppercase tracking-wide">
                        Agentic Intelligence Active
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-4xl font-bold tracking-tight uppercase">
                        <span className="gradient-text">{AGENTS[activeAgentIndex].name}</span>
                      </h2>
                      <p className="text-muted-foreground font-bold text-sm tracking-wide">
                        {AGENTS[activeAgentIndex].status}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8 order-1 lg:order-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs md:text-sm font-semibold uppercase tracking-wide text-muted-foreground/60">
                        Swarm Intelligence
                      </h3>
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                        {Math.round(((activeAgentIndex + 1) / AGENTS.length) * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden border border-muted/20">
                      <div
                        className="h-full bg-gradient-to-r from-primary via-indigo-500 to-primary transition-all duration-1000 ease-out shadow-glow animate-gradient-flow"
                        style={{ width: `${((activeAgentIndex + 1) / AGENTS.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {AGENTS.map((agent, index) => {
                      const isActive = index === activeAgentIndex;
                      const isCompleted = index < activeAgentIndex;
                      const AgentIcon = agent.icon;

                      return (
                        <div
                          key={agent.name}
                          className={cn(
                            "flex items-center gap-5 p-4 rounded-2xl border transition-all duration-500 relative overflow-hidden group/agent",
                            isActive
                              ? "bg-card border-primary/40 shadow-glow/10 translate-x-2 scale-[1.02]"
                              : isCompleted
                                ? "bg-emerald-500/5 border-emerald-500/20 opacity-80"
                                : "bg-muted/30 border-transparent opacity-30",
                          )}
                        >
                          {isActive && (
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent animate-in slide-in-from-left duration-1000" />
                          )}
                          <div
                            className={cn(
                              "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-700 relative z-10",
                              isActive
                                ? "bg-primary text-primary-foreground shadow-glow rotate-0 scale-110"
                                : isCompleted
                                  ? "bg-emerald-500 text-white"
                                  : "bg-background text-muted-foreground",
                            )}
                          >
                            {isCompleted ? (
                              <Check className="w-6 h-6 animate-in zoom-in duration-300" />
                            ) : (
                              <AgentIcon className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 relative z-10">
                            <div className="flex items-center justify-between">
                              <span
                                className={cn(
                                  "font-semibold text-sm uppercase tracking-wide transition-colors duration-500",
                                  isActive ? "text-foreground" : "text-muted-foreground",
                                )}
                              >
                                {agent.name}
                              </span>
                              {isActive && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                            </div>
                            <p className="text-xs font-medium tracking-wide uppercase opacity-60">
                              {isCompleted
                                ? "Analysis Complete"
                                : isActive
                                  ? "Processing Insights..."
                                  : "Awaiting activation"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <p className="text-xs text-muted-foreground/60 font-semibold tracking-wide uppercase">
                      Estimated time remaining:{" "}
                      {Math.max(0, (AGENTS.length - activeAgentIndex - 1) * 2)}s
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <AlertDialog open={confirmOpen} onOpenChange={handleConfirmOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "change-website"
                ? "Change website and reset onboarding?"
                : "Reset onboarding?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "change-website"
                ? "Changing website will reset description, suggested competitors, selected competitors, and keywords."
                : "This will clear description, suggested competitors, selected competitors, and keywords for the current setup."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleConfirmCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              {confirmAction === "change-website" ? "Change & Reset" : "Reset"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
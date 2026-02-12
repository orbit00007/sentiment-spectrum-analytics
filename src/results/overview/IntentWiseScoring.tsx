import { useMemo } from "react";
import {
  getSearchKeywordsWithPrompts,
  getBrandInfoWithLogos,
  getBrandName,
  getLlmData,
  hasAnalyticsData,
} from "@/results/data/analyticsData";
import { Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useResults } from "@/results/context/ResultsContext";

const INTENTS = [
  { key: "discovery", label: "Discovery" },
  { key: "use_case", label: "Use Case" },
  { key: "comparison", label: "Comparison" },
  { key: "pricing", label: "Pricing" },
  { key: "trust", label: "Trust" },
] as const;

interface Prompt {
  query: string;
  brands_per_llm: Record<string, string[]>;
  category?: string;
}

interface IntentResult {
  intent: string;
  intentLabel: string;
  presencePct: number | null;
  status: "leading" | "strong" | "moderate" | "weak" | "very_low" | "insufficient_data";
  statusLabel: string;
  description: string;
  leaderBrandId: string | null;
  leaderPresencePct: number | null;
  categoryStage: string | null;
  categoryStageLabel: string | null;
}

// Helper to infer intent from query or use category
const getIntentFromPrompt = (prompt: Prompt): string | null => {
  // If category exists and matches an intent, use it
  if (prompt.category) {
    const categoryLower = prompt.category.toLowerCase().replace(/\s+/g, "_");
    const categoryLabelLower = prompt.category.toLowerCase();
    
    // Try to match by key or label
    const matchingIntent = INTENTS.find(
      (intent) =>
        intent.key === categoryLower ||
        intent.label.toLowerCase() === categoryLabelLower ||
        intent.key.replace(/_/g, " ") === categoryLabelLower
    );
    if (matchingIntent) return matchingIntent.key;
  }

  // Infer from query
  const queryLower = prompt.query.toLowerCase();
  if (
    queryLower.includes("discover") ||
    queryLower.includes("find") ||
    queryLower.includes("what is") ||
    queryLower.includes("best")
  ) {
    return "discovery";
  }
  if (
    queryLower.includes("compare") ||
    queryLower.includes("vs") ||
    queryLower.includes("difference") ||
    queryLower.includes("better")
  ) {
    return "comparison";
  }
  if (
    queryLower.includes("price") ||
    queryLower.includes("cost") ||
    queryLower.includes("cheap") ||
    queryLower.includes("expensive")
  ) {
    return "pricing";
  }
  if (
    queryLower.includes("use") ||
    queryLower.includes("how to") ||
    queryLower.includes("example") ||
    queryLower.includes("case")
  ) {
    return "use_case";
  }
  if (
    queryLower.includes("trust") ||
    queryLower.includes("safe") ||
    queryLower.includes("reliable") ||
    queryLower.includes("secure")
  ) {
    return "trust";
  }

  return null;
};

// Step 1: Compute presence per intent for all brands
const computePresencePerIntent = (
  prompts: Prompt[],
  brands: string[],
  llmModels: string[]
): Record<string, Record<string, { visibleCount: number; totalResponses: number }>> => {
  const result: Record<string, Record<string, { visibleCount: number; totalResponses: number }>> = {};

  // Initialize all intents
  INTENTS.forEach((intent) => {
    result[intent.key] = {};
    brands.forEach((brand) => {
      result[intent.key][brand] = { visibleCount: 0, totalResponses: 0 };
    });
  });

  // Process each prompt
  prompts.forEach((prompt) => {
    const intent = getIntentFromPrompt(prompt);
    if (!intent) return;

    // Count responses per LLM model
    llmModels.forEach((model) => {
      const brandsInResponse = prompt.brands_per_llm[model] || [];
      
      // Increment total responses for this intent
      brands.forEach((brand) => {
        result[intent][brand].totalResponses++;
      });

      // Count visibility
      brands.forEach((brand) => {
        if (brandsInResponse.includes(brand)) {
          result[intent][brand].visibleCount++;
        }
      });
    });
  });

  return result;
};

// Step 2: Identify top brand per intent (dominance logic)
const identifyTopBrand = (
  presenceData: Record<string, { visibleCount: number; totalResponses: number }>,
  brands: string[]
): {
  leaderBrandId: string | null;
  leaderPresencePct: number | null;
  topObservedBrandId: string | null;
  hasClearLeader: boolean;
} => {
  // Calculate presence percentages
  const brandPresencePcts: Array<{ brand: string; presencePct: number }> = brands
    .map((brand) => {
      const data = presenceData[brand];
      const presencePct =
        data.totalResponses > 0 ? (data.visibleCount / data.totalResponses) * 100 : 0;
      return { brand, presencePct };
    })
    .sort((a, b) => b.presencePct - a.presencePct);

  if (brandPresencePcts.length === 0) {
    return {
      leaderBrandId: null,
      leaderPresencePct: null,
      topObservedBrandId: null,
      hasClearLeader: false,
    };
  }

  const leader = brandPresencePcts[0];
  const runnerUp = brandPresencePcts[1];

  // Check dominance rules
  let hasClearLeader = false;

  if (runnerUp) {
    const ratio = runnerUp.presencePct > 0 ? leader.presencePct / runnerUp.presencePct : Infinity;
    const absoluteDiff = leader.presencePct - runnerUp.presencePct;

    hasClearLeader = ratio >= 1.25 && absoluteDiff >= 10;
  } else {
    // Only one brand, treat as leader if presence > 0
    hasClearLeader = leader.presencePct > 0;
  }

  return {
    leaderBrandId: hasClearLeader ? leader.brand : null,
    leaderPresencePct: hasClearLeader ? leader.presencePct : null,
    topObservedBrandId: leader.brand,
    hasClearLeader,
  };
};

// Step 3: Compute test brand percentile per intent
const computeTestBrandPercentile = (
  presenceData: Record<string, { visibleCount: number; totalResponses: number }>,
  testBrand: string,
  competitors: string[]
): number => {
  const testData = presenceData[testBrand];
  const testPresencePct =
    testData.totalResponses > 0 ? (testData.visibleCount / testData.totalResponses) * 100 : 0;

  if (competitors.length === 0) {
    return 100; // No competitors, leading by definition
  }

  const numLower = competitors.filter((brand) => {
    const data = presenceData[brand];
    const presencePct =
      data.totalResponses > 0 ? (data.visibleCount / data.totalResponses) * 100 : 0;
    return presencePct < testPresencePct;
  }).length;

  return (numLower / competitors.length) * 100;
};

// Step 4: Map percentile to status label
const getStatusFromPercentile = (
  percentile: number,
  isLeader: boolean
): {
  status: "leading" | "strong" | "moderate" | "weak" | "very_low";
  statusLabel: string;
} => {
  if (isLeader) {
    return { status: "leading", statusLabel: "Leading" };
  }

  if (percentile >= 75) {
    return { status: "strong", statusLabel: "Strong" };
  }
  if (percentile >= 40) {
    return { status: "moderate", statusLabel: "Moderate" };
  }
  if (percentile >= 15) {
    return { status: "weak", statusLabel: "Weak" };
  }
  return { status: "very_low", statusLabel: "Very low" };
};

// Step 5: Compute category stage when no clear leader
const computeCategoryStage = (
  presenceData: Record<string, { visibleCount: number; totalResponses: number }>,
  brands: string[]
): { stage: string; label: string } | null => {
  const brandPresencePcts: Array<{ brand: string; presencePct: number }> = brands
    .map((brand) => {
      const data = presenceData[brand];
      const presencePct =
        data.totalResponses > 0 ? (data.visibleCount / data.totalResponses) * 100 : 0;
      return { brand, presencePct };
    })
    .sort((a, b) => b.presencePct - a.presencePct);

  if (brandPresencePcts.length < 2) {
    return null;
  }

  const topBrand = brandPresencePcts[0];
  const thirdBrand = brandPresencePcts[2] || brandPresencePcts[1]; // Use second if only 2 brands

  const gap = topBrand.presencePct - thirdBrand.presencePct;

  if (gap <= 10) {
    return { stage: "highly_competitive", label: "Multiple brands appear at similar frequency" };
  }
  if (gap <= 20) {
    return { stage: "competitive", label: "Some separation exists, but visibility is still shared" };
  }
  if (gap <= 30) {
    return { stage: "emerging", label: "A few brands are starting to stand out" };
  }
  return { stage: "fragmented", label: "Visibility is uneven across brands" };
};

// Get description text based on status and category stage
const getDescription = (
  status: string,
  categoryStage: { stage: string; label: string } | null,
  leaderBrandId: string | null,
  testBrand: string,
  topObservedBrandId: string | null,
  hasClearLeader: boolean
): string => {
  // If there's a clear leader and it's not the test brand, show dominated message
  if (hasClearLeader && leaderBrandId && leaderBrandId !== testBrand) {
    return `Dominated by ${leaderBrandId}`;
  }

  // If no clear leader, show category stage description (this is the primary case)
  if (!hasClearLeader && categoryStage) {
    return categoryStage.label;
  }

  // If test brand is the clear leader
  if (hasClearLeader && leaderBrandId === testBrand) {
    return "Your brand is the clear leader in this intent";
  }

  // Fallback descriptions (shouldn't normally be reached)
  switch (status) {
    case "leading":
      return categoryStage?.label || "Your brand is leading in this intent";
    case "strong":
      return categoryStage?.label || "Strong performance relative to competitors";
    case "moderate":
      return categoryStage?.label || "Moderate visibility compared to competitors";
    case "weak":
      return categoryStage?.label || "Weak visibility compared to competitors";
    case "very_low":
      return categoryStage?.label || "Very low visibility compared to competitors";
    default:
      return "";
  }
};

// Get color for status
const getStatusColor = (status: string): string => {
  switch (status) {
    case "leading":
      return "bg-green-500/10 border-green-500 text-green-700 dark:text-green-400";
    case "strong":
      return "bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400";
    case "moderate":
      return "bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-400";
    case "weak":
      return "bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-400";
    case "very_low":
      return "bg-red-500/10 border-red-500 text-red-700 dark:text-red-400";
    default:
      return "bg-muted border-border text-muted-foreground";
  }
};

// Get color for visibility bar
const getBarColor = (status: string): string => {
  switch (status) {
    case "leading":
      return "bg-green-500";
    case "strong":
      return "bg-blue-500";
    case "moderate":
      return "bg-orange-500";
    case "weak":
      return "bg-orange-500";
    case "very_low":
      return "bg-red-500";
    default:
      return "bg-muted";
  }
};

export const IntentWiseScoring = () => {
  const { analyticsVersion } = useResults();
  const analyticsAvailable = hasAnalyticsData();
  const keywordsWithPrompts = getSearchKeywordsWithPrompts();
  const brandInfo = getBrandInfoWithLogos();
  const brandName = getBrandName();
  const llmData = getLlmData();

  const intentResults = useMemo((): IntentResult[] => {
    if (!analyticsAvailable || !brandName || brandInfo.length === 0) {
      return INTENTS.map((intent) => ({
        intent: intent.key,
        intentLabel: intent.label,
        presencePct: null,
        status: "insufficient_data",
        statusLabel: "Insufficient Data",
        description: "No data available",
        leaderBrandId: null,
        leaderPresencePct: null,
        categoryStage: null,
        categoryStageLabel: null,
      }));
    }

    // Flatten all prompts
    const allPrompts: Prompt[] = keywordsWithPrompts.flatMap((keyword) =>
      keyword.prompts.map((prompt: any) => ({
        query: prompt.query || "",
        brands_per_llm: prompt.brands_per_llm || {},
        category: prompt.category,
      }))
    );

    // Get all brands
    const allBrands = brandInfo.map((b) => b.brand);
    const competitors = allBrands.filter((b) => b !== brandName);

    // Get LLM models
    const llmModels = Object.keys(llmData);

    // Step 1: Compute presence per intent
    const presenceData = computePresencePerIntent(allPrompts, allBrands, llmModels);

    // Process each intent
    return INTENTS.map((intent) => {
      const intentPresenceData = presenceData[intent.key];
      const testBrandData = intentPresenceData[brandName];

      // Check if we have data
      if (!testBrandData || testBrandData.totalResponses === 0) {
        return {
          intent: intent.key,
          intentLabel: intent.label,
          presencePct: null,
          status: "insufficient_data" as const,
          statusLabel: "Insufficient Data",
          description: "No data available",
          leaderBrandId: null,
          leaderPresencePct: null,
          categoryStage: null,
          categoryStageLabel: null,
        };
      }

      const testPresencePct =
        (testBrandData.visibleCount / testBrandData.totalResponses) * 100;

      // Step 2: Identify top brand
      const { leaderBrandId, leaderPresencePct, topObservedBrandId, hasClearLeader } =
        identifyTopBrand(intentPresenceData, allBrands);

      // Step 3: Compute percentile
      const percentile = computeTestBrandPercentile(
        intentPresenceData,
        brandName,
        competitors
      );

      // Step 4: Map to status
      // Test brand is considered leader only if it's the clear leader (meets dominance criteria)
      const isLeader = hasClearLeader && leaderBrandId === brandName;
      const { status, statusLabel } = getStatusFromPercentile(percentile, isLeader);

      // Step 5: Compute category stage (only if no clear leader)
      const categoryStage = !hasClearLeader
        ? computeCategoryStage(intentPresenceData, allBrands)
        : null;

      // Get description
      const description = getDescription(
        status,
        categoryStage,
        leaderBrandId,
        brandName,
        topObservedBrandId || null,
        hasClearLeader
      );

      return {
        intent: intent.key,
        intentLabel: intent.label,
        presencePct: testPresencePct,
        status,
        statusLabel,
        description,
        leaderBrandId,
        leaderPresencePct,
        categoryStage: categoryStage?.stage || null,
        categoryStageLabel: categoryStage?.label || null,
      };
    });
  }, [analyticsAvailable, keywordsWithPrompts, brandInfo, brandName, llmData, analyticsVersion]);

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 overflow-hidden">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Brand Presence by Buyer Intent
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          How often your brand appears in AI-generated answers across different buying stages
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider" style={{ width: '20%' }}>
                INTENT
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider" style={{ width: '40%' }}>
                VISIBILITY
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider" style={{ width: '20%' }}>
                PRESENCE STRENGTH
              </th>
            </tr>
          </thead>
          <tbody>
            {intentResults.map((result) => (
              <tr
                key={result.intent}
                className="border-b border-border/50 last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                {/* Intent Column */}
                <td className="py-4 px-4">
                  <Link
                    to={`/results/prompts?expandAll=true&viewType=category&category=${result.intent}`}
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    <span className="font-medium text-sm text-foreground">
                      {result.intentLabel}
                    </span>
                  </Link>
                </td>

                {/* Visibility Column */}
                <td className="py-4 px-4">
                  {result.presencePct !== null ? (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative h-6 bg-muted rounded overflow-hidden">
                        <div
                          className={`absolute left-0 top-0 h-full ${getBarColor(
                            result.status
                          )} transition-all duration-500`}
                          style={{
                            width: `${Math.min(result.presencePct, 100)}%`,
                          }}
                        />
                        {result.presencePct >= 10 && (
                          <span 
                            className="absolute inset-0 flex items-center justify-center text-xs font-semibold"
                            style={{ color: result.presencePct < 50 ? '#000' : '#fff' }}
                          >
                            {Math.round(result.presencePct)}%
                          </span>
                        )}
                      </div>
                      {result.presencePct < 10 && (
                        <span className="text-sm font-medium text-foreground min-w-[40px] text-right">
                          {Math.round(result.presencePct)}%
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </td>

                {/* Presence Strength Column */}
                <td className="py-4 px-4">
                  {result.status !== "insufficient_data" ? (
                    <div className="flex flex-col gap-2">
                      <div
                        className={`inline-flex items-center justify-center px-3 py-1 rounded border text-xs font-semibold w-fit ${getStatusColor(
                          result.status
                        )}`}
                      >
                        {result.statusLabel}
                      </div>
                      <p className="text-xs text-muted-foreground">{result.description}</p>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Insufficient data</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

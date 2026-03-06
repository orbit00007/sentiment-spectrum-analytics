import { useEffect, useState, useRef } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserScopedKey, STORAGE_KEYS } from "@/lib/storageKeys";

// Pipeline steps
export type PipelineStep = {
  id: number;
  title: string;
  description: string;
};

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 1,
    title: "Query Framework Structured",
    description:
      "Generating intent-based prompts across discovery, comparison, use case, pricing, and trust themes.",
  },
  {
    id: 2,
    title: "AI Responses Collected",
    description:
      "Capturing responses from ChatGPT, Google AI Mode, and Google AI Overview.",
  },
  {
    id: 3,
    title: "Mentions and Citations Extracted",
    description:
      "Mapping brand mentions, competitors, and referenced sources across all AI platforms.",
  },
  {
    id: 4,
    title: "Visibility Metrics Computed",
    description:
      "Calculating mention density, intent coverage, and AI Visibility Score.",
  },
  {
    id: 5,
    title: "Dashboard Generated",
    description:
      "Preparing scorecards, competitive intelligence, and executive insights.",
  },
];

// Timing: Step 1 = 10s, Steps 3-5 = 4s each
const STEP_1_DELAY_MS = 10_000;
const REMAINING_STEP_DELAY_MS = 4_000;

interface AnalysisSnapshotStats {
  promptsExecuted: number;
  aiModelsAnalyzed: number;
  responsesProcessed: number;
  citationsMapped: number;
  competitorsDetected: number;
}

interface AnalysisPipelineScreenProps {
  dataReady: boolean;
  analyticsData: any;
  onComplete: () => void;
  /** True when the analysis was already completed (status === "completed") before the pipeline screen mounted */
  isAlreadyCompleted?: boolean;
}

const AnalysisPipelineScreen = ({
  dataReady,
  analyticsData,
  onComplete,
  isAlreadyCompleted = false,
}: AnalysisPipelineScreenProps) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [allDone, setAllDone] = useState(false);

  const dataReadyRef = useRef(dataReady || isAlreadyCompleted);

  useEffect(() => {
    if (dataReady || isAlreadyCompleted) {
      dataReadyRef.current = true;
    }
  }, [dataReady, isAlreadyCompleted]);

  // Derive snapshot stats from analytics data when available
  const stats: AnalysisSnapshotStats = (() => {
    if (!analyticsData) {
      return {
        promptsExecuted: 0,
        aiModelsAnalyzed: 0,
        responsesProcessed: 0,
        citationsMapped: 0,
        competitorsDetected: 0,
      };
    }

    const searchKeywords = analyticsData?.search_keywords || {};
    let promptsExecuted = 0;
    Object.values(searchKeywords).forEach((kw: any) => {
      if (Array.isArray(kw?.prompts)) promptsExecuted += kw.prompts.length;
    });

    const llmData = analyticsData?.llm_wise_data || {};
    const aiModelsAnalyzed =
      Object.keys(llmData).length ||
      (analyticsData?.models_used
        ? analyticsData.models_used.split(",").length
        : 0);

    const responsesProcessed = promptsExecuted * Math.max(aiModelsAnalyzed, 1);

    const sources = analyticsData?.sources_and_content_impact || {};
    const citationsMapped = Object.keys(sources).length;

    const brands = analyticsData?.brands || [];
    const competitorsDetected = Math.max(0, brands.length - 1);

    return {
      promptsExecuted,
      aiModelsAnalyzed,
      responsesProcessed,
      citationsMapped,
      competitorsDetected,
    };
  })();

  // Main pipeline orchestration
  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const completeStep = (stepId: number) => {
      if (cancelled) return;
      setCompletedSteps((prev) => {
        if (prev.includes(stepId)) return prev;
        return [...prev, stepId];
      });
    };

    const startStep = (stepId: number) => {
      if (cancelled) return;
      setActiveStep(stepId);
    };

    const wait = (ms: number, onDone: () => void) => {
      const t = setTimeout(() => {
        if (!cancelled) onDone();
      }, ms);
      timers.push(t);
    };

    // Finish steps 3, 4, 5 with REMAINING_STEP_DELAY_MS each
    const finishRemainingSteps = () => {
      wait(REMAINING_STEP_DELAY_MS, () => {
        completeStep(3);
        startStep(4);
        wait(REMAINING_STEP_DELAY_MS, () => {
          completeStep(4);
          startStep(5);
          wait(REMAINING_STEP_DELAY_MS, () => {
            completeStep(5);
            if (!cancelled) setAllDone(true);
          });
        });
      });
    };

    // Step 1: 10 second delay
    wait(STEP_1_DELAY_MS, () => {
      completeStep(1);
      startStep(2);

      // Step 2: stall until data is ready from backend
      // If already completed, skip the wait
      if (dataReadyRef.current) {
        wait(REMAINING_STEP_DELAY_MS, () => {
          completeStep(2);
          startStep(3);
          finishRemainingSteps();
        });
      } else {
        // Poll for data — stay on step 2 until backend data arrives
        const pollForData = setInterval(() => {
          if (cancelled) {
            clearInterval(pollForData);
            return;
          }
          if (dataReadyRef.current) {
            clearInterval(pollForData);
            // Data arrived — complete step 2 after a short tick, then proceed
            wait(REMAINING_STEP_DELAY_MS, () => {
              completeStep(2);
              startStep(3);
              finishRemainingSteps();
            });
          }
        }, 300);

        timers.push(pollForData as unknown as ReturnType<typeof setTimeout>);
      }
    });

    return () => {
      cancelled = true;
      timers.forEach((t) => clearTimeout(t as any));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewDashboard = () => {
    // Set first_analysis flag to "0" permanently
    try {
      const firstAnalysisKey = getUserScopedKey(STORAGE_KEYS.FIRST_ANALYSIS);
      localStorage.setItem(firstAnalysisKey, "0");
      console.log("🏁 [PIPELINE] First analysis flag set to 0");
    } catch {
      // ignore
    }
    onComplete();
  };

  const isStepComplete = (id: number) => completedSteps.includes(id);
  const isStepActive = (id: number) => activeStep === id && !isStepComplete(id);

  return (
    <div className="w-full flex flex-col items-center px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12 max-w-6xl">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-5 tracking-tight">
          AI Visibility Baseline Analysis
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w mx-auto">
          Sit tight — we're sending real buyer queries to top AI platforms, collecting their responses, and crunching the numbers to reveal exactly where your brand stands in the AI landscape. ✨
        </p>

        {/* Status pill */}
        <div className="mt-6 inline-flex items-center gap-2">
          {allDone ? (
            <span className="inline-flex items-center gap-2 bg-success/15 text-success border border-success/30 rounded-full px-5 py-2 text-base font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Analysis complete
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-5 py-2 text-base font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              Analysis in progress
            </span>
          )}
        </div>
      </div>

      {/* Pipeline Card */}
      <div className="w-full max-w-4xl bg-card border border-border rounded-2xl p-8 md:p-10 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-md bg-primary/10">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Analysis Pipeline
          </h2>
        </div>

        <div className="space-y-0">
          {PIPELINE_STEPS.map((step, index) => {
            const complete = isStepComplete(step.id);
            const active = isStepActive(step.id);
            const isLast = index === PIPELINE_STEPS.length - 1;

            return (
              <div
                key={step.id}
                className="flex gap-4 transition-all duration-500"
              >
                {/* Icon + connector line */}
                <div className="flex flex-col items-center">
                  <div className="flex-shrink-0 mt-1">
                    {complete ? (
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    ) : active ? (
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground/30" />
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={`w-0.5 flex-1 my-1.5 transition-colors duration-500 ${
                        complete ? "bg-success/50" : "bg-border"
                      }`}
                      style={{ minHeight: "36px" }}
                    />
                  )}
                </div>

                {/* Content */}
                <div
                  className={`pb-8 ${isLast ? "pb-0" : ""} transition-all duration-300`}
                >
                  <p
                    className={`font-semibold leading-tight transition-all duration-300 ${
                      complete
                        ? "text-foreground text-base"
                        : active
                        ? "text-foreground text-2xl"
                        : "text-muted-foreground/50 text-base"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p
                    className={`leading-relaxed transition-all duration-300 ${
                      active
                        ? "text-muted-foreground text-base mt-1.5"
                        : complete
                        ? "text-muted-foreground text-sm mt-1"
                        : "text-muted-foreground/35 text-sm mt-1"
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Snapshot Stats Card — only shown when ALL steps are done */}
      {allDone && analyticsData && (
        <div className="w-full max-w-4xl bg-card border border-border rounded-2xl p-8 md:p-10 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <h2 className="text-lg font-semibold text-foreground text-center mb-7">
            Analysis Snapshot
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            <SnapshotStat
              value={stats.promptsExecuted}
              label="Prompts executed"
            />
            <SnapshotStat
              value={stats.aiModelsAnalyzed}
              label="AI models analyzed"
            />
            <SnapshotStat
              value={stats.responsesProcessed}
              label="Responses processed"
            />
            <SnapshotStat
              value={stats.citationsMapped}
              label="Citations mapped"
            />
            <SnapshotStat
              value={stats.competitorsDetected}
              label="Competitors detected"
            />
          </div>
        </div>
      )}

      {/* CTA Button */}
      {allDone && (
        <Button
          size="lg"
          className="w-full max-w-4xl bg-foreground text-background hover:bg-foreground/90 font-semibold px-12 py-4 text-base rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500"
          onClick={handleViewDashboard}
        >
          View Dashboard
        </Button>
      )}
    </div>
  );
};

const SnapshotStat = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center text-center">
    <span className="text-2xl md:text-3xl font-bold text-foreground">
      {value > 0 ? value.toLocaleString() : "—"}
    </span>
    <span className="text-xs text-muted-foreground mt-1 leading-tight">
      {label}
    </span>
  </div>
);

export default AnalysisPipelineScreen;

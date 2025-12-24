import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import Dashboard from "./Dashboard";
import Analytics from "./Analytics";
import Competitors from "./Competitors";
import Sources from "./Sources";
import Recommendations from "./Recommendations";
import ExecutiveSummary from "./ExecutiveSummary";
import { 
  setNewestAnalyticsData, 
  loadNewestAnalyticsFromStorage,
  newestAnalyticsData 
} from "../data/newestAnalyticsData";
import sampleData from "../data/data.json";

export default function NewestResultsContainer() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to load from localStorage first
    const loaded = loadNewestAnalyticsFromStorage();
    
    if (!loaded) {
      // Load sample data if no stored data
      try {
        setNewestAnalyticsData(sampleData);
        console.log('📦 [NEWEST RESULTS] Loaded sample data');
      } catch (e) {
        console.error('Failed to load sample data:', e);
        setError('Failed to load analytics data');
      }
    }
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="competitors" element={<Competitors />} />
        <Route path="sources" element={<Sources />} />
        <Route path="recommendations" element={<Recommendations />} />
        <Route path="executive" element={<ExecutiveSummary />} />
        <Route path="*" element={<Navigate to="/newestresult" replace />} />
      </Routes>
    </Layout>
  );
}

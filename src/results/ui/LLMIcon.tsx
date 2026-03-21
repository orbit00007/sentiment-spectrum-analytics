import openaiIcon from "@/assets/openai-icon.svg";
import geminiIcon from "@/assets/gemini-icon.svg";
import geminiColor from "@/assets/gemini-color.svg";
import googleaioverviewIcon from "@/assets/googleaioverview.svg";
import perplexityIcon from "@/assets/perplexity-icon.svg";

interface LLMIconProps {
  platform: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const MODEL_ICON_MAP: Record<string, { icon: string; alt: string }> = {
  openai: { icon: openaiIcon, alt: "ChatGPT" },
  chatgpt: { icon: openaiIcon, alt: "ChatGPT" },
  "google-ai-overview": { icon: googleaioverviewIcon, alt: "Google AI Overview" },
  google_ai_overview: { icon: googleaioverviewIcon, alt: "Google AI Overview" },
  "google ai overview": { icon: googleaioverviewIcon, alt: "Google AI Overview" },
  "google-ai-mode": { icon: geminiColor, alt: "Google AI Mode" },
  google_ai_mode: { icon: geminiColor, alt: "Google AI Mode" },
  "google ai mode": { icon: geminiColor, alt: "Google AI Mode" },
  gemini: { icon: geminiColor, alt: "Gemini" },
  perplexity: { icon: perplexityIcon, alt: "Perplexity" },
};

export const LLMIcon = ({ platform, size = "md", className = "" }: LLMIconProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };
  
  const key = platform.toLowerCase().trim();
  const match = MODEL_ICON_MAP[key];
  
  if (match) {
    return (
      <img 
        src={match.icon} 
        alt={match.alt} 
        className={`${sizeClasses[size]} ${className}`}
      />
    );
  }
  
  // Fallback for unknown platforms
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-primary/20 flex items-center justify-center ${className}`}>
      <span className="text-xs font-bold text-primary">{platform[0]?.toUpperCase()}</span>
    </div>
  );
};

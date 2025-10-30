import Sentiment from "sentiment";

// Initialize the Sentiment analyzer
const sentiment = new Sentiment();

/**
 * Analyze free-text note and return a human label
 */
export const analyzeSentiment = (
  text: string
): "Positive" | "Neutral" | "Negative" => {
  if (!text || text.trim() === "") return "Neutral";

  const result = sentiment.analyze(text);
  if (result.score > 0) return "Positive";
  if (result.score < 0) return "Negative";
  return "Neutral";
};

/**
 * Convert label → numeric score (for backend)
 */
export const sentimentLabelToScore = (
  label: "Positive" | "Neutral" | "Negative"
): number => {
  switch (label) {
    case "Positive":
      return 1;
    case "Negative":
      return -1;
    default:
      return 0;
  }
};

/**
 * Convert numeric score → label (for frontend display)
 */
export const sentimentScoreToLabel = (
  score: number
): "Positive" | "Neutral" | "Negative" => {
  if (score > 0) return "Positive";
  if (score < 0) return "Negative";
  return "Neutral";
};

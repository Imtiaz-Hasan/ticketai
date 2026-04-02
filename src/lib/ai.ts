import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIClassificationResult } from "@/types";

function getGeminiClient() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
}

const VALID_CATEGORIES = [
  "Billing",
  "Technical Support",
  "Bug Report",
  "Feature Request",
  "General Inquiry",
  "Account Issue",
] as const;

const VALID_PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;

export async function classifyTicket(
  title: string,
  description: string
): Promise<AIClassificationResult> {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a customer support ticket classifier. Analyze the following ticket and respond with ONLY a valid JSON object (no markdown, no code blocks, no extra text) with these exact fields:
- "category": one of ${VALID_CATEGORIES.join(", ")}
- "priority": one of ${VALID_PRIORITIES.join(", ")}
- "summary": a 1-2 sentence summary of the issue

Ticket Title: ${title}
Ticket Description: ${description}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const content = response.text();

    if (!content) {
      throw new Error("No response from AI");
    }

    // Clean response - remove markdown code blocks if present
    const cleaned = content
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(cleaned) as AIClassificationResult;

    // Validate the response
    const category = VALID_CATEGORIES.includes(
      parsed.category as (typeof VALID_CATEGORIES)[number]
    )
      ? parsed.category
      : "General Inquiry";
    const priority = VALID_PRIORITIES.includes(
      parsed.priority as (typeof VALID_PRIORITIES)[number]
    )
      ? parsed.priority
      : "Medium";
    const summary =
      typeof parsed.summary === "string"
        ? parsed.summary.slice(0, 500)
        : "AI classification completed";

    return { category, priority, summary };
  } catch (error) {
    console.error("AI classification failed:", error);
    return {
      category: "Uncategorized",
      priority: "Medium",
      summary: "AI classification pending",
    };
  }
}

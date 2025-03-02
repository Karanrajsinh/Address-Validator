import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with your API key
// Note: In production, use environment variables for API keys
const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface AddressComparisonResult {
  match: boolean;
  confidence: number;
  explanation: string;
}

export async function compareAddresses(
  address1: string,
  address2: string
): Promise<AddressComparisonResult> {
  try {
    // Make sure API key is provided
    if (!API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    // Get the generative model - updated to use the correct model name
    // The model name "gemini-1.5-pro" is the latest model as of 2025
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Construct the prompt for address comparison
    const prompt = `
      I need to compare two addresses to determine if they refer to the same physical location.
      
      Address 1: "${address1}"
      Address 2: "${address2}"
      
      Please analyze these addresses and provide a JSON response with the following structure:
      {
        "match": boolean (true if they are the same location, false otherwise),
        "confidence": number (between 0 and 1, representing your confidence in the match assessment),
        "explanation": string (brief explanation of your reasoning)
      }
      
      Consider variations in formatting, abbreviations, missing apartment/unit numbers, 
      typos, and other common differences in address notation.
      
      Provide ONLY the JSON response without any additional text.
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON response from Gemini");
    }

    const jsonResponse = JSON.parse(jsonMatch[0]) as AddressComparisonResult;
    return jsonResponse;
  } catch (error) {
    console.error("Error comparing addresses:", error);
    return {
      match: false,
      confidence: 0,
      explanation: `Error processing comparison: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
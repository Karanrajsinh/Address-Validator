import { NextRequest, NextResponse } from "next/server";
import { compareAddresses } from "@/lib/gemini";
import { z } from "zod";

// Define validation schema for request body
const addressComparisonSchema = z.object({
  address1: z.string().min(1, "First address is required"),
  address2: z.string().min(1, "Second address is required"),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request body
    const result = addressComparisonSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { address1, address2 } = result.data;
    
    // Check if API key is set
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          error: "Configuration error", 
          message: "GEMINI_API_KEY is not set in environment variables"
        },
        { status: 500 }
      );
    }
    
    // Compare addresses using Gemini
    const comparisonResult = await compareAddresses(address1, address2);
    
    // Return the comparison result
    return NextResponse.json(comparisonResult);
  } catch (error) {
    console.error("Error in address comparison API:", error);
    return NextResponse.json(
      { 
        error: "Failed to compare addresses",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
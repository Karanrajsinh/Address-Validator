"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MapPin, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function Home() {
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [result, setResult] = useState<{
    match: boolean;
    confidence: number;
    explanation: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(true); // Default to true to avoid hydration mismatch

  // Check for API key on client side after component mounts
  useEffect(() => {
    // In Next.js, client-side environment variables must be prefixed with NEXT_PUBLIC_
    const apiKeyExists = !!process.env.NEXT_PUBLIC_HAS_GEMINI_API_KEY;
    setHasApiKey(apiKeyExists);
  }, []);

  const handleCompare = async () => {
    if (!address1 || !address2) {
      setError("Both addresses are required");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/compare-addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address1, address2 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to compare addresses");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Address Comparison Tool</h1>
          <p className="text-muted-foreground">
            Compare two addresses to determine if they refer to the same location
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enter Addresses</CardTitle>
            <CardDescription>
              Provide two addresses to compare using Gemini AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address1">Address 1</Label>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <Input
                  id="address1"
                  placeholder="123 Main St, Anytown, CA 12345"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address2">Address 2</Label>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <Input
                  id="address2"
                  placeholder="123 Main Street, Anytown, California 12345"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            {!hasApiKey && (
              <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 p-4 rounded-md flex items-start gap-3">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">API Key Required</p>
                  <p className="text-sm mt-1">
                    Please add your Gemini API key to the .env.local file as GEMINI_API_KEY=your_key_here
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleCompare} 
              disabled={loading || !address1 || !address2}
              className="w-full"
            >
              {loading ? "Comparing..." : "Compare Addresses"}
            </Button>
          </CardFooter>
        </Card>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md mb-8">
            <p>{error}</p>
          </div>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.match ? (
                  <>
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                    <span>Addresses Match</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6 text-red-500" />
                    <span>Addresses Don't Match</span>
                  </>
                )}
              </CardTitle>
              <CardDescription>
                Confidence: {(result.confidence * 100).toFixed(1)}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Explanation</h3>
                  <p className="text-muted-foreground">{result.explanation}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Address 1</h4>
                    <p className="text-sm">{address1}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Address 2</h4>
                    <p className="text-sm">{address2}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
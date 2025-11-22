"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Github, Mail, Loader2, AlertCircle } from "lucide-react";
import { apiPost, tokenManager } from "@/action/server";
import { API_ENDPOINTS } from "@/action/endpoint";
import { toast } from "sonner";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";

interface LoginResponse {
  message: string;
  token: string;
  userId: string;
}

export default function SignInPage() {
  // Redirect to dashboard if already logged in
  useRedirectIfAuthenticated();

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiPost<LoginResponse>(API_ENDPOINTS.LOGIN, {
        body: { email, password },
        includeAuth: false, // Don't include auth token for login
      });

      if (response.success && response.data?.token) {
        // Save token and userId to localStorage
        tokenManager.setToken(response.data.token);
        if (response.data.userId) {
          tokenManager.setUserId(response.data.userId);
        }

        // Show success message
        toast.success(response.data.message || "Login successful!");

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        // Handle error from backend
        setError(response.error || "Invalid credentials");
        toast.error(response.error || "Invalid credentials");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during login";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = () => {
    // OAuth integration - add your own implementation
    toast.info("GitHub OAuth not implemented yet");
  };

  const handleGoogleSignIn = () => {
    // OAuth integration - add your own implementation
    toast.info("Google OAuth not implemented yet");
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
        <CardDescription>
          Enter your email and password to sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={handleGithubSignIn} disabled={isLoading}>
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
          <Button variant="outline" onClick={handleGoogleSignIn} disabled={isLoading}>
            <Mail className="mr-2 h-4 w-4" />
            Google
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground text-center w-full">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

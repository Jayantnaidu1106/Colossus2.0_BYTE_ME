"use client";

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      console.log("Initiating Google sign-in from auth/signin page...");

      // Use redirect: true to let NextAuth handle the redirect flow
      signIn("google", {
        callbackUrl: "/dashboard",
        redirect: true
      });

      // The code below won't execute if redirect is true
      // Keeping it as a fallback in case redirect doesn't work
      console.log("Fallback code executing - redirect may have failed");
      router.push("/dashboard");
    } catch (error) {
      console.error("Sign in error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          {(error || errorMessage) && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {errorMessage || "Authentication Error"}
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error === "OAuthSignin" && "Error initiating sign in"}
                    {error === "OAuthCallback" && "Error during sign in callback"}
                    {error === "OAuthCreateAccount" && "Error creating account"}
                    {error === "EmailCreateAccount" && "Error creating email account"}
                    {error === "Callback" && "Error in callback handler"}
                    {error === "OAuthAccountNotLinked" && "Email already in use with different provider"}
                    {error === "EmailSignin" && "Check your email address"}
                    {error === "CredentialsSignin" && "Sign in failed"}
                    {error === "SessionRequired" && "Please sign in to access this page"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <FcGoogle className="h-5 w-5" />
            </span>
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </button>
        </div>
      </div>
    </div>
  );
}
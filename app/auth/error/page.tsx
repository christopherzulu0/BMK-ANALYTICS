"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "An error occurred during authentication.";

  // Get role information from query parameters
  const requiredRole = searchParams.get("requiredRole");
  const userRole = searchParams.get("userRole");

  // Customize error messages based on NextAuth error codes
  if (error === "Configuration") {
    errorMessage = "There is a problem with the server configuration.";
  } else if (error === "AccessDenied") {
    if (requiredRole && userRole) {
      errorMessage = `You do not have the required permissions to access this resource. Your current role is "${userRole}", but this page requires the "${requiredRole}" role or higher.`;
    } else {
      errorMessage = "You do not have the required permissions to access this resource. This may be because your account doesn't have the necessary role.";
    }
  } else if (error === "Verification") {
    errorMessage = "The verification link may have expired or already been used.";
  }

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-red-50 via-white to-red-100">
      {/* Animated blurred background shapes */}
      <div className="absolute -z-10 inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/4 top-0 w-96 h-96 bg-red-200 opacity-30 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute right-1/4 bottom-0 w-80 h-80 bg-pink-100 opacity-20 rounded-full blur-2xl animate-float" />
        <div className="absolute left-1/2 top-1/2 w-72 h-72 bg-yellow-100 opacity-20 rounded-full blur-2xl animate-float-reverse" />
      </div>
      {/* Left: Error Card */}
      <div className="w-full md:w-1/2 flex justify-center items-center z-10">
        <Card className={cn("w-full max-w-md shadow-2xl border-2 border-red-100 animate-fadeIn backdrop-blur-md bg-white/80")}> 
          <CardHeader className="flex flex-col items-center gap-2 bg-red-100/60 rounded-t-xl animate-fadeIn">
            <AlertTriangle className="w-14 h-14 text-red-500 animate-bounce-slow mb-2 drop-shadow-lg" />
            <CardTitle className="text-3xl font-extrabold text-red-800 tracking-tight">Authentication Error</CardTitle>
            <div className="text-base text-red-700 font-medium mt-1">Something went wrong with your sign in</div>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 py-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center font-semibold text-lg shadow-sm">
              {errorMessage}
            </div>
            <div className="flex flex-col gap-3 w-full items-center">
              {/* <Link
                href="/auth/signin"
                className="inline-block px-6 py-2 bg-red-500 text-white font-bold rounded-lg shadow hover:bg-red-600 transition-colors text-base"
              >
                Return to Sign In
              </Link> */}
              <Link
                href="/"
                className="inline-block px-6 py-2 bg-white border border-red-300 text-red-600 font-semibold rounded-lg shadow hover:bg-red-50 transition-colors text-base"
              >
                Go to Homepage
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Right: Illustration */}
      <div className="hidden md:flex w-1/2 justify-center items-center z-10">
        <div className="max-w-lg w-full flex flex-col items-center">
          {/* Modern SVG illustration for error/lock/security */}
          <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-80 h-80">
            <ellipse cx="160" cy="260" rx="120" ry="30" fill="#FECACA" fillOpacity="0.4" />
            <rect x="60" y="100" width="200" height="120" rx="24" fill="#F87171" fillOpacity="0.15" />
            <rect x="80" y="120" width="160" height="80" rx="16" fill="#F87171" fillOpacity="0.25" />
            <rect x="120" y="140" width="80" height="60" rx="12" fill="#F87171" fillOpacity="0.5" />
            <circle cx="160" cy="170" r="18" fill="#F87171" />
            <rect x="154" y="170" width="12" height="28" rx="6" fill="#DC2626" />
            <ellipse cx="160" cy="170" rx="6" ry="6" fill="#FFF" />
            <path d="M120 140v-20a40 40 0 0180 0v20" stroke="#F87171" strokeWidth="8" strokeLinecap="round" />
          </svg>
          <div className="mt-4 text-lg text-red-700 font-semibold text-center">Your access is restricted<br />or something went wrong.</div>
        </div>
      </div>
      {/* Animations */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
          100% { transform: translateY(0px) scale(1); }
        }
        @keyframes float-slow {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.03); }
          100% { transform: translateY(0px) scale(1); }
        }
        @keyframes float-reverse {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(20px) scale(0.97); }
          100% { transform: translateY(0px) scale(1); }
        }
        .animate-float { animation: float 7s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 12s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 10s ease-in-out infinite; }
        .animate-fadeIn { animation: fadeIn 0.7s cubic-bezier(0.4,0,0.2,1) both; }
        .animate-bounce-slow { animation: bounce 2.5s infinite; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

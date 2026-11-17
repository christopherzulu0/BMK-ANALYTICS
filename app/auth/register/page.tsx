"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User, Mail, Lock, Eye, EyeOff, Fuel, Shield, Zap, Building, CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [DepartmentName, setDepartmentName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const totalSteps = 3;

  const validateStep = (step: number): boolean => {
    setError("");
    
    switch (step) {
      case 1:
        if (!name.trim()) {
          setError("Full name is required");
          return false;
        }
        if (!email.trim()) {
          setError("Email address is required");
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          setError("Please enter a valid email address");
          return false;
        }
        return true;
      case 2:
        if (!DepartmentName.trim()) {
          setError("Department name is required");
          return false;
        }
        return true;
      case 3:
        if (!password) {
          setError("Password is required");
          return false;
        }
        if (password.length < 8) {
          setError("Password must be at least 8 characters long");
          return false;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setError("");
    setCurrentStep(currentStep - 1);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          DepartmentName,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // Registration successful, redirect to sign-in page
      router.push("/auth/signin?registered=true");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An error occurred during registration");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Personal Information";
      case 2:
        return "Department Details";
      case 3:
        return "Security Setup";
      default:
        return "Employee Registration";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Enter your basic information";
      case 2:
        return "Select your department";
      case 3:
        return "Create your secure password";
      default:
        return "Create your account to access the pipeline control system";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-800 via-slate-900 to-zinc-900 p-4 pb-10">
      <div className="w-full max-w-md space-y-8">
        {/* Company branding header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-linear-to-br from-orange-500 via-red-500 to-amber-600 rounded-full flex items-center justify-center shadow-xl">
                <Fuel className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-linear-to-r from-white via-slate-100 to-white bg-clip-text text-transparent">
              Tazama Pipelines Limited
            </h1>
            <p className="text-sm text-slate-300 font-medium">
              Reliable Transporter Of Petroleum Products
            </p>
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-linear-to-br from-background via-background to-slate-50/50 dark:to-slate-900/50 relative overflow-hidden">
          {/* Industrial accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-orange-500 via-red-500 to-amber-500"></div>
          
          <CardHeader className="space-y-4 pb-6 pt-8">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <User className="w-5 h-5 text-orange-500" />
                <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {getStepTitle()}
                </CardTitle>
              </div>
              <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                {getStepDescription()}
              </CardDescription>
            </div>
            
            {/* Progress indicator */}
            <div className="flex items-center justify-center space-x-2 mt-6">
              {Array.from({ length: totalSteps }, (_, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                      index + 1 < currentStep
                        ? "bg-green-500 text-white"
                        : index + 1 === currentStep
                        ? "bg-orange-500 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {index + 1 < currentStep ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < totalSteps - 1 && (
                    <div
                      className={`w-8 h-0.5 mx-2 transition-all duration-200 ${
                        index + 1 < currentStep ? "bg-green-500" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-slate-500 mt-2">
              Step {currentStep} of {totalSteps}
            </p>
          </CardHeader>

          <CardContent className="space-y-6 pb-8">
            {error && (
              <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300 border-red-200 bg-red-50 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={currentStep === 3 ? handleRegister : (e) => e.preventDefault()} className="space-y-6">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-in slide-in-from-right-2 duration-300">
                  {/* Full Name field */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 h-12 transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-600"
                      />
                    </div>
                  </div>

                  {/* Email field */}
                  <div className="space-y-2">
                    <Label htmlFor="email-address" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Employee Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        id="email-address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="your.name@pipelineflow.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Department Information */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-in slide-in-from-right-2 duration-300">
                  <div className="space-y-2">
                    <Label htmlFor="DepartmentName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Department
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        id="DepartmentName"
                        name="DepartmentName"
                        type="text"
                        required
                        placeholder="Operations, Maintenance, Safety, etc."
                        value={DepartmentName}
                        onChange={(e) => setDepartmentName(e.target.value)}
                        className="pl-10 h-12 transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-600"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Select the department you work in within the pipeline organization
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Security Setup */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-in slide-in-from-right-2 duration-300">
                  {/* Password field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Security Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        placeholder="Create a secure password (min. 8 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-12 h-12 transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password field */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        id="confirm-password"
                        name="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        placeholder="Confirm your secure password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-12 h-12 transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors duration-200"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex gap-3 pt-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    className="flex-1 h-12 text-base font-medium border-slate-300 hover:bg-slate-50 transition-all duration-200"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                )}
                
                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 h-12 text-base font-semibold bg-linear-to-r from-orange-600 via-red-600 to-orange-700 hover:from-orange-700 hover:via-red-700 hover:to-orange-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-12 text-base font-semibold bg-linear-to-r from-orange-600 via-red-600 to-orange-700 hover:from-orange-700 hover:via-red-700 hover:to-orange-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating Account...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Create Account
                      </div>
                    )}
                  </Button>
                )}
              </div>
            </form>

            {/* Additional info and sign in link */}
            <div className="space-y-4">
              {/* Security notice */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-slate-600" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Secure Registration
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Account creation requires approval from system administrators
                </p>
              </div>
              
              {/* Sign in link */}
              <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Already have an account?{" "}
                  <Link
                    href="/auth/signin"
                    className="font-semibold text-orange-600 hover:text-orange-700 transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
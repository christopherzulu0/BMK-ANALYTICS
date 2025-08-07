"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle, AlertCircle, Fuel, Shield, Zap } from "lucide-react";

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const router = useRouter();
    const { toast } = useToast();
    const { data: session, status } = useSession();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);

    // Check for registration success message
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get("registered") === "true") {
            setSuccess("Registration successful! You can now sign in with your credentials.");
        }
    }, []);

    // Handle login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        setLoginSuccess(false);

        // Credentials sign in
        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setError("Invalid email or password");
            } else {
                setLoginSuccess(true);
                toast({
                    title: "Sign in successful",
                    description: "Welcome back!",
                    variant: "success",
                    duration: 3000,
                });
            }
        } catch (error) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Redirect after session updates
    useEffect(() => {
        if (loginSuccess && status === "authenticated" && session?.user?.role) {
            if (session.user.role === "admin") {
                router.push("/Root");
            } else if (session.user.role === "DOE") {
                router.push("/Pipeline");
            } else if (session.user.role === "dispatcher") {
                router.push("/Dispatch");
            } else {
                router.push("/");
            }
        }
    }, [loginSuccess, status, session, router]);

    // Loader for redirecting
    if (loginSuccess && status !== "authenticated") {
        return (
            <div className="flex flex-col items-center justify-center gap-6 min-h-[400px] p-8">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary" />
                    <CheckCircle className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold text-primary">Success!</h3>
                    <p className="text-muted-foreground">Redirecting you to your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col gap-8 w-full max-w-md mx-auto", className)} {...props}>
            {/* Company branding header */}
            <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 via-red-500 to-amber-600 rounded-full flex items-center justify-center shadow-xl">
                            <Fuel className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <Shield className="w-3 h-3 text-white" />
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 bg-clip-text text-transparent dark:from-slate-100 dark:via-slate-300 dark:to-slate-100">
                       Tazama Pipelines Limited
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium">
                    Reliable Transporter Of Petroleum Products
                    </p>
                </div>
            </div>
            
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-background via-background to-slate-50/50 dark:to-slate-900/50 relative overflow-hidden">
                {/* Industrial accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-amber-500"></div>
                
                <CardHeader className="space-y-4 pb-8 pt-8">
                    <div className="text-center space-y-3">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Zap className="w-5 h-5 text-orange-500" />
                            <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
                                Secure Access Portal
                            </CardTitle>
                        </div>
                        <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                            Enter your credentials to access the pipeline control system
                        </CardDescription>
                    </div>
                </CardHeader>
                
                <CardContent className="space-y-6 pb-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Error and success messages */}
                        {error && (
                            <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300 border-red-200 bg-red-50 text-red-800">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="font-medium">{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800 animate-in slide-in-from-top-2 duration-300">
                                <CheckCircle className="h-4 w-4" />
                                <AlertDescription className="font-medium">{success}</AlertDescription>
                            </Alert>
                        )}



                        {/* Email field */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Employee Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your.name@pipelineflow.com"
                                    className="pl-10 h-12 transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-600"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div className="space-y-2">
                            {/* <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Security Password
                                </Label>
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-sm text-orange-600 hover:text-orange-700 transition-colors duration-200 font-medium"
                                >
                                    Reset Password
                                </Link>
                            </div> */}
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your secure password"
                                    className="pl-10 pr-12 h-12 transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-600"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors duration-200"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit button */}
                        <Button 
                            type="submit" 
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 hover:from-orange-700 hover:via-red-700 hover:to-orange-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" 
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                                    Authenticating...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Access Control System
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            )}
                        </Button>
                    </form>

                    {/* Additional info and sign up link */}
                    <div className="space-y-4">
                        {/* Security notice */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Shield className="h-4 w-4 text-slate-600" />
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                    Secure Connection
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                This system is protected by enterprise-grade security protocols
                            </p>
                        </div>
                        
                        {/* Sign up link */}
                        <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Need system access?{" "}
                                <Link
                                    href="/auth/register"
                                    className="font-semibold text-orange-600 hover:text-orange-700 transition-colors duration-200"
                                >
                                    Request Account
                                </Link>
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
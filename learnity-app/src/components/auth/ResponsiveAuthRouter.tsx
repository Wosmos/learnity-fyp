/**
 * Responsive Authentication Router
 * Automatically serves mobile or desktop authentication components based on device
 */

"use client";

import React, { useState, useEffect } from "react";
import { StudentRegistrationData, LoginData } from "@/lib/validators/auth";
import { QuickTeacherRegistrationData } from "@/lib/validators/quick-teacher-registration";
import { useAuthStore } from "@/lib/stores/auth.store";

// Unified responsive components
import LoginForm from "./LoginForm";
import RegistrationFlow from "./RegistrationFlow";
import PasswordResetRequestForm from "./PasswordResetRequestForm";
import PasswordResetForm from "./PasswordResetForm";

export interface ResponsiveAuthRouterProps {
  // Authentication handlers
  onLogin: (data: LoginData) => Promise<void>;
  onStudentRegister: (data: StudentRegistrationData) => Promise<void>;
  onTeacherRegister: (data: QuickTeacherRegistrationData) => Promise<void>;
  onSocialLogin: (provider: "google" | "microsoft") => Promise<void>;
  onPasswordResetRequest: (email: string) => Promise<void>;
  onPasswordReset: (data: { password: string; token: string }) => Promise<void>;

  // Navigation
  initialView?: "login" | "register" | "forgot-password" | "reset-password";
  resetToken?: string;

  // Configuration
  requireCaptcha?: boolean;
  className?: string;
}

type AuthView = "login" | "register" | "forgot-password" | "reset-password";

export const ResponsiveAuthRouter: React.FC<ResponsiveAuthRouterProps> = ({
  onLogin,
  onStudentRegister,
  onTeacherRegister,
  onSocialLogin,
  onPasswordResetRequest,
  onPasswordReset,
  initialView = "login",
  resetToken,
  requireCaptcha = false,
  className = "",
}) => {
  const [currentView, setCurrentView] = useState<AuthView>(initialView);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Detect mobile device and screen size
  useEffect(() => {
    setIsClient(true);

    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          userAgent
        );
      const isSmallScreen = window.innerWidth < 768; // md breakpoint

      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle navigation between views
  const handleViewChange = (view: AuthView) => {
    setCurrentView(view);
  };

  // Handle password reset request
  const handlePasswordResetRequest = async (data: { email: string }) => {
    await onPasswordResetRequest(data.email);
    // Stay on the same view to show success message
  };

  // Handle password reset
  const handlePasswordReset = async (data: {
    password: string;
    confirmPassword: string;
    token: string;
  }) => {
    await onPasswordReset({ password: data.password, token: data.token });
    setCurrentView("login");
  };

  // Don't render until we know if it's mobile
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-slate-600 rounded-full"></div>
        </div>
      </div>
    );
  }

  // Mobile components (now using unified responsive components)
  if (isMobile) {
    switch (currentView) {
      case "login":
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
            <LoginForm
              onSubmit={onLogin}
              onForgotPassword={() => handleViewChange("forgot-password")}
              onSignUp={() => handleViewChange("register")}
              onSocialLogin={onSocialLogin}
              requireCaptcha={requireCaptcha}
              className={className}
            />
          </div>
        );

      case "register":
        return (
          <RegistrationFlow
            onStudentRegister={onStudentRegister}
            onTeacherRegister={onTeacherRegister}
            onBackToLogin={() => handleViewChange("login")}
            className={className}
          />
        );

      case "forgot-password":
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
            <PasswordResetRequestForm
              onSubmit={handlePasswordResetRequest}
              onBackToLogin={() => handleViewChange("login")}
              className={className}
            />
          </div>
        );

      case "reset-password":
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
            {resetToken ? (
              <PasswordResetForm
                token={resetToken}
                onSubmit={handlePasswordReset}
                onBackToLogin={() => handleViewChange("login")}
                className={className}
              />
            ) : (
              <div className="text-center">
                <p className="text-red-600">Invalid or missing reset token</p>
                <button
                  onClick={() => handleViewChange("login")}
                  className="text-blue-600 hover:text-blue-700 underline mt-2"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  }

  // Desktop components
  switch (currentView) {
    case "login":
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
          <LoginForm
            onSubmit={onLogin}
            onForgotPassword={() => handleViewChange("forgot-password")}
            onSignUp={() => handleViewChange("register")}
            onSocialLogin={onSocialLogin}
            requireCaptcha={requireCaptcha}
            className={className}
          />
        </div>
      );

    case "register":
      return (
        <RegistrationFlow
          onStudentRegister={onStudentRegister}
          onTeacherRegister={onTeacherRegister}
          className={className}
        />
      );

    case "forgot-password":
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
          <PasswordResetRequestForm
            onSubmit={handlePasswordResetRequest}
            onBackToLogin={() => handleViewChange("login")}
            className={className}
          />
        </div>
      );

    case "reset-password":
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
          {resetToken ? (
            <PasswordResetForm
              token={resetToken}
              onSubmit={handlePasswordReset}
              onBackToLogin={() => handleViewChange("login")}
              className={className}
            />
          ) : (
            <div className="text-center">
              <p className="text-red-600">Invalid or missing reset token</p>
              <button
                onClick={() => handleViewChange("login")}
                className="text-blue-600 hover:text-blue-700 underline mt-2"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
};

export default ResponsiveAuthRouter;

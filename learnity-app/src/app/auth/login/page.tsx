/**
 * Login Page
 * Dedicated login page
 */

"use client";

import { LoginForm } from "@/components/auth";
import { useAuthService } from "@/hooks/useAuthService";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login, socialLogin } = useAuthService();
  const router = useRouter();

  const handleForgotPassword = () => {
    router.push("/auth/forgot-password");
  };

  const handleSignUp = () => {
    router.push("/auth/register");
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <LoginForm
          onSubmit={login}
          onForgotPassword={handleForgotPassword}
          onSignUp={handleSignUp}
          onSocialLogin={socialLogin}
          requireCaptcha={false}
        />
      </div>
    </AuthProvider>
  );
}

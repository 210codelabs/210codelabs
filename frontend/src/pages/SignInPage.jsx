import React from "react";
import { SignIn } from "@clerk/react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/site/Logo";
import { useSeo } from "@/hooks/useSeo";

export default function SignInPage() {
  useSeo({ title: "Sign in", noindex: true });
  return (
    <div className="admin-login" data-testid="clerk-signin-page">
      <div className="admin-login__card">
        <div className="admin-login__logo"><Logo testId="signin-logo-link" /></div>
        <h1 className="admin-login__title">Internal workspace</h1>
        <p className="muted">Sign in with the authorized Google account to access the admin console.</p>
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" withSignUp />
        <Link to="/" className="text-link admin-login__back">Back to website</Link>
      </div>
    </div>
  );
}

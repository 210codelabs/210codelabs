import React from "react";
import { SignUp } from "@clerk/react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/site/Logo";
import { useSeo } from "@/hooks/useSeo";

export default function SignUpPage() {
  useSeo({ title: "Sign up", noindex: true });
  return (
    <div className="admin-login" data-testid="clerk-signup-page">
      <div className="admin-login__card">
        <div className="admin-login__logo"><Logo testId="signup-logo-link" /></div>
        <h1 className="admin-login__title">Create your admin account</h1>
        <p className="muted">Only authorized accounts can access this workspace.</p>
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
        <Link to="/" className="text-link admin-login__back">Back to website</Link>
      </div>
    </div>
  );
}

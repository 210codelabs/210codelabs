import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";

export default function NotFoundPage() {
  useSeo({ title: "Page not found", noindex: true });
  return (
    <section className="not-found" data-testid="not-found-page" aria-labelledby="nf-title">
      <div className="container container--narrow">
        <p className="eyebrow">ERROR 404</p>
        <h1 id="nf-title" className="page-hero__title">This page doesn’t exist.</h1>
        <p className="page-hero__lead">The link may be outdated or mistyped.</p>
        <Link to="/" className="btn btn-primary btn-pill" data-testid="not-found-home-button">Back to Home <ArrowRight aria-hidden="true" /></Link>
      </div>
    </section>
  );
}

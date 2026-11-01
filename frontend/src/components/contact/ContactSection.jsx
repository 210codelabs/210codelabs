import React from "react";
import { Mail } from "lucide-react";
import { CONTACT } from "@/config/site";
import { ContactForm } from "@/components/contact/ContactForm";
import { SocialLinks } from "@/components/site/SocialLinks";

export const ContactSection = ({ defaultInterest = "", headingLevel = 2, idPrefix = "home-cf" }) => {
  const H = `h${headingLevel}`;
  return (
    <section id="contact" className="contact" aria-labelledby={`${idPrefix}-title`} data-testid="contact-section">
      <div className="container contact__inner">
        <div className="contact__intro reveal">
          <p className="eyebrow">CONTACT</p>
          <H id={`${idPrefix}-title`} className="section-title section-title--lg">Start a Conversation</H>
          <p className="contact__lead">Bring your vision. We bring the engineering. Tell us what you want to build using the form, or write to us directly.</p>
          <a href={`mailto:${CONTACT.email}`} className="contact__email" data-testid="contact-section-email-link">
            <span className="contact__email-icon"><Mail aria-hidden="true" /></span>
            <span>
              <span className="contact__email-label">Email</span>
              <span className="contact__email-value">{CONTACT.email}</span>
            </span>
          </a>
          <div className="contact__social">
            <p className="contact__email-label">Follow us</p>
            <SocialLinks testPrefix="contact-social" />
          </div>
        </div>
        <div className="contact__card reveal">
          <ContactForm defaultInterest={defaultInterest} idPrefix={idPrefix} />
        </div>
      </div>
    </section>
  );
};

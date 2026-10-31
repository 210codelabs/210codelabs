import React from "react";
import { ArrowRight, BrainCircuit, Cloud, Layers, Users, GraduationCap, Boxes } from "lucide-react";

const ICONS = {
  brain: BrainCircuit,
  cloud: Cloud,
  layers: Layers,
  users: Users,
  cap: GraduationCap,
  boxes: Boxes,
};

export const CapIcon = ({ name, className = "" }) => {
  const Icon = ICONS[name] || Layers;
  return <Icon className={className} strokeWidth={1.5} aria-hidden="true" />;
};

/** Small circular arrow used at the end of cards. Decorative unless given a label. */
export const ArrowCircle = ({ size = "sm", className = "" }) => (
  <span className={`arrow-circle arrow-circle--${size} ${className}`} aria-hidden="true">
    <ArrowRight strokeWidth={2.25} />
  </span>
);

export const Eyebrow = ({ children, className = "", as: Tag = "p", light = false }) => (
  <Tag className={`eyebrow ${light ? "eyebrow--light" : ""} ${className}`}>{children}</Tag>
);

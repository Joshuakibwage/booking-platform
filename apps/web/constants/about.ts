import {
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export const ABOUT_CONTENT = {
  hero: {
    eyebrow: "About Schedulyn",
    heading: "Good work deserves to be discovered.",
    description:
      "Finding the right person to work with should feel effortless. Schedulyn brings independent professionals and the people who need their expertise closer together.",
  },

  story: {
    eyebrow: "The idea",
    heading: "A better way to connect.",
    paragraphs: [
      "Finding a reliable professional shouldn't be complicated. And running an independent service business shouldn't mean juggling endless conversations, scattered bookings and administrative work.",
      "We believe both sides deserve a simpler experience. One where discovering services, connecting with professionals and managing bookings feels natural.",
    ],
  },

  mission: {
    eyebrow: "Our mission",
    heading: "Make room for the work that matters.",
    description:
      "We're building a platform that helps independent professionals present their services, connect with customers and manage their bookings, while making it easier for customers to discover services that fit their needs.",
  },

  values: {
    eyebrow: "What we believe",
    heading: "The principles behind Schedulyn.",
    description:
      "The best experiences are built around people. These principles guide how we approach the platform.",
  },
} as const;

export interface AboutValue {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const ABOUT_VALUES: AboutValue[] = [
  {
    title: "People first",
    description:
      "Technology should make human connections easier, not get in the way.",
    icon: Users,
  },
  {
    title: "Simplicity",
    description:
      "Less friction, clearer experiences and more time for meaningful work.",
    icon: Lightbulb,
  },
  {
    title: "Opportunity",
    description:
      "Independent professionals deserve the space and tools to grow.",
    icon: HeartHandshake,
  },
  {
    title: "Trust",
    description:
      "Good experiences begin with clarity, consistency and confidence.",
    icon: ShieldCheck,
  },
];
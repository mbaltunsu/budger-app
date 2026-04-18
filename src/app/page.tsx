import type { Metadata } from "next";
import Landing from "./_landing/landing";

export const metadata: Metadata = {
  title: "budger — your money, finally clear",
  description: "Track income, bills, subscriptions and expenses in one place. See your disposable income every day.",
};

export default function HomePage() {
  return <Landing />;
}

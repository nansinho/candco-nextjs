"use client";

import dynamic from "next/dynamic";

// Lazy load widgets côté client - améliore le First Contentful Paint
const AccessibilityWidget = dynamic(
  () =>
    import("@/components/AccessibilityWidget").then(
      (mod) => mod.AccessibilityWidget
    ),
  { ssr: false }
);

const ChatWidget = dynamic(
  () => import("@/components/chat/ChatWidget").then((mod) => mod.ChatWidget),
  { ssr: false }
);

const ScrollToTop = dynamic(
  () => import("@/components/ScrollToTop").then((mod) => mod.ScrollToTop),
  { ssr: false }
);

const CookieBanner = dynamic(
  () => import("@/components/CookieBanner").then((mod) => mod.CookieBanner),
  { ssr: false }
);

export function ClientWidgets() {
  return (
    <>
      <AccessibilityWidget />
      <ChatWidget />
      <ScrollToTop />
      <CookieBanner />
    </>
  );
}

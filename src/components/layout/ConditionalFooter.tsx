"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";

const ConditionalFooter = () => {
  const pathname = usePathname();

  // Do not render the footer on any of the tool pages.
  if (pathname.includes("/tools")) {
    return null;
  }

  return <Footer />;
};

export default ConditionalFooter;

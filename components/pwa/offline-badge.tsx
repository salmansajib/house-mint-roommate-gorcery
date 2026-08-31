"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { WifiOff, RefreshCw } from "lucide-react";
import { Text } from "@/components/ui/typography";

interface OfflineBadgeProps {
  isOnline: boolean;
}

export function OfflineBadge({ isOnline }: OfflineBadgeProps) {
  // Retired in favor of the clean sub-header banner in Navbar that does not obstruct header controls
  return null;
}

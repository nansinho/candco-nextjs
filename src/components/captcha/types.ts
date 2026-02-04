import type { LucideIcon } from "lucide-react";

export interface CaptchaChallenge {
  word: string;
  icon: LucideIcon;
}

export interface CaptchaState {
  status: "idle" | "verifying" | "success" | "failed";
  step: 1 | 2;
  challenge: GeneratedChallenge | null;
}

export interface GeneratedChallenge {
  word: string;
  correctIndex: number;
  icons: LucideIcon[];
}

export interface IconCaptchaProps {
  onVerify: (verified: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export interface CaptchaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: 1 | 2;
  challenge: GeneratedChallenge;
  onIconClick: (index: number) => void;
  onRefresh: () => void;
  isShaking: boolean;
}

export interface CaptchaIconGridProps {
  icons: LucideIcon[];
  onIconClick: (index: number) => void;
  disabled?: boolean;
}

import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TruncatedTextProps {
  children: React.ReactNode;
  className?: string;
  /** Number of lines before truncation (1 = single line truncate, 2+ = line-clamp) */
  lines?: 1 | 2 | 3;
  /** Max width for the container */
  maxWidth?: string;
  /** Whether to show tooltip on hover */
  showTooltip?: boolean;
}

/**
 * TruncatedText - A component that truncates text and shows full text on hover
 *
 * Usage:
 * <TruncatedText lines={2} maxWidth="200px">Long text here...</TruncatedText>
 */
export function TruncatedText({
  children,
  className,
  lines = 1,
  maxWidth = "200px",
  showTooltip = true,
}: TruncatedTextProps) {
  const textRef = React.useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = React.useState(false);

  React.useEffect(() => {
    const element = textRef.current;
    if (element) {
      // Check if text is actually truncated
      const isOverflowing =
        element.scrollWidth > element.clientWidth ||
        element.scrollHeight > element.clientHeight;
      setIsTruncated(isOverflowing);
    }
  }, [children]);

  const lineClampClass =
    lines === 1 ? "truncate" :
    lines === 2 ? "line-clamp-2" :
    "line-clamp-3";

  const textElement = (
    <span
      ref={textRef}
      className={cn(
        lineClampClass,
        "block",
        className
      )}
      style={{ maxWidth }}
    >
      {children}
    </span>
  );

  if (!showTooltip || !isTruncated) {
    return textElement;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          {textElement}
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[300px] text-sm"
          sideOffset={5}
        >
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

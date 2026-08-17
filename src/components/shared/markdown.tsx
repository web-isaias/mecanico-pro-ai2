"use client";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export function Markdown({ content, className }: { content: string; className?: string }) {
  return (
    <div
      className={cn(
        "prose prose-invert prose-sm max-w-none [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-orange-400 [&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:my-1.5 [&_p]:leading-relaxed [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_strong]:text-foreground [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-orange-500/10 [&_code]:px-1 [&_code]:text-orange-300 [&_pre]:rounded-lg [&_pre]:bg-background/60 [&_pre]:p-3 [&_pre]:text-xs [&_a]:text-orange-400",
        className
      )}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

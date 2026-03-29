"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/core/ui/accordion";
import { Text } from "@/core/primitives";

interface FaqItemProps {
  question: string;
  answer: string;
  value: string;
}

export function FaqItem({ question, answer, value }: FaqItemProps) {
  return (
    <AccordionItem value={value} className="border-border">
      <AccordionTrigger className="text-left text-base font-medium hover:text-primary hover:no-underline">
        {question}
      </AccordionTrigger>
      <AccordionContent>
        <Text className="text-sm text-muted-foreground leading-relaxed pb-2">
          {answer}
        </Text>
      </AccordionContent>
    </AccordionItem>
  );
}

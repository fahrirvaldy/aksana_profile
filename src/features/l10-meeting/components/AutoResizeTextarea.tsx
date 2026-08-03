
"use client";

import React, { useEffect, useRef } from "react";

interface AutoResizeTextareaProps {
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; 
  placeholder?: string; 
  className?: string;
  rows?: number;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
}

export const AutoResizeTextarea = React.forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>((
  { value, onChange, placeholder, className, rows = 1, onBlur, disabled }, 
  ref
) => {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const resolvedRef = ref || internalRef;

  const adjustHeight = (element: HTMLTextAreaElement | null) => {
    if (element) {
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (typeof resolvedRef === 'object' && resolvedRef.current) {
      adjustHeight(resolvedRef.current);
    }
  }, [value, resolvedRef]);

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    adjustHeight(e.currentTarget);
  };

  return (
    <textarea
      ref={resolvedRef}
      value={value}
      onChange={onChange}
      onInput={handleInput}
      onBlur={onBlur}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={`${className} resize-none overflow-hidden w-full`}
    />
  );
});

AutoResizeTextarea.displayName = "AutoResizeTextarea";

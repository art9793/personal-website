import { useEffect, useRef } from 'react';

interface TitleFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  'data-testid'?: string;
}

export function TitleField({
  value,
  onChange,
  placeholder = 'Untitled',
  className = '',
  'data-testid': testId,
}: TitleFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea to fit content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    // Set height to scrollHeight to fit content
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className={`w-full resize-none overflow-hidden bg-transparent border-none outline-none focus:outline-none text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight placeholder:text-muted-foreground/30 ${className}`}
      data-testid={testId}
    />
  );
}

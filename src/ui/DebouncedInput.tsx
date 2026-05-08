import React, { useState, useEffect, useRef } from 'react';

interface DebouncedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
}

export function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 400,
  type = 'text',
  ...props
}: DebouncedInputProps) {
  const [value, setValue] = useState(initialValue);
  const prevValueRef = useRef(initialValue);

  // Sync only if external value actually changes
  useEffect(() => {
    if (initialValue !== prevValueRef.current) {
      setValue(initialValue);
      prevValueRef.current = initialValue;
    }
  }, [initialValue]);

  // Debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (value !== prevValueRef.current) {
        prevValueRef.current = value;
        onChange(value);
      }
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce]); // ❌ removed onChange from deps

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = type === 'number' ? Number(e.target.value) : e.target.value;
    setValue(val);
  };

  return (
    <input
      {...props}
      type={type}
      value={value}
      onChange={handleChange}
    />
  );
}
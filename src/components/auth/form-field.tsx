"use client";

import type { AnyFieldApi } from "@tanstack/react-form";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function FormField({
  field,
  label,
  hint,
  serverError,
  ...props
}: {
  field: AnyFieldApi;
  label: string;
  hint?: string;
  serverError?: string;
} & Omit<React.ComponentProps<"input">, "value" | "onChange" | "onBlur">) {
  const touched = field.state.meta.isTouched;
  const error = touched ? field.state.meta.errors[0] : undefined;
  const message =
    (typeof error === "string" ? error : error?.message) ?? serverError;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={field.name}
        className="text-[13px] font-medium text-foreground"
      >
        {label}
      </label>

      <Input
        {...props}
        id={field.name}
        name={field.name}
        value={field.state.value as string}
        onChange={(event) => field.handleChange(event.target.value)}
        onBlur={field.handleBlur}
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? `${field.name}-error` : undefined}
        className={cn(props.className)}
      />

      {message ? (
        <p
          id={`${field.name}-error`}
          role="alert"
          className="text-[12px] text-destructive"
        >
          {message}
        </p>
      ) : hint ? (
        <p className="text-[12px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { ApiRequestError } from "@/lib/api";
import { login, loginSchema } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: loginSchema },
    onSubmit: async ({ value }) => {
      setFormError(null);
      setFieldErrors({});

      try {
        await login(value);
        router.push("/");
      } catch (error) {
        if (error instanceof ApiRequestError) {
          setFieldErrors(error.fieldErrors());
          setFormError(error.message);
          return;
        }
        setFormError("Could not reach the server");
      }
    },
  });

  return (
    <AuthShell
      title="Sign in"
      subtitle="Pick up where you and your agents left off."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="text-foreground underline-offset-4 hover:underline">
            Create a workspace
          </Link>
        </>
      }
    >
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <form.Field name="email">
          {(field) => (
            <FormField
              field={field}
              label="Email"
              type="email"
              placeholder="you@acme.com"
              autoComplete="email"
              autoFocus
              serverError={fieldErrors.email}
            />
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <FormField
              field={field}
              label="Password"
              type="password"
              autoComplete="current-password"
              serverError={fieldErrors.password}
            />
          )}
        </form.Field>

        {formError && (
          <p role="alert" className="text-[12px] text-destructive">
            {formError}
          </p>
        )}

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </AuthShell>
  );
}

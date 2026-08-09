"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";

import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ApiRequestError } from "@/lib/api";
import { keys } from "@/lib/queries";
import { signup, signupSchema } from "@/lib/auth";

export default function SignupPage() {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const form = useForm({
    defaultValues: {
      displayName: "",
      orgName: "",
      email: "",
      password: "",
    },
    validators: { onSubmit: signupSchema },
    onSubmit: async ({ value }) => {
      setFormError(null);
      setFieldErrors({});

      try {
        const result = await signup(value);
        queryClient.setQueryData(keys.session, result);
        window.location.replace("/");
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
      title="Create your workspace"
      subtitle="One account for you, one room for your team and its agents."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
            Sign in
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
        <form.Field name="displayName">
          {(field) => (
            <FormField
              field={field}
              label="Your name"
              placeholder="Pavan"
              autoComplete="name"
              autoFocus
              serverError={fieldErrors.displayName}
            />
          )}
        </form.Field>

        <form.Field name="orgName">
          {(field) => (
            <FormField
              field={field}
              label="Organisation"
              placeholder="Acme"
              hint="You can rename this later."
              autoComplete="organization"
              serverError={fieldErrors.orgName}
            />
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <FormField
              field={field}
              label="Work email"
              type="email"
              placeholder="you@acme.com"
              autoComplete="email"
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
              placeholder="At least 10 characters"
              autoComplete="new-password"
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
              {isSubmitting && <Spinner />}
              Create workspace
            </Button>
          )}
        </form.Subscribe>
      </form>
    </AuthShell>
  );
}

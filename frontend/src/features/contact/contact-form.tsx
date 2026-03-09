import { useState } from 'react';
import { type StandardSchemaV1Issue, useForm } from '@tanstack/react-form';
import { AlertCircleIcon, MailCheck } from 'lucide-react';
import { z } from 'zod';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// ── Schema ────────────────────────────────────────────────────────────────────

const contactSchema = z.object({
  name: z.string().min(2, 'Name too short').max(80, 'Name too long').trim(),
  email: z.email('Invalid email').max(120).trim(),
  title: z
    .string()
    .min(3, 'Subject too short')
    .max(120, 'Subject too long')
    .trim(),
  message: z
    .string()
    .min(10, 'Message too short')
    .max(5000, 'Message too long')
    .trim(),
  website: z.string().max(0), // spam honeypot – must stay empty
});

type ContactPayload = z.infer<typeof contactSchema>;

// ── API call ──────────────────────────────────────────────────────────────────

const EDGE_FN_URL =
  'https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/contact-form';

async function submitContactForm(data: ContactPayload) {
  const res = await fetch(EDGE_FN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? 'Submission failed');
  }
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function FieldError({
  errors,
}: {
  errors: (StandardSchemaV1Issue | undefined)[];
}) {
  const message = errors.find(e => e !== undefined)?.message;
  if (!message) return null;
  return <p className="ml-3 text-xs text-destructive">{message}</p>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      title: '',
      message: '',
      website: '', // honeypot
    },
    validators: {
      onSubmit: contactSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        await submitContactForm(value);
        setStatus('success');
        form.reset();
      } catch (err) {
        setServerError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('error');
      }
    },
  });

  if (status === 'success') {
    return (
      <Empty className="pt-6">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MailCheck />
          </EmptyMedia>
          <EmptyTitle>Message received</EmptyTitle>
          <EmptyDescription>
            We&apos;ll reach out to you as soon as possible
          </EmptyDescription>
          <EmptyContent>
            <Button
              variant="secondary"
              className="mt-6 cursor-pointer"
              onClick={() => setStatus('idle')}
            >
              Send another
            </Button>
          </EmptyContent>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <form
      noValidate
      className="space-y-6"
      onSubmit={e => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      {/* Name */}
      <form.Field
        name="name"
        validators={{
          onChange: contactSchema.shape.name,
        }}
      >
        {field => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Name</Label>
            <Input
              id={field.name}
              name={field.name}
              className="shadow-none"
              placeholder="Your name"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={e => field.handleChange(e.target.value)}
            />
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      {/* Email */}
      <form.Field
        name="email"
        validators={{
          onChange: contactSchema.shape.email,
        }}
      >
        {field => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Email</Label>
            <Input
              type="email"
              id={field.name}
              name={field.name}
              className="shadow-none"
              value={field.state.value}
              onBlur={field.handleBlur}
              placeholder="you@example.com"
              onChange={e => field.handleChange(e.target.value)}
            />
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      {/* Title / Subject */}
      <form.Field
        name="title"
        validators={{
          onChange: contactSchema.shape.title,
        }}
      >
        {field => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Subject</Label>
            <Input
              id={field.name}
              name={field.name}
              className="shadow-none"
              value={field.state.value}
              onBlur={field.handleBlur}
              placeholder="What's this about?"
              onChange={e => field.handleChange(e.target.value)}
            />
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      {/* Message */}
      <form.Field
        name="message"
        validators={{
          onChange: contactSchema.shape.message,
        }}
      >
        {field => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Message</Label>
            <Textarea
              rows={6}
              id={field.name}
              name={field.name}
              className="shadow-none"
              value={field.state.value}
              onBlur={field.handleBlur}
              placeholder="Write your message..."
              onChange={e => field.handleChange(e.target.value)}
            />
            <div className="flex items-start justify-between">
              <FieldError errors={field.state.meta.errors} />
              <span className="ml-auto text-xs">
                {field.state.value.length} / 5000
              </span>
            </div>
          </div>
        )}
      </form.Field>

      {/* Spam Honeypot – visually hidden */}
      <form.Field name="website">
        {field => (
          <input
            type="text"
            tabIndex={-1}
            name={field.name}
            autoComplete="off"
            aria-hidden="true"
            value={field.state.value}
            onChange={e => field.handleChange(e.target.value)}
            className="absolute -left-2499.75 h-0 w-0 overflow-hidden opacity-0"
          />
        )}
      </form.Field>

      {/* Server error */}
      {status === 'error' && serverError && (
        <Alert className="mb-8" variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Submit failed</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {/* Submit */}
      <form.Subscribe selector={s => [s.canSubmit, s.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            className="cursor-pointer"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? 'Sending…' : 'Send message'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}

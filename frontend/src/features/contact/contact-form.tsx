import { useState } from 'react';
import { type StandardSchemaV1Issue, useForm } from '@tanstack/react-form';
import { AlertCircleIcon, MailCheck } from 'lucide-react';
import { z } from 'zod';

import { supabase } from '@/lib/supabase';
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
  subject: z
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
  formLoadedAt: z.number(),
});

type ContactPayload = z.infer<typeof contactSchema>;

// ── API call ──────────────────────────────────────────────────────────────────

async function submitContactForm(data: ContactPayload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const { data: result, error } = await supabase.functions.invoke(
      'contact-form',
      {
        body: data,
        signal: controller.signal,
      },
    );

    if (error) {
      const errorData = error.context
        ? await error.context.json().catch(() => ({}))
        : {};
      throw new Error(errorData.error || error.message || 'Submission failed');
    }

    return result;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
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
  const [formLoadedAt] = useState(() => Date.now());

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      website: '', // spam honeypot
      formLoadedAt,
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

      {/* Subject */}
      <form.Field
        name="subject"
        validators={{
          onChange: contactSchema.shape.subject,
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

import { createClient } from '@supabase/supabase-js';

Deno.serve(async req => {
  try {
    const { id } = await req.json();

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Get full message
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error(error);
      return new Response('Message not found', { status: 404 });
    }

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MTG Faction <onboarding@resend.dev>',
        to: Deno.env.get('CONTACT_NOTIFICATION_EMAIL'),
        subject: `New message: ${data.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 24px; max-width: 620px; color: #111;">
            
            <h2 style="margin-bottom: 6px;">New contact message</h2>

            <p style="margin: 0 0 20px 0; color: #666;">
              A new message has been submitted from the website.
            </p>

            <div style="border: 1px solid #e5e5e5; border-radius: 10px; padding: 18px; margin-bottom: 20px;">
              <p style="margin: 0 0 8px 0;"><strong>Name</strong><br/>${data.name}</p>
              <p style="margin: 0 0 8px 0;"><strong>Email</strong><br/>${data.email}</p>
              <p style="margin: 0 0 8px 0;"><strong>Subject</strong><br/>${data.subject}</p>
              <p style="margin: 0;"><strong>Sent at</strong><br/>${new Date(data.created_at).toLocaleString()}</p>
            </div>

            <div style="border: 1px solid #e5e5e5; border-radius: 10px; padding: 18px; background: #fafafa; margin-bottom: 18px;">
              <p style="margin: 0 0 8px 0;"><strong>Message</strong></p>
              <p style="margin: 0; white-space: pre-line;">${data.message}</p>
            </div>

          </div>
        `,
      }),
    });

    if (!res.ok) {
      console.error(await res.text());
      return new Response('Email failed', { status: 500 });
    }

    return new Response('Email sent', { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response('Error', { status: 500 });
  }
});

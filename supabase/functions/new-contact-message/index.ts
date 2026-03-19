import { Resend } from 'resend';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

Deno.serve(async req => {
  try {
    const { record } = await req.json();

    const { error } = await resend.emails.send({
      from: 'MTG Faction <onboarding@resend.dev>',
      to: Deno.env.get('CONTACT_NOTIFICATION_EMAIL')!,
      subject: `New message: ${record.subject}`,
      html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 24px; max-width: 620px; color: #111;">
            
            <h2 style="margin-bottom: 6px;">New contact message</h2>

            <p style="margin: 0 0 20px 0; color: #666;">
              A new message has been submitted from the website.
            </p>

            <div style="border: 1px solid #e5e5e5; border-radius: 10px; padding: 18px; margin-bottom: 20px;">
              <p style="margin: 0 0 8px 0;"><strong>Name</strong><br/>${record.name}</p>
              <p style="margin: 0 0 8px 0;"><strong>Email</strong><br/>${record.email}</p>
              <p style="margin: 0 0 8px 0;"><strong>Subject</strong><br/>${record.subject}</p>
              <p style="margin: 0;"><strong>Sent at</strong><br/>${new Date(record.created_at).toLocaleString()}</p>
            </div>

            <div style="border: 1px solid #e5e5e5; border-radius: 10px; padding: 18px; background: #fafafa; margin-bottom: 18px;">
              <p style="margin: 0 0 8px 0;"><strong>Message</strong></p>
              <p style="margin: 0; white-space: pre-line;">${record.message}</p>
            </div>

          </div>
        `,
    });

    if (error) {
      console.error(error);
      return new Response('Email failed', { status: 500 });
    }

    return new Response('Email sent', { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response('Error', { status: 500 });
  }
});

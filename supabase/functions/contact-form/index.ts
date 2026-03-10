import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message, website, formLoadedAt } =
      await req.json();

    // get ip address
    const forwardedFor =
      req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0] ?? 'unknown';

    // honeypot spam protection
    if (website) {
      return new Response(JSON.stringify({ error: 'Spam detected' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // validation
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: corsHeaders },
      );
    }

    if (
      name.length > 80 ||
      email.length > 120 ||
      subject.length > 120 ||
      message.length > 5000
    ) {
      return new Response(JSON.stringify({ error: 'Invalid input length' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // speed limit
    const now = Date.now();
    const timeTaken = now - formLoadedAt;

    if (timeTaken < 3000) {
      return new Response(JSON.stringify({ error: 'Submission too fast' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // insert into database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { error } = await supabase.rpc('insert_contact_message', {
      p_name: name,
      p_email: email,
      p_subject: subject,
      p_message: message,
      p_ip: ip,
    });

    if (error) {
      if (error.message.includes('Rate limit')) {
        return new Response(
          JSON.stringify({ error: 'Too many submissions. Try later.' }),
          { status: 429, headers: corsHeaders },
        );
      }

      throw error;
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});

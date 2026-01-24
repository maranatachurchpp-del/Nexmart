import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5;

// Persistent rate limiting using database (survives cold starts / multiple instances)
async function checkAndIncrementRateLimit(
  supabase: ReturnType<typeof createClient>,
  key: string
): Promise<boolean> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + RATE_LIMIT_WINDOW_MS);

  // Upsert: increment count if within window, reset if expired
  const { data, error } = await supabase.rpc('upsert_rate_limit', {
    p_key: key,
    p_max_count: MAX_REQUESTS_PER_WINDOW,
    p_reset_at: resetAt.toISOString(),
  });

  if (error) {
    console.error('Rate limit check failed:', error.message);
    // Fail open on error (allow request) but log for monitoring
    return false;
  }

  // data = true means rate limited
  return data === true;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

function isSuspiciousSubmission(metadata: unknown): boolean {
  if (!metadata || typeof metadata !== 'object') return false;
  const m = metadata as Record<string, unknown>;

  // Honeypot (should always be empty)
  const hp = typeof m.hp === 'string' ? m.hp.trim() : '';
  if (hp.length > 0) return true;

  // Minimum time on page/form (ms) - blocks obvious bots
  const elapsed = typeof m.elapsed_ms === 'number' ? m.elapsed_ms : NaN;
  if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < 800) return true;

  return false;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown';

    // Create Supabase client with service role (bypasses RLS for rate limit table)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check persistent rate limit (survives cold starts)
    const isLimited = await checkAndIncrementRateLimit(supabase, `ip:${clientIP}`);
    if (isLimited) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const { email, source, metadata } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate source (optional, but sanitize)
    const sanitizedSource = typeof source === 'string' ? source.slice(0, 50) : 'landing';

    // Validate metadata (optional, but limit size)
    let sanitizedMetadata = {};
    if (metadata && typeof metadata === 'object') {
      const metadataStr = JSON.stringify(metadata);
      if (metadataStr.length <= 1000) {
        sanitizedMetadata = metadata;
      }
    }

    // Basic bot mitigation (mirrors frontend checks)
    if (isSuspiciousSubmission(sanitizedMetadata)) {
      return new Response(
        JSON.stringify({ error: 'Invalid submission' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert lead
    const { data, error } = await supabase
      .from('leads')
      .insert({
        email: normalizedEmail,
        source: sanitizedSource,
        metadata: sanitizedMetadata
      })
      .select('id')
      .single();

    if (error) {
      // Handle duplicate email
      if (error.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'duplicate', message: 'Email already registered' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const { code, state } = await req.json()

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.fitbit.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${Deno.env.get('FITBIT_CLIENT_ID')}:${Deno.env.get('FITBIT_CLIENT_SECRET')}`)}`,
      },
      body: new URLSearchParams({
        client_id: Deno.env.get('FITBIT_CLIENT_ID')!,
        grant_type: 'authorization_code',
        redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/fitbit-oauth`,
        code: code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error('Fitbit token error:', tokenData)
      return new Response(JSON.stringify({ error: 'Failed to get access token' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get user profile to get device info
    const profileResponse = await fetch('https://api.fitbit.com/1/user/-/profile.json', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    })

    const profileData = await profileResponse.json()

    // Store connection in database
    const { error } = await supabaseClient
      .from('health_tracker_connections')
      .upsert({
        user_id: user.id,
        provider: 'fitbit',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        device_id: profileData.user?.encodedId || 'fitbit_primary',
        device_name: 'Fitbit Account',
        settings: {
          scope: tokenData.scope,
          user_id: profileData.user?.encodedId,
        },
      })

    if (error) {
      console.error('Database error:', error)
      return new Response(JSON.stringify({ error: 'Failed to save connection' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

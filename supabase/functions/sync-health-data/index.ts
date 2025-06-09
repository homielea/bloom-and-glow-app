
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SyncResult {
  provider: string
  recordsSynced: number
  error?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { connectionId, days = 7 } = await req.json()

    // Get connection details
    const { data: connection, error: connectionError } = await supabaseClient
      .from('health_tracker_connections')
      .select('*')
      .eq('id', connectionId)
      .single()

    if (connectionError || !connection) {
      return new Response(JSON.stringify({ error: 'Connection not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create sync log entry
    const { data: syncLog } = await supabaseClient
      .from('health_tracker_sync_logs')
      .insert({
        connection_id: connectionId,
        sync_status: 'running',
      })
      .select()
      .single()

    let result: SyncResult

    try {
      if (connection.provider === 'fitbit') {
        result = await syncFitbitData(connection, days, supabaseClient)
      } else if (connection.provider === 'oura') {
        result = await syncOuraData(connection, days, supabaseClient)
      } else {
        throw new Error(`Unsupported provider: ${connection.provider}`)
      }

      // Update sync log as completed
      await supabaseClient
        .from('health_tracker_sync_logs')
        .update({
          sync_status: 'completed',
          sync_completed_at: new Date().toISOString(),
          records_synced: result.recordsSynced,
        })
        .eq('id', syncLog?.id)

      // Update connection last sync
      await supabaseClient
        .from('health_tracker_connections')
        .update({
          last_sync_at: new Date().toISOString(),
          sync_status: 'active',
          sync_error_message: null,
        })
        .eq('id', connectionId)

    } catch (error) {
      // Update sync log as failed
      await supabaseClient
        .from('health_tracker_sync_logs')
        .update({
          sync_status: 'failed',
          sync_completed_at: new Date().toISOString(),
          error_message: error.message,
        })
        .eq('id', syncLog?.id)

      // Update connection status
      await supabaseClient
        .from('health_tracker_connections')
        .update({
          sync_status: 'error',
          sync_error_message: error.message,
        })
        .eq('id', connectionId)

      result = {
        provider: connection.provider,
        recordsSynced: 0,
        error: error.message,
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Sync error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function syncFitbitData(connection: any, days: number, supabaseClient: any): Promise<SyncResult> {
  let recordsSynced = 0
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000))

  // Sync sleep data
  const sleepResponse = await fetch(
    `https://api.fitbit.com/1.2/user/-/sleep/date/${startDate.toISOString().split('T')[0]}/${endDate.toISOString().split('T')[0]}.json`,
    {
      headers: { 'Authorization': `Bearer ${connection.access_token}` },
    }
  )

  if (sleepResponse.ok) {
    const sleepData = await sleepResponse.json()
    for (const sleep of sleepData.sleep) {
      await supabaseClient
        .from('health_tracker_data')
        .upsert({
          connection_id: connection.id,
          data_type: 'sleep',
          recorded_date: sleep.dateOfSleep,
          value: sleep.efficiency,
          metadata: {
            duration: sleep.duration,
            minutesAsleep: sleep.minutesAsleep,
            minutesAwake: sleep.minutesAwake,
          },
          raw_data: sleep,
        })
      recordsSynced++
    }
  }

  // Sync heart rate data
  for (let i = 0; i < days; i++) {
    const date = new Date(endDate.getTime() - (i * 24 * 60 * 60 * 1000))
    const dateString = date.toISOString().split('T')[0]

    const hrResponse = await fetch(
      `https://api.fitbit.com/1/user/-/activities/heart/date/${dateString}/1d.json`,
      {
        headers: { 'Authorization': `Bearer ${connection.access_token}` },
      }
    )

    if (hrResponse.ok) {
      const hrData = await hrResponse.json()
      if (hrData['activities-heart']?.[0]?.value?.restingHeartRate) {
        await supabaseClient
          .from('health_tracker_data')
          .upsert({
            connection_id: connection.id,
            data_type: 'heart_rate',
            recorded_date: dateString,
            value: hrData['activities-heart'][0].value.restingHeartRate,
            metadata: {
              type: 'resting',
              zones: hrData['activities-heart'][0].value.heartRateZones,
            },
            raw_data: hrData,
          })
        recordsSynced++
      }
    }
  }

  return { provider: 'fitbit', recordsSynced }
}

async function syncOuraData(connection: any, days: number, supabaseClient: any): Promise<SyncResult> {
  let recordsSynced = 0
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000))

  // Sync sleep data
  const sleepResponse = await fetch(
    `https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`,
    {
      headers: { 'Authorization': `Bearer ${connection.access_token}` },
    }
  )

  if (sleepResponse.ok) {
    const sleepData = await sleepResponse.json()
    for (const sleep of sleepData.data) {
      await supabaseClient
        .from('health_tracker_data')
        .upsert({
          connection_id: connection.id,
          data_type: 'sleep',
          recorded_date: sleep.day,
          value: sleep.score,
          metadata: {
            efficiency: sleep.efficiency,
            duration: sleep.total_sleep_duration,
            deep_sleep: sleep.deep_sleep_duration,
            rem_sleep: sleep.rem_sleep_duration,
          },
          raw_data: sleep,
        })
      recordsSynced++
    }
  }

  // Sync HRV data
  const hrvResponse = await fetch(
    `https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`,
    {
      headers: { 'Authorization': `Bearer ${connection.access_token}` },
    }
  )

  if (hrvResponse.ok) {
    const hrvData = await hrvResponse.json()
    for (const hrv of hrvData.data) {
      if (hrv.average_hrv) {
        await supabaseClient
          .from('health_tracker_data')
          .upsert({
            connection_id: connection.id,
            data_type: 'hrv',
            recorded_date: hrv.day,
            value: hrv.average_hrv,
            metadata: {
              score: hrv.score,
              temperature_deviation: hrv.temperature_deviation,
            },
            raw_data: hrv,
          })
        recordsSynced++
      }
    }
  }

  return { provider: 'oura', recordsSynced }
}


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, Heart, Activity, Moon, Thermometer, Target, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '../contexts/AppContext';
import { DailyCheckIn } from '../types';
import { AnalyticsEngine, CorrelationResult } from '../utils/analyticsEngine';

interface BiometricTrend {
  date: string;
  heartRate: number;
  hrv: number;
  sleepScore: number;
  temperature: number;
  recovery: number;
}

interface HealthZone {
  name: string;
  range: [number, number];
  color: string;
  description: string;
}

// Transform database row to DailyCheckIn interface
const transformDailyCheckIn = (dbRow: any): DailyCheckIn => ({
  id: dbRow.id,
  userId: dbRow.user_id,
  date: dbRow.date,
  mood: dbRow.mood,
  energy: dbRow.energy,
  libido: dbRow.libido,
  sleep: dbRow.sleep,
  stress: dbRow.stress,
  bodyTemperature: dbRow.body_temperature,
  notes: dbRow.notes,
  moodSource: dbRow.mood_source,
  energySource: dbRow.energy_source,
  sleepSource: dbRow.sleep_source,
  stressSource: dbRow.stress_source,
  bodyTemperatureSource: dbRow.body_temperature_source,
  trackerSleepScore: dbRow.tracker_sleep_score,
  trackerHrv: dbRow.tracker_hrv,
  trackerRestingHr: dbRow.tracker_resting_hr,
});

const AdvancedBiometricAnalysis: React.FC = () => {
  const [biometricData, setBiometricData] = useState<BiometricTrend[]>([]);
  const [correlations, setCorrelations] = useState<CorrelationResult[]>([]);
  const [healthZones, setHealthZones] = useState<HealthZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'heartRate' | 'hrv' | 'sleepScore' | 'temperature'>('heartRate');
  const { session } = useApp();

  useEffect(() => {
    if (session?.user?.id) {
      loadBiometricAnalysis();
    }
  }, [session?.user?.id]);

  const loadBiometricAnalysis = async () => {
    setLoading(true);
    try {
      // Load health tracker data
      const { data: connections } = await supabase
        .from('health_tracker_connections')
        .select('id')
        .eq('sync_status', 'active');

      if (connections?.length) {
        const { data: trackerData } = await supabase
          .from('health_tracker_data')
          .select('*')
          .in('connection_id', connections.map(c => c.id))
          .gte('recorded_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('recorded_date', { ascending: true });

        // Load daily check-ins for correlation analysis
        const { data: checkIns } = await supabase
          .from('daily_checkins')
          .select('*')
          .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .order('date', { ascending: true });

        if (trackerData && checkIns) {
          const processedData = processBiometricData(trackerData);
          setBiometricData(processedData);

          // Transform check-ins and generate correlations
          const transformedCheckIns = checkIns.map(transformDailyCheckIn);
          const correlationResults = AnalyticsEngine.analyzeCorrelations(transformedCheckIns);
          setCorrelations(correlationResults);

          // Set up health zones
          setupHealthZones();
        }
      }
    } catch (error) {
      console.error('Error loading biometric analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const processBiometricData = (rawData: any[]): BiometricTrend[] => {
    const dataByDate: { [date: string]: Partial<BiometricTrend> } = {};

    rawData.forEach(item => {
      const date = item.recorded_date;
      if (!dataByDate[date]) {
        dataByDate[date] = { date };
      }

      switch (item.data_type) {
        case 'heart_rate':
          dataByDate[date].heartRate = item.value;
          break;
        case 'hrv':
          dataByDate[date].hrv = item.value;
          break;
        case 'sleep':
          dataByDate[date].sleepScore = item.value;
          break;
        case 'temperature':
          dataByDate[date].temperature = item.value;
          break;
      }
    });

    // Calculate recovery score based on HRV and sleep
    return Object.values(dataByDate).map(day => ({
      date: day.date || '',
      heartRate: day.heartRate || 0,
      hrv: day.hrv || 0,
      sleepScore: day.sleepScore || 0,
      temperature: day.temperature || 98.6,
      recovery: calculateRecoveryScore(day.hrv || 0, day.sleepScore || 0)
    })).filter(day => day.date);
  };

  const calculateRecoveryScore = (hrv: number, sleepScore: number): number => {
    // Simple recovery calculation based on HRV and sleep quality
    const hrvScore = Math.min(hrv / 50 * 50, 50); // HRV contribution (0-50)
    const sleepContribution = sleepScore / 2; // Sleep contribution (0-50)
    return Math.round(hrvScore + sleepContribution);
  };

  const setupHealthZones = () => {
    const zones: HealthZone[] = [
      {
        name: 'Recovery Zone',
        range: [50, 60],
        color: '#10B981',
        description: 'Optimal for recovery and light activity'
      },
      {
        name: 'Aerobic Zone',
        range: [60, 70],
        color: '#3B82F6',
        description: 'Builds aerobic capacity and endurance'
      },
      {
        name: 'Anaerobic Zone',
        range: [70, 85],
        color: '#F59E0B',
        description: 'Improves performance and power'
      },
      {
        name: 'Max Effort Zone',
        range: [85, 100],
        color: '#EF4444',
        description: 'Maximum intensity training'
      }
    ];
    setHealthZones(zones);
  };

  const getMetricStats = (metric: keyof BiometricTrend) => {
    if (biometricData.length === 0) return { avg: 0, min: 0, max: 0, trend: 'stable' };

    const values = biometricData.map(d => d[metric] as number).filter(v => v > 0);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Simple trend calculation
    const recent = values.slice(-7);
    const older = values.slice(-14, -7);
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
    const trend = recentAvg > olderAvg ? 'up' : recentAvg < olderAvg ? 'down' : 'stable';

    return { avg: Math.round(avg), min, max, trend };
  };

  const getCorrelationIcon = (correlation: number) => {
    if (Math.abs(correlation) > 0.7) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (Math.abs(correlation) > 0.4) return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    return <div className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Analyzing your biometric data...</p>
        </CardContent>
      </Card>
    );
  }

  const stats = getMetricStats(selectedMetric);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Advanced Biometric Analysis
          </CardTitle>
          <CardDescription>
            Deep insights into your health patterns and correlations
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
          <TabsTrigger value="zones">Health Zones</TabsTrigger>
          <TabsTrigger value="recovery">Recovery</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Button
              variant={selectedMetric === 'heartRate' ? 'default' : 'outline'}
              onClick={() => setSelectedMetric('heartRate')}
              className="flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Heart Rate
            </Button>
            <Button
              variant={selectedMetric === 'hrv' ? 'default' : 'outline'}
              onClick={() => setSelectedMetric('hrv')}
              className="flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              HRV
            </Button>
            <Button
              variant={selectedMetric === 'sleepScore' ? 'default' : 'outline'}
              onClick={() => setSelectedMetric('sleepScore')}
              className="flex items-center gap-2"
            >
              <Moon className="w-4 h-4" />
              Sleep
            </Button>
            <Button
              variant={selectedMetric === 'temperature' ? 'default' : 'outline'}
              onClick={() => setSelectedMetric('temperature')}
              className="flex items-center gap-2"
            >
              <Thermometer className="w-4 h-4" />
              Temperature
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.avg}</div>
                <div className="text-sm text-muted-foreground">Average</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.min}</div>
                <div className="text-sm text-muted-foreground">Minimum</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.max}</div>
                <div className="text-sm text-muted-foreground">Maximum</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className={`w-4 h-4 ${stats.trend === 'up' ? 'text-green-600' : stats.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`} />
                  <div className="text-sm capitalize">{stats.trend}</div>
                </div>
                <div className="text-sm text-muted-foreground">Trend</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="capitalize">{selectedMetric.replace(/([A-Z])/g, ' $1').trim()} Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={biometricData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey={selectedMetric} 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlations" className="space-y-4">
          <div className="grid gap-4">
            {correlations.map((correlation, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-semibold capitalize">
                        {correlation.metric1} vs {correlation.metric2}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {correlation.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getCorrelationIcon(correlation.correlation)}
                      <Badge variant={
                        correlation.significance === 'high' ? 'default' :
                        correlation.significance === 'medium' ? 'secondary' : 'outline'
                      }>
                        {correlation.significance}
                      </Badge>
                      <div className="text-2xl font-bold">
                        {Math.abs(correlation.correlation).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="zones" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {healthZones.map((zone, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: zone.color }}
                    />
                    <div className="space-y-1">
                      <div className="font-semibold">{zone.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {zone.range[0]}% - {zone.range[1]}% of max HR
                      </div>
                      <div className="text-sm">{zone.description}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recovery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recovery Score Trend</CardTitle>
              <CardDescription>
                Combined score based on HRV and sleep quality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={biometricData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="recovery" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedBiometricAnalysis;

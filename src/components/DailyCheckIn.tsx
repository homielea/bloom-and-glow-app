
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, Battery, Flame, Moon, Brain, Activity } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { toast } from '@/hooks/use-toast';

const DailyCheckIn: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [libido, setLibido] = useState(5);
  const [sleep, setSleep] = useState(5);
  const [stress, setStress] = useState(5);
  const [bodyTemperature, setBodyTemperature] = useState<'normal' | 'hot-flash' | 'night-sweats' | 'cold'>('normal');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [trackerData, setTrackerData] = useState<any>({});
  const [dataSource, setDataSource] = useState({
    mood: 'manual',
    energy: 'manual',
    sleep: 'manual',
    stress: 'manual',
  });

  const { saveCheckIn, getLatestTrackerData } = useApp();

  useEffect(() => {
    loadTrackerData();
  }, []);

  const loadTrackerData = async () => {
    try {
      // Load sleep data
      const sleepData = await getLatestTrackerData('sleep', 1);
      if (sleepData) {
        const sleepScore = Math.round((sleepData.value / 100) * 10); // Convert to 1-10 scale
        setSleep(sleepScore);
        setDataSource(prev => ({ ...prev, sleep: 'tracker' }));
        setTrackerData(prev => ({ ...prev, sleep: sleepData }));
      }

      // Load HRV data for stress estimation
      const hrvData = await getLatestTrackerData('hrv', 1);
      if (hrvData) {
        // Higher HRV typically means lower stress (simplified calculation)
        const stressScore = Math.max(1, Math.min(10, 10 - Math.round(hrvData.value / 10)));
        setStress(stressScore);
        setDataSource(prev => ({ ...prev, stress: 'tracker' }));
        setTrackerData(prev => ({ ...prev, hrv: hrvData }));
      }

      // Load heart rate data for energy estimation
      const hrData = await getLatestTrackerData('heart_rate', 1);
      if (hrData) {
        // This is a simplified estimation - you'd want more sophisticated logic
        const energyScore = Math.round(Math.random() * 3 + 5); // Placeholder
        setEnergy(energyScore);
        setDataSource(prev => ({ ...prev, energy: 'tracker' }));
        setTrackerData(prev => ({ ...prev, heartRate: hrData }));
      }

    } catch (error) {
      console.error('Error loading tracker data:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      await saveCheckIn({
        date: today,
        mood,
        energy,
        libido,
        sleep,
        stress,
        bodyTemperature,
        notes: notes || undefined,
        moodSource: dataSource.mood,
        energySource: dataSource.energy,
        sleepSource: dataSource.sleep,
        stressSource: dataSource.stress,
        bodyTemperatureSource: 'manual',
        trackerSleepScore: trackerData.sleep?.value,
        trackerHrv: trackerData.hrv?.value,
        trackerRestingHr: trackerData.heartRate?.value,
      });

      toast({
        title: "Check-in saved! 💜",
        description: "Your daily wellness data has been recorded.",
      });

      onComplete();
    } catch (error) {
      console.error('Error saving check-in:', error);
      toast({
        title: "Error",
        description: "Failed to save your check-in. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBodyTemperatureChange = (value: string) => {
    setBodyTemperature(value as 'normal' | 'hot-flash' | 'night-sweats' | 'cold');
  };

  const getDataSourceBadge = (source: string) => {
    return source === 'tracker' ? (
      <Badge className="bg-blue-100 text-blue-800 text-xs">
        <Activity className="w-3 h-3 mr-1" />
        Auto-synced
      </Badge>
    ) : (
      <Badge variant="outline" className="text-xs">Manual</Badge>
    );
  };

  const metrics = [
    { 
      key: 'mood', 
      label: 'Mood', 
      icon: Heart, 
      value: mood, 
      setValue: setMood,
      lowLabel: 'Low/Sad',
      highLabel: 'Happy/Balanced',
      source: dataSource.mood
    },
    { 
      key: 'energy', 
      label: 'Energy', 
      icon: Battery, 
      value: energy, 
      setValue: setEnergy,
      lowLabel: 'Exhausted',
      highLabel: 'Energized',
      source: dataSource.energy
    },
    { 
      key: 'libido', 
      label: 'Libido', 
      icon: Flame, 
      value: libido, 
      setValue: setLibido,
      lowLabel: 'Very low',
      highLabel: 'Strong',
      source: dataSource.libido
    },
    { 
      key: 'sleep', 
      label: 'Sleep Quality', 
      icon: Moon, 
      value: sleep, 
      setValue: setSleep,
      lowLabel: 'Poor',
      highLabel: 'Excellent',
      source: dataSource.sleep
    },
    { 
      key: 'stress', 
      label: 'Stress Level', 
      icon: Brain, 
      value: stress, 
      setValue: setStress,
      lowLabel: 'Very calm',
      highLabel: 'Very stressed',
      source: dataSource.stress
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Daily Check-In</CardTitle>
            <CardDescription>
              How are you feeling today? Your patterns help us understand your journey.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {metrics.map((metric) => {
              const IconComponent = metric.icon;
              return (
                <div key={metric.key} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5 text-primary" />
                    <Label className="font-medium">{metric.label}</Label>
                    <span className="ml-auto text-lg font-semibold text-primary">
                      {metric.value}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div></div>
                    {getDataSourceBadge(metric.source)}
                  </div>
                  <Slider
                    value={[metric.value]}
                    onValueChange={(value) => {
                      metric.setValue(value[0]);
                      setDataSource(prev => ({ ...prev, [metric.key]: 'manual' }));
                    }}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{metric.lowLabel}</span>
                    <span>{metric.highLabel}</span>
                  </div>
                </div>
              );
            })}

            <div className="space-y-3">
              <Label className="font-medium">Body Temperature</Label>
              <RadioGroup value={bodyTemperature} onValueChange={handleBodyTemperatureChange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="normal" />
                  <Label htmlFor="normal">Normal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hot-flash" id="hot-flash" />
                  <Label htmlFor="hot-flash">Hot flash</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="night-sweats" id="night-sweats" />
                  <Label htmlFor="night-sweats">Night sweats</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cold" id="cold" />
                  <Label htmlFor="cold">Feeling cold</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label htmlFor="notes" className="font-medium">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional thoughts or observations about today..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500"
            >
              {saving ? 'Saving...' : 'Save Check-In'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DailyCheckIn;

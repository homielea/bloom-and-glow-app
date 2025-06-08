
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Battery, Flame, Moon, Brain } from 'lucide-react';
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

  const { saveCheckIn } = useApp();

  const handleSave = () => {
    const today = new Date().toISOString().split('T')[0];
    
    saveCheckIn({
      date: today,
      mood,
      energy,
      libido,
      sleep,
      stress,
      bodyTemperature,
      notes: notes || undefined
    });

    toast({
      title: "Check-in saved! 💜",
      description: "Your daily wellness data has been recorded.",
    });

    onComplete();
  };

  const metrics = [
    { 
      key: 'mood', 
      label: 'Mood', 
      icon: Heart, 
      value: mood, 
      setValue: setMood,
      lowLabel: 'Low/Sad',
      highLabel: 'Happy/Balanced'
    },
    { 
      key: 'energy', 
      label: 'Energy', 
      icon: Battery, 
      value: energy, 
      setValue: setEnergy,
      lowLabel: 'Exhausted',
      highLabel: 'Energized'
    },
    { 
      key: 'libido', 
      label: 'Libido', 
      icon: Flame, 
      value: libido, 
      setValue: setLibido,
      lowLabel: 'Very low',
      highLabel: 'Strong'
    },
    { 
      key: 'sleep', 
      label: 'Sleep Quality', 
      icon: Moon, 
      value: sleep, 
      setValue: setSleep,
      lowLabel: 'Poor',
      highLabel: 'Excellent'
    },
    { 
      key: 'stress', 
      label: 'Stress Level', 
      icon: Brain, 
      value: stress, 
      setValue: setStress,
      lowLabel: 'Very calm',
      highLabel: 'Very stressed'
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
                  <Slider
                    value={[metric.value]}
                    onValueChange={(value) => metric.setValue(value[0])}
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
              <RadioGroup value={bodyTemperature} onValueChange={setBodyTemperature}>
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
              className="w-full bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500"
            >
              Save Check-In
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DailyCheckIn;

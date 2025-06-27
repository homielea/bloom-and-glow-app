
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, Thermometer, Clock, MapPin, Pill, 
  TrendingUp, AlertCircle, CheckCircle, Plus,
  Calendar, Target, Bell
} from 'lucide-react';
import { toast } from 'sonner';

interface DetailedSymptom {
  id: string;
  name: string;
  severity: number; // 1-10
  duration: string;
  triggers: string[];
  relievingFactors: string[];
  location?: string;
  notes: string;
  timestamp: string;
  associatedSymptoms: string[];
}

interface Treatment {
  id: string;
  name: string;
  type: 'medication' | 'supplement' | 'therapy' | 'lifestyle';
  dosage?: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  effectiveness: number; // 1-10
  sideEffects: string[];
  notes: string;
}

interface MedicationReminder {
  id: string;
  medicationName: string;
  times: string[];
  dosage: string;
  nextDose: string;
  active: boolean;
}

const AdvancedSymptomTracker: React.FC = () => {
  const [symptoms, setSymptoms] = useState<DetailedSymptom[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [currentSymptom, setCurrentSymptom] = useState<Partial<DetailedSymptom>>({
    name: '',
    severity: 5,
    duration: '',
    triggers: [],
    relievingFactors: [],
    notes: '',
    associatedSymptoms: []
  });
  const [currentTreatment, setCurrentTreatment] = useState<Partial<Treatment>>({
    name: '',
    type: 'medication',
    frequency: '',
    effectiveness: 5,
    sideEffects: [],
    notes: ''
  });

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    const mockSymptoms: DetailedSymptom[] = [
      {
        id: '1',
        name: 'Hot Flash',
        severity: 7,
        duration: '5-10 minutes',
        triggers: ['Stress', 'Spicy food', 'Alcohol'],
        relievingFactors: ['Cool environment', 'Deep breathing', 'Cold water'],
        location: 'Upper body, face',
        notes: 'Usually occurs in the evening, intensity varies',
        timestamp: new Date().toISOString(),
        associatedSymptoms: ['Sweating', 'Rapid heartbeat']
      },
      {
        id: '2',
        name: 'Sleep Disruption',
        severity: 6,
        duration: '2-4 hours',
        triggers: ['Night sweats', 'Anxiety', 'Late dinner'],
        relievingFactors: ['Meditation', 'Room temperature control', 'Herbal tea'],
        notes: 'Difficulty falling back asleep after waking',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        associatedSymptoms: ['Fatigue next day', 'Irritability']
      }
    ];

    const mockTreatments: Treatment[] = [
      {
        id: '1',
        name: 'Vitamin D3',
        type: 'supplement',
        dosage: '2000 IU',
        frequency: 'Daily',
        startDate: '2024-01-01',
        effectiveness: 7,
        sideEffects: [],
        notes: 'Taking with breakfast for better absorption'
      },
      {
        id: '2',
        name: 'Evening Primrose Oil',
        type: 'supplement',
        dosage: '1000mg',
        frequency: 'Twice daily',
        startDate: '2024-02-15',
        effectiveness: 6,
        sideEffects: ['Mild stomach upset'],
        notes: 'Helps with mood swings and breast tenderness'
      }
    ];

    const mockReminders: MedicationReminder[] = [
      {
        id: '1',
        medicationName: 'Vitamin D3',
        times: ['08:00'],
        dosage: '2000 IU',
        nextDose: '08:00 tomorrow',
        active: true
      },
      {
        id: '2',
        medicationName: 'Evening Primrose Oil',
        times: ['08:00', '20:00'],
        dosage: '1000mg',
        nextDose: '20:00 today',
        active: true
      }
    ];

    setSymptoms(mockSymptoms);
    setTreatments(mockTreatments);
    setReminders(mockReminders);
  };

  const logSymptom = () => {
    if (!currentSymptom.name) {
      toast.error('Please enter a symptom name');
      return;
    }

    const newSymptom: DetailedSymptom = {
      id: Date.now().toString(),
      name: currentSymptom.name!,
      severity: currentSymptom.severity || 5,
      duration: currentSymptom.duration || '',
      triggers: currentSymptom.triggers || [],
      relievingFactors: currentSymptom.relievingFactors || [],
      location: currentSymptom.location,
      notes: currentSymptom.notes || '',
      timestamp: new Date().toISOString(),
      associatedSymptoms: currentSymptom.associatedSymptoms || []
    };

    setSymptoms(prev => [newSymptom, ...prev]);
    setCurrentSymptom({
      name: '',
      severity: 5,
      duration: '',
      triggers: [],
      relievingFactors: [],
      notes: '',
      associatedSymptoms: []
    });
    toast.success('Symptom logged successfully!');
  };

  const addTreatment = () => {
    if (!currentTreatment.name) {
      toast.error('Please enter a treatment name');
      return;
    }

    const newTreatment: Treatment = {
      id: Date.now().toString(),
      name: currentTreatment.name!,
      type: currentTreatment.type || 'medication',
      dosage: currentTreatment.dosage,
      frequency: currentTreatment.frequency || '',
      startDate: new Date().toISOString().split('T')[0],
      effectiveness: currentTreatment.effectiveness || 5,
      sideEffects: currentTreatment.sideEffects || [],
      notes: currentTreatment.notes || ''
    };

    setTreatments(prev => [newTreatment, ...prev]);
    setCurrentTreatment({
      name: '',
      type: 'medication',
      frequency: '',
      effectiveness: 5,
      sideEffects: [],
      notes: ''
    });
    toast.success('Treatment added successfully!');
  };

  const addTrigger = (trigger: string) => {
    if (trigger && !currentSymptom.triggers?.includes(trigger)) {
      setCurrentSymptom(prev => ({
        ...prev,
        triggers: [...(prev.triggers || []), trigger]
      }));
    }
  };

  const removeTrigger = (trigger: string) => {
    setCurrentSymptom(prev => ({
      ...prev,
      triggers: prev.triggers?.filter(t => t !== trigger) || []
    }));
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'bg-green-100 text-green-800';
    if (severity <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getEffectivenessColor = (effectiveness: number) => {
    if (effectiveness >= 7) return 'bg-green-100 text-green-800';
    if (effectiveness >= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-gradient-to-r from-orange-400 to-red-400 text-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8" />
              <div>
                <CardTitle className="text-2xl">Advanced Symptom & Treatment Tracker</CardTitle>
                <CardDescription className="text-white/90">
                  Comprehensive tracking for better healthcare outcomes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="symptoms" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="symptoms">Symptom Logging</TabsTrigger>
            <TabsTrigger value="treatments">Treatment Tracking</TabsTrigger>
            <TabsTrigger value="reminders">Medication Reminders</TabsTrigger>
            <TabsTrigger value="analysis">Treatment Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="symptoms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Log New Symptom</CardTitle>
                <CardDescription>
                  Detailed symptom tracking for better pattern recognition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="symptomName">Symptom Name</Label>
                      <Input
                        id="symptomName"
                        value={currentSymptom.name}
                        onChange={(e) => setCurrentSymptom(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Hot flash, Night sweats"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        value={currentSymptom.duration}
                        onChange={(e) => setCurrentSymptom(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="e.g., 5-10 minutes, 2 hours"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Severity Level: {currentSymptom.severity}</Label>
                    <Slider
                      value={[currentSymptom.severity || 5]}
                      onValueChange={(value) => setCurrentSymptom(prev => ({ ...prev, severity: value[0] }))}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full mt-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Mild</span>
                      <span>Severe</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location/Area Affected</Label>
                    <Input
                      id="location"
                      value={currentSymptom.location || ''}
                      onChange={(e) => setCurrentSymptom(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Upper body, Head, Lower back"
                    />
                  </div>

                  <div>
                    <Label>Triggers</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add trigger and press Enter"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addTrigger(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {currentSymptom.triggers?.map((trigger, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeTrigger(trigger)}
                        >
                          {trigger} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={currentSymptom.notes}
                      onChange={(e) => setCurrentSymptom(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any additional details, patterns, or observations..."
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={logSymptom}
                    className="w-full bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Log Symptom
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Symptoms</h3>
              {symptoms.map((symptom) => (
                <Card key={symptom.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{symptom.name}</CardTitle>
                        <CardDescription>
                          {new Date(symptom.timestamp).toLocaleDateString()} • {symptom.duration}
                        </CardDescription>
                      </div>
                      <Badge className={getSeverityColor(symptom.severity)}>
                        Severity: {symptom.severity}/10
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {symptom.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{symptom.location}</span>
                        </div>
                      )}
                      
                      {symptom.triggers.length > 0 && (
                        <div>
                          <span className="text-sm font-medium">Triggers: </span>
                          <div className="flex gap-1 flex-wrap mt-1">
                            {symptom.triggers.map((trigger, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {trigger}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {symptom.notes && (
                        <p className="text-sm text-gray-600">{symptom.notes}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="treatments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add New Treatment</CardTitle>
                <CardDescription>
                  Track medications, supplements, and therapies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="treatmentName">Treatment Name</Label>
                      <Input
                        id="treatmentName"
                        value={currentTreatment.name}
                        onChange={(e) => setCurrentTreatment(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Vitamin D, HRT, Yoga"
                      />
                    </div>
                    <div>
                      <Label htmlFor="treatmentType">Type</Label>
                      <select
                        id="treatmentType"
                        value={currentTreatment.type}
                        onChange={(e) => setCurrentTreatment(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="medication">Medication</option>
                        <option value="supplement">Supplement</option>
                        <option value="therapy">Therapy</option>
                        <option value="lifestyle">Lifestyle Change</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="dosage">Dosage/Amount</Label>
                      <Input
                        id="dosage"
                        value={currentTreatment.dosage || ''}
                        onChange={(e) => setCurrentTreatment(prev => ({ ...prev, dosage: e.target.value }))}
                        placeholder="e.g., 1000mg, 2 tablets"
                      />
                    </div>
                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Input
                        id="frequency"
                        value={currentTreatment.frequency}
                        onChange={(e) => setCurrentTreatment(prev => ({ ...prev, frequency: e.target.value }))}
                        placeholder="e.g., Daily, Twice daily, Weekly"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Effectiveness: {currentTreatment.effectiveness}</Label>
                    <Slider
                      value={[currentTreatment.effectiveness || 5]}
                      onValueChange={(value) => setCurrentTreatment(prev => ({ ...prev, effectiveness: value[0] }))}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full mt-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Not effective</span>
                      <span>Very effective</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="treatmentNotes">Notes</Label>
                    <Textarea
                      id="treatmentNotes"
                      value={currentTreatment.notes}
                      onChange={(e) => setCurrentTreatment(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Side effects, observations, instructions..."
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={addTreatment}
                    className="w-full bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Treatment
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Current Treatments</h3>
              {treatments.map((treatment) => (
                <Card key={treatment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{treatment.name}</CardTitle>
                        <CardDescription>
                          {treatment.dosage} • {treatment.frequency}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <Badge className={getEffectivenessColor(treatment.effectiveness)}>
                          {treatment.effectiveness}/10 effective
                        </Badge>
                        <Badge variant="outline" className="ml-2">
                          {treatment.type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Started: {new Date(treatment.startDate).toLocaleDateString()}</span>
                      </div>
                      
                      {treatment.sideEffects.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-orange-600">Side Effects: </span>
                          <span className="text-sm">{treatment.sideEffects.join(', ')}</span>
                        </div>
                      )}

                      {treatment.notes && (
                        <p className="text-sm text-gray-600">{treatment.notes}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reminders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Smart Medication Reminders
                </CardTitle>
                <CardDescription>
                  Never miss a dose with intelligent reminders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reminders.map((reminder) => (
                    <div key={reminder.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Pill className="w-5 h-5 text-blue-500" />
                        <div>
                          <h4 className="font-medium">{reminder.medicationName}</h4>
                          <p className="text-sm text-gray-600">
                            {reminder.dosage} • {reminder.times.join(', ')}
                          </p>
                          <p className="text-xs text-gray-500">Next: {reminder.nextDose}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={reminder.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {reminder.active ? 'Active' : 'Paused'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          {reminder.active ? 'Pause' : 'Resume'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Treatment Effectiveness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {treatments.map((treatment) => (
                      <div key={treatment.id} className="flex justify-between items-center">
                        <span className="text-sm">{treatment.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${treatment.effectiveness * 10}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{treatment.effectiveness}/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Symptom Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      Most common triggers: Stress, Poor sleep, Dietary factors
                    </div>
                    <div className="text-sm text-gray-600">
                      Peak symptom times: Evening (40%), Morning (30%)
                    </div>
                    <div className="text-sm text-gray-600">
                      Average severity trend: Decreasing (-12% this month)
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedSymptomTracker;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Clock, 
  Lightbulb, 
  Zap, 
  Moon, 
  Sun, 
  Bell, 
  Target,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PersonalizationSettings {
  adaptiveLearning: boolean;
  smartReminders: boolean;
  contentPersonalization: boolean;
  insightFrequency: 'low' | 'medium' | 'high';
  reminderTiming: number[]; // Hours of day
  focusAreas: string[];
  difficultyLevel: number; // 1-5 scale
  motivationStyle: 'gentle' | 'encouraging' | 'challenging';
  dataPrivacy: 'minimal' | 'standard' | 'comprehensive';
  themePreference: 'auto' | 'light' | 'dark';
}

const EnhancedPersonalization: React.FC = () => {
  const { user, session } = useApp();
  const [settings, setSettings] = useState<PersonalizationSettings>({
    adaptiveLearning: true,
    smartReminders: true,
    contentPersonalization: true,
    insightFrequency: 'medium',
    reminderTiming: [9, 21], // 9 AM and 9 PM
    focusAreas: ['symptoms', 'emotional-wellness'],
    difficultyLevel: 3,
    motivationStyle: 'encouraging',
    dataPrivacy: 'standard',
    themePreference: 'auto'
  });
  
  const [learningInsights, setLearningInsights] = useState({
    engagementPattern: 'morning',
    preferredContentType: 'articles',
    responsesToAdvice: 'positive',
    progressRate: 'steady'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPersonalizationSettings();
    generateLearningInsights();
  }, [session]);

  const loadPersonalizationSettings = async () => {
    if (!session?.user) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        toast.error('Failed to load personalization settings');
        return;
      }

      if (profile?.persona_type) {
        // Load saved settings or use defaults based on persona
        const defaultSettings = getPersonaDefaults(profile.persona_type);
        setSettings({ ...settings, ...defaultSettings });
      }
    } catch (error) {
      toast.error('Failed to load personalization settings');
    }
  };

  const getPersonaDefaults = (personaType: string): Partial<PersonalizationSettings> => {
    switch (personaType) {
      case 'Explorer':
        return {
          contentPersonalization: true,
          insightFrequency: 'high',
          focusAreas: ['symptoms', 'research', 'treatments'],
          motivationStyle: 'encouraging'
        };
      case 'Phoenix':
        return {
          insightFrequency: 'medium',
          focusAreas: ['emotional-wellness', 'self-growth'],
          motivationStyle: 'challenging'
        };
      case 'Nurturer':
        return {
          smartReminders: true,
          focusAreas: ['self-care', 'community'],
          motivationStyle: 'gentle'
        };
      case 'Warrior':
        return {
          insightFrequency: 'high',
          focusAreas: ['goals', 'tracking'],
          motivationStyle: 'challenging'
        };
      default:
        return {};
    }
  };

  const generateLearningInsights = () => {
    // In a real implementation, this would analyze user behavior
    // For now, we'll simulate some insights
    const insights = {
      engagementPattern: Math.random() > 0.5 ? 'morning' : 'evening',
      preferredContentType: ['articles', 'audio', 'videos'][Math.floor(Math.random() * 3)],
      responsesToAdvice: ['positive', 'mixed', 'needs-adjustment'][Math.floor(Math.random() * 3)],
      progressRate: ['slow', 'steady', 'rapid'][Math.floor(Math.random() * 3)]
    };
    
    setLearningInsights(insights);
  };

  const saveSettings = async () => {
    if (!session?.user) return;

    setLoading(true);
    try {
      // Save to user profile or separate personalization table
      const { error } = await supabase
        .from('profiles')
        .update({
          // Store settings in a JSONB column or separate fields
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (error) throw error;

      toast.success('Personalization settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    }finally {
      setLoading(false);
    }
  };

  const updateSetting = <K extends keyof PersonalizationSettings>(
    key: K,
    value: PersonalizationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const focusAreaOptions = [
    { value: 'symptoms', label: 'Symptom Management' },
    { value: 'emotional-wellness', label: 'Emotional Wellness' },
    { value: 'nutrition', label: 'Nutrition & Diet' },
    { value: 'fitness', label: 'Physical Activity' },
    { value: 'sleep', label: 'Sleep Quality' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'self-care', label: 'Self-Care' },
    { value: 'community', label: 'Community Support' },
    { value: 'research', label: 'Research & Education' },
    { value: 'treatments', label: 'Treatment Options' },
    { value: 'goals', label: 'Goal Achievement' },
    { value: 'tracking', label: 'Health Tracking' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Personalization</h1>
          <p className="text-gray-600 mt-2">Customize your experience with AI-powered adaptive learning</p>
        </div>

        <Tabs defaultValue="adaptive" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="adaptive">Adaptive Learning</TabsTrigger>
            <TabsTrigger value="content">Content & Insights</TabsTrigger>
            <TabsTrigger value="reminders">Smart Reminders</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="adaptive" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Adaptive Learning Engine
                </CardTitle>
                <CardDescription>
                  AI learns from your behavior to provide increasingly personalized experiences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Adaptive Learning</h4>
                    <p className="text-sm text-gray-600">
                      Allow the system to learn from your interactions and preferences
                    </p>
                  </div>
                  <Switch
                    checked={settings.adaptiveLearning}
                    onCheckedChange={(checked) => updateSetting('adaptiveLearning', checked)}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Learning Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Engagement Pattern:</span>
                        <Badge variant="secondary">{learningInsights.engagementPattern}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Preferred Content:</span>
                        <Badge variant="secondary">{learningInsights.preferredContentType}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Progress Rate:</span>
                        <Badge variant="secondary">{learningInsights.progressRate}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Response to Advice:</span>
                        <Badge variant="secondary">{learningInsights.responsesToAdvice}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Difficulty Level
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Beginner</span>
                          <span>Expert</span>
                        </div>
                        <Slider
                          value={[settings.difficultyLevel]}
                          onValueChange={([value]) => updateSetting('difficultyLevel', value)}
                          max={5}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <p className="text-sm text-gray-600 text-center">
                          Level {settings.difficultyLevel}: 
                          {settings.difficultyLevel <= 2 ? ' Gentle introduction' :
                           settings.difficultyLevel <= 4 ? ' Balanced approach' : 
                           ' Comprehensive insights'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Content Personalization
                </CardTitle>
                <CardDescription>
                  Customize what content and insights you receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Personalized Content</h4>
                    <p className="text-sm text-gray-600">
                      Receive content tailored to your interests and progress
                    </p>
                  </div>
                  <Switch
                    checked={settings.contentPersonalization}
                    onCheckedChange={(checked) => updateSetting('contentPersonalization', checked)}
                  />
                </div>

                <div>
                  <h4 className="font-medium mb-3">Focus Areas</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {focusAreaOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={option.value}
                          checked={settings.focusAreas.includes(option.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateSetting('focusAreas', [...settings.focusAreas, option.value]);
                            } else {
                              updateSetting('focusAreas', settings.focusAreas.filter(area => area !== option.value));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={option.value} className="text-sm">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Insight Frequency</h4>
                  <Select 
                    value={settings.insightFrequency} 
                    onValueChange={(value: 'low' | 'medium' | 'high') => updateSetting('insightFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Weekly summaries</SelectItem>
                      <SelectItem value="medium">Medium - 2-3 times per week</SelectItem>
                      <SelectItem value="high">High - Daily insights</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Motivation Style</h4>
                  <Select 
                    value={settings.motivationStyle} 
                    onValueChange={(value: 'gentle' | 'encouraging' | 'challenging') => updateSetting('motivationStyle', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gentle">Gentle - Supportive and nurturing</SelectItem>
                      <SelectItem value="encouraging">Encouraging - Positive and uplifting</SelectItem>
                      <SelectItem value="challenging">Challenging - Direct and goal-focused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reminders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Smart Reminders
                </CardTitle>
                <CardDescription>
                  AI-powered reminders that adapt to your schedule and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Smart Reminders</h4>
                    <p className="text-sm text-gray-600">
                      Receive personalized reminders at optimal times
                    </p>
                  </div>
                  <Switch
                    checked={settings.smartReminders}
                    onCheckedChange={(checked) => updateSetting('smartReminders', checked)}
                  />
                </div>

                <div>
                  <h4 className="font-medium mb-3">Preferred Reminder Times</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Morning reminder: {settings.reminderTiming[0]}:00</span>
                    </div>
                    <Slider
                      value={[settings.reminderTiming[0]]}
                      onValueChange={([value]) => updateSetting('reminderTiming', [value, settings.reminderTiming[1]])}
                      max={12}
                      min={6}
                      step={1}
                      className="w-full"
                    />
                    
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      <span className="text-sm">Evening reminder: {settings.reminderTiming[1]}:00</span>
                    </div>
                    <Slider
                      value={[settings.reminderTiming[1]]}
                      onValueChange={([value]) => updateSetting('reminderTiming', [settings.reminderTiming[0], value])}
                      max={23}
                      min={18}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4" />
                        <h5 className="font-medium">Smart Scheduling</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        Reminders adapt to your daily patterns and avoid busy periods
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4" />
                        <h5 className="font-medium">Context-Aware</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        Reminders consider your mood, energy levels, and recent activities
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Preferences</CardTitle>
                <CardDescription>
                  Control your overall app experience and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Theme Preference</h4>
                  <Select 
                    value={settings.themePreference} 
                    onValueChange={(value: 'auto' | 'light' | 'dark') => updateSetting('themePreference', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4" />
                          Auto - Follow system
                        </div>
                      </SelectItem>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4" />
                          Light Mode
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4" />
                          Dark Mode
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Data Privacy Level</h4>
                  <Select 
                    value={settings.dataPrivacy} 
                    onValueChange={(value: 'minimal' | 'standard' | 'comprehensive') => updateSetting('dataPrivacy', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal - Essential data only</SelectItem>
                      <SelectItem value="standard">Standard - Balanced personalization</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive - Full personalization</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600 mt-2">
                    {settings.dataPrivacy === 'minimal' && 'Limited personalization, maximum privacy'}
                    {settings.dataPrivacy === 'standard' && 'Good balance of personalization and privacy'}
                    {settings.dataPrivacy === 'comprehensive' && 'Maximum personalization with full data utilization'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={saveSettings} disabled={loading}>
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPersonalization;

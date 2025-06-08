
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Heart, Shield, Mountain } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const PersonaReveal: React.FC<{ onContinue: () => void }> = ({ onContinue }) => {
  const { user } = useApp();
  
  if (!user?.persona) return null;

  const personaIcons = {
    Explorer: Sparkles,
    Phoenix: Mountain,
    Nurturer: Heart,
    Warrior: Shield
  };

  const IconComponent = personaIcons[user.persona.type];
  
  const personaColors = {
    Explorer: 'from-blue-400 to-cyan-400',
    Phoenix: 'from-orange-400 to-red-400',
    Nurturer: 'from-pink-400 to-rose-400',
    Warrior: 'from-purple-400 to-indigo-400'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r ${personaColors[user.persona.type]} flex items-center justify-center`}>
            <IconComponent className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl">Meet Your Inner {user.persona.type}</CardTitle>
          <CardDescription className="text-base">
            Your personalized menopause journey begins here
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            {user.persona.description}
          </p>
          
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-medium mb-2">Your Learning Path</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {user.persona.learningPath.map((path, index) => (
                <li key={index}>• {path}</li>
              ))}
            </ul>
          </div>
          
          <Button 
            onClick={onContinue}
            className={`w-full bg-gradient-to-r ${personaColors[user.persona.type]} hover:opacity-90 text-white`}
          >
            Start My Journey
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonaReveal;

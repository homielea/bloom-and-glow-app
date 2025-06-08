
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { audioPrompts } from '../data/audioPrompts';

const SelfWorthToolkit: React.FC = () => {
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const categories = [
    { key: 'all', label: 'All Tools' },
    { key: 'journal', label: 'Journal Prompts' },
    { key: 'meditation', label: 'Meditations' },
    { key: 'exercise', label: 'Exercises' }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredPrompts = audioPrompts.filter(prompt => 
    selectedCategory === 'all' || prompt.category === selectedCategory
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'journal': return 'bg-blue-100 text-blue-800';
      case 'meditation': return 'bg-purple-100 text-purple-800';
      case 'exercise': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In a real app, this would control actual audio playback
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  if (selectedPrompt) {
    const prompt = audioPrompts.find(p => p.id === selectedPrompt);
    if (!prompt) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Button 
            variant="outline" 
            onClick={() => setSelectedPrompt(null)}
            className="mb-4"
          >
            ← Back to Toolkit
          </Button>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getCategoryColor(prompt.category)}>
                  {prompt.category}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {prompt.duration}
                </div>
              </div>
              <CardTitle>{prompt.title}</CardTitle>
              <CardDescription>{prompt.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Audio Player Simulation */}
              <div className="bg-gradient-to-r from-purple-100 to-rose-100 p-6 rounded-lg">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRestart}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="lg"
                    onClick={handlePlayPause}
                    className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </Button>
                </div>
                
                <div className="w-full bg-white/50 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-rose-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentTime / 100) * 100}%` }}
                  />
                </div>
                
                <div className="text-center text-sm text-purple-800">
                  {isPlaying ? "Playing..." : "Ready to begin"}
                </div>
              </div>

              {/* Transcript */}
              <div className="space-y-4">
                <h3 className="font-semibold">Guided Script</h3>
                <div className="prose prose-sm text-muted-foreground">
                  <p>{prompt.transcript}</p>
                  <p className="mt-4 italic">
                    This is a preview of the guided audio experience. The full version would include 
                    complete narration with pauses for reflection and journaling.
                  </p>
                </div>
              </div>

              {prompt.category === 'journal' && (
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-amber-800">Journal Space</h4>
                  <p className="text-sm text-amber-700 mb-3">
                    Take a moment to write your thoughts and reflections here.
                  </p>
                  <textarea 
                    className="w-full h-24 p-3 border rounded-md resize-none"
                    placeholder="Your thoughts and reflections..."
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Self-Worth Toolkit</h1>
          <p className="text-muted-foreground">
            Guided practices to nurture your relationship with yourself
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.key}
              variant={selectedCategory === category.key ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.key)}
              size="sm"
              className={selectedCategory === category.key ? 
                "bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500" : 
                ""
              }
            >
              {category.label}
            </Button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredPrompts.map((prompt) => (
            <Card 
              key={prompt.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedPrompt(prompt.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getCategoryColor(prompt.category)}>
                    {prompt.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {prompt.duration}
                  </div>
                </div>
                <CardTitle className="text-lg">{prompt.title}</CardTitle>
                <CardDescription>{prompt.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <Button 
                  size="sm" 
                  className="w-full bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Practice
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelfWorthToolkit;

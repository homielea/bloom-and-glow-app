
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, BookOpen, Headphones, Video, Play } from 'lucide-react';
import { contentLibrary } from '../data/contentLibrary';
import { useApp } from '../contexts/AppContext';

const ContentLibrary: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const { user } = useApp();

  const categories = ['all', 'Symptoms', 'Hormones', 'Nutrition', 'Sex & Libido', 'Emotional Confidence'];
  
  const filteredContent = contentLibrary.filter(item => {
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    const personaMatch = !item.unlockedBy || !user?.persona || item.unlockedBy.includes(user.persona.type);
    return categoryMatch && personaMatch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return BookOpen;
      case 'audio': return Headphones;
      case 'video': return Video;
      case 'podcast': return Play;
      default: return BookOpen;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-800';
      case 'audio': return 'bg-purple-100 text-purple-800';
      case 'video': return 'bg-rose-100 text-rose-800';
      case 'podcast': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (selectedContent) {
    const content = contentLibrary.find(item => item.id === selectedContent);
    if (!content) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Button 
            variant="outline" 
            onClick={() => setSelectedContent(null)}
            className="mb-4"
          >
            ← Back to Library
          </Button>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getTypeColor(content.type)}>
                  {content.type}
                </Badge>
                <Badge variant="secondary">{content.category}</Badge>
                {content.duration && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {content.duration}
                  </div>
                )}
              </div>
              <CardTitle>{content.title}</CardTitle>
              <CardDescription>{content.description}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p>{content.content}</p>
                
                {content.type === 'audio' && (
                  <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-800">
                      🎧 Audio content would play here. In the full app, this would integrate with an audio player.
                    </p>
                  </div>
                )}
                
                {content.type === 'video' && (
                  <div className="mt-6 p-4 bg-rose-50 rounded-lg">
                    <p className="text-sm text-rose-800">
                      📹 Video content would play here. In the full app, this would embed video players.
                    </p>
                  </div>
                )}
              </div>
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
          <h1 className="text-2xl font-bold mb-2">Content Library</h1>
          <p className="text-muted-foreground">
            Curated resources for your {user?.persona?.type || ''} journey
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              size="sm"
              className={selectedCategory === category ? 
                "bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500" : 
                ""
              }
            >
              {category === 'all' ? 'All' : category}
            </Button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredContent.map((item) => {
            const IconComponent = getTypeIcon(item.type);
            return (
              <Card 
                key={item.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedContent(item.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4" />
                      <Badge className={getTypeColor(item.type)}>
                        {item.type}
                      </Badge>
                    </div>
                    {item.duration && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {item.duration}
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredContent.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No content available for the selected category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentLibrary;

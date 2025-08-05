import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { quizQuestions } from '../data/quizQuestions';
import { useApp } from '../contexts/AppContext';
import { QuizAnswer } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const OnboardingQuiz: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [saving, setSaving] = useState(false);
  const { setQuizAnswers, assignPersona, session, setUser } = useApp();

  const currentQuestionData = quizQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === quizQuestions.length - 1;

  const handleAnswer = (value: number | string | string[]) => {
    const newAnswers = answers.filter(a => a.questionId !== currentQuestionData.id);
    newAnswers.push({ questionId: currentQuestionData.id, value });
    setAnswers(newAnswers);
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      setSaving(true);
      
      try {
        if (!session?.user) {
          toast({
            title: "Error",
            description: "Please log in to save your quiz results.",
            variant: "destructive"
          });
          return;
        }

        // Save quiz answers to database
        const quizAnswersToSave = answers.map(answer => ({
          user_id: session.user.id,
          question_id: answer.questionId,
          answer_value: answer.value
        }));

        const { error: answersError } = await supabase
          .from('quiz_answers')
          .insert(quizAnswersToSave);

        if (answersError) {
          toast({
            title: "Error",
            description: "Failed to save quiz answers. Please try again.",
            variant: "destructive"
          });
          return;
        }

        // Assign persona and update profile
        const persona = assignPersona(answers);
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            persona_type: persona.type,
            persona_description: persona.description,
            persona_learning_path: Array.isArray(persona.learningPath) 
              ? persona.learningPath as string[]
              : [],
            persona_motivational_tone: persona.motivationalTone,
            onboarding_completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.user.id);

        if (profileError) {
          toast({
            title: "Error",
            description: "Failed to save your persona. Please try again.",
            variant: "destructive"
          });
          return;
        }

        // Update local user state
        setQuizAnswers(answers);
        
        // Fetch updated user profile
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (updatedProfile) {
          setUser({
            id: updatedProfile.id,
            email: updatedProfile.email,
            onboardingCompleted: updatedProfile.onboarding_completed,
            createdAt: updatedProfile.created_at,
            persona: {
              type: updatedProfile.persona_type as 'Explorer' | 'Phoenix' | 'Nurturer' | 'Warrior',
              description: updatedProfile.persona_description,
              learningPath: Array.isArray(updatedProfile.persona_learning_path) 
                ? updatedProfile.persona_learning_path as string[]
                : [],
              motivationalTone: updatedProfile.persona_motivational_tone
            }
          });
        }

        toast({
          title: "Quiz completed! 🎉",
          description: "Your persona has been assigned and saved.",
        });
        
        onComplete();
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive"
        });
      } finally {
        setSaving(false);
      }
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const currentAnswer = answers.find(a => a.questionId === currentQuestionData.id);
  const canProceed = currentAnswer !== undefined;

  const renderAnswerInput = () => {
    switch (currentQuestionData.type) {
      case 'slider':
        return (
          <div className="space-y-6">
            <Slider
              value={[currentAnswer?.value as number || 5]}
              onValueChange={(value) => handleAnswer(value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{currentQuestionData.labels?.['1']}</span>
              <span>{currentQuestionData.labels?.['10']}</span>
            </div>
            <div className="text-center">
              <span className="text-2xl font-semibold text-primary">
                {currentAnswer?.value || 5}
              </span>
            </div>
          </div>
        );

      case 'multiple':
        const currentMultipleValues = Array.isArray(currentAnswer?.value) ? currentAnswer.value : [];
        return (
          <div className="space-y-3">
            {currentQuestionData.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`option-${index}`}
                  checked={currentMultipleValues.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleAnswer([...currentMultipleValues, option]);
                    } else {
                      handleAnswer(currentMultipleValues.filter(v => v !== option));
                    }
                  }}
                />
                <Label htmlFor={`option-${index}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'single':
        return (
          <RadioGroup
            value={currentAnswer?.value?.toString() || ''}
            onValueChange={(value) => handleAnswer(parseInt(value))}
          >
            {currentQuestionData.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {quizQuestions.length}
            </span>
            <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-rose-400 to-purple-400 transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
              />
            </div>
          </div>
          <CardTitle className="text-lg">{currentQuestionData.question}</CardTitle>
          <CardDescription>
            Your answers help us personalize your menopause journey.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {renderAnswerInput()}
          
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!canProceed || saving}
              className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500"
            >
              {saving ? 'Saving...' : (isLastQuestion ? 'Complete' : 'Next')}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingQuiz;

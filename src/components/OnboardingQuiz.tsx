
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

const OnboardingQuiz: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const { setQuizAnswers, assignPersona, user, setUser } = useApp();

  const currentQuestionData = quizQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === quizQuestions.length - 1;

  const handleAnswer = (value: number | string | string[]) => {
    const newAnswers = answers.filter(a => a.questionId !== currentQuestionData.id);
    newAnswers.push({ questionId: currentQuestionData.id, value });
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setQuizAnswers(answers);
      const persona = assignPersona(answers);
      
      if (user) {
        const updatedUser = { ...user, persona, onboardingCompleted: true };
        setUser(updatedUser);
        localStorage.setItem('menopause-app-user', JSON.stringify(updatedUser));
      }
      
      onComplete();
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
        return (
          <div className="space-y-3">
            {currentQuestionData.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`option-${index}`}
                  checked={(currentAnswer?.value as string[] || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValues = (currentAnswer?.value as string[]) || [];
                    if (checked) {
                      handleAnswer([...currentValues, option]);
                    } else {
                      handleAnswer(currentValues.filter(v => v !== option));
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
            value={currentAnswer?.value as string || ''}
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
              disabled={!canProceed}
              className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500"
            >
              {isLastQuestion ? 'Complete' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingQuiz;

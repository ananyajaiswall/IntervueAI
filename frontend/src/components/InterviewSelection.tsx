import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Briefcase, Code, Users, Award } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

interface InterviewSelectionProps {
  onStart: (persona: string, difficulty: string) => void;
  isLoading?: boolean;
}

const personas = [
  {
    id: 'HR',
    name: 'HR',
    description: 'Behavioral & Cultural Fit',
    icon: Briefcase,
  },
  {
    id: 'Technical Lead',
    name: 'Technical Lead',
    description: 'Technical Depth & Problem Solving',
    icon: Code,
  },
  {
    id: 'Senior Manager',
    name: 'Senior Manager',
    description: 'Leadership & People Management',
    icon: Users,
  },
  {
    id: 'Executive/CEO',
    name: 'Executive/CEO',
    description: 'Strategic Vision & Organizational Impact',
    icon: Award,
  },
];

const difficulties = [
  {
    id: 'easy',
    name: 'Easy',
    description: 'Entry-level to Mid-level',
  },
  {
    id: 'medium',
    name: 'Medium',
    description: 'Mid-level to Senior',
  },
  {
    id: 'hard',
    name: 'Hard',
    description: 'Senior to Principal/Staff',
  },
];

export function InterviewSelection({ onStart, isLoading }: InterviewSelectionProps) {
  const [selectedPersona, setSelectedPersona] = useState<string>('HR');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('medium');

  const handleStart = () => {
    onStart(selectedPersona, selectedDifficulty);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <AppHeader />
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Configure Your Interview</h1>
        <p className="text-muted-foreground text-lg">
          Choose your interview persona and difficulty level
        </p>
      </div>

      <div className="space-y-6">
        {/* Persona Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Interview Persona</CardTitle>
            <CardDescription>
              Choose the type of interviewer you want to practice with
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedPersona} onValueChange={setSelectedPersona}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personas.map((persona) => {
                  const Icon = persona.icon;
                  return (
                    <Label
                      key={persona.id}
                      htmlFor={persona.id}
                      className={`flex items-start space-x-3 space-y-0 rounded-lg border-2 p-4 cursor-pointer hover:bg-accent transition-colors ${
                        selectedPersona === persona.id ? 'border-primary bg-accent' : 'border-muted'
                      }`}
                    >
                      <RadioGroupItem value={persona.id} id={persona.id} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="h-5 w-5 text-primary" />
                          <span className="font-semibold">{persona.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{persona.description}</p>
                      </div>
                    </Label>
                  );
                })}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Difficulty Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Difficulty Level</CardTitle>
            <CardDescription>
              Choose the difficulty that matches your experience level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {difficulties.map((difficulty) => (
                  <Label
                    key={difficulty.id}
                    htmlFor={difficulty.id}
                    className={`flex items-start space-x-3 space-y-0 rounded-lg border-2 p-4 cursor-pointer hover:bg-accent transition-colors ${
                      selectedDifficulty === difficulty.id
                        ? 'border-primary bg-accent'
                        : 'border-muted'
                    }`}
                  >
                    <RadioGroupItem
                      value={difficulty.id}
                      id={difficulty.id}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-semibold mb-1">{difficulty.name}</div>
                      <p className="text-sm text-muted-foreground">{difficulty.description}</p>
                    </div>
                  </Label>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Start Button */}
        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            onClick={handleStart}
            disabled={isLoading}
            className="px-12"
          >
            {isLoading ? 'Starting Interview...' : 'Start Interview'}
          </Button>
        </div>
      </div>
    </div>
    </div>
  );
}

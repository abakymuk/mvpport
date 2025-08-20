'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, ArrowRight, Play } from 'lucide-react';
import { toast } from 'sonner';
import { OnboardingStep } from '@/lib/onboarding';

interface OnboardingWidgetProps {
  onComplete?: () => void;
}

export function OnboardingWidget({ onComplete }: OnboardingWidgetProps) {
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeedingDemo, setIsSeedingDemo] = useState(false);

  useEffect(() => {
    fetchOnboardingSteps();
  }, []);

  const fetchOnboardingSteps = async () => {
    try {
      const response = await fetch('/api/onboarding');
      if (response.ok) {
        const data = await response.json();
        setSteps(data.steps);
      }
    } catch (error) {
      console.error('Error fetching onboarding steps:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepAction = async (step: OnboardingStep) => {
    if (step.key === 'viewed_demo_data') {
      await handleSeedDemoData();
    } else if (step.action?.href && step.action.href !== '#') {
      window.location.href = step.action.href;
    }
  };

  const handleSeedDemoData = async () => {
    setIsSeedingDemo(true);
    try {
      const response = await fetch('/api/demo/seed', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Демо-данные загружены!');
        await fetchOnboardingSteps();
        if (onComplete) onComplete();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Ошибка загрузки демо-данных');
      }
    } catch (error) {
      console.error('Error seeding demo data:', error);
      toast.error('Ошибка загрузки демо-данных');
    } finally {
      setIsSeedingDemo(false);
    }
  };

  const completedSteps = steps.filter((step) => step.completed).length;
  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;
  const isComplete = progress === 100;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Начало работы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Загрузка...</div>
        </CardContent>
      </Card>
    );
  }

  if (isComplete) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Онбординг завершен!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700">
            Отлично! Вы изучили все основные возможности системы.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Начало работы</CardTitle>
          <Badge variant="secondary">
            {completedSteps} из {steps.length}
          </Badge>
        </div>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.key}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                step.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <h4
                    className={`font-medium ${
                      step.completed ? 'text-green-800' : 'text-gray-900'
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p
                    className={`text-sm ${
                      step.completed ? 'text-green-600' : 'text-gray-600'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>

              {step.action && !step.completed && (
                <Button
                  variant={
                    step.key === 'viewed_demo_data' ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => handleStepAction(step)}
                  disabled={isSeedingDemo}
                >
                  {step.key === 'viewed_demo_data' ? (
                    <>
                      {isSeedingDemo ? (
                        'Загрузка...'
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Загрузить
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {step.action.label}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

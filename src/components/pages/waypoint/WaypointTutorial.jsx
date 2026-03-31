import { useState, useEffect } from 'react';
import { MapPin, Target, Bookmark, Filter, X } from 'lucide-react';

const TUTORIAL_STEPS = [
  {
    icon: MapPin,
    title: 'Welcome to Waypoint',
    description: 'Discover what\'s happening around TMU campus in real-time. See events, study spots, and social gatherings on the map.',
  },
  {
    icon: Target,
    title: 'Place Waypoints',
    description: 'Click the "Place" button and tap anywhere on the map to create your own waypoint and share it with others.',
  },
  {
    icon: Filter,
    title: 'Filter Types',
    description: 'Use the filter button to show only the waypoint types you\'re interested in - food, study, social, and more.',
  },
  {
    icon: Bookmark,
    title: 'Save Favorites',
    description: 'Bookmark waypoints to quickly navigate back to your favorite spots later.',
  },
];

export default function WaypointTutorial({ onComplete }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('waypoint_tutorial_completed');
    if (!hasSeenTutorial) {
      setVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (step < TUTORIAL_STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      localStorage.setItem('waypoint_tutorial_completed', 'true');
      setVisible(false);
      onComplete?.();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('waypoint_tutorial_completed', 'true');
    setVisible(false);
    onComplete?.();
  };

  if (!visible) return null;

  const currentStep = TUTORIAL_STEPS[step];
  const Icon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-[2000] bg-black/60 flex items-center justify-center p-4">
      <div
        className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-in"
        style={{ fontFamily: 'Albert Sans' }}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <button
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-2">{currentStep.title}</h3>
        <p className="text-muted-foreground mb-6">{currentStep.description}</p>

        {/* Progress dots */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors"
          >
            {step === TUTORIAL_STEPS.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

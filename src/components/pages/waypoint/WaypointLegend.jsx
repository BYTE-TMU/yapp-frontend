import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const LEGEND_ITEMS = [
  { emoji: '🍕', label: 'Food', color: '#f59e0b' },
  { emoji: '📚', label: 'Study Spots', color: '#3b82f6' },
  { emoji: '👥', label: 'Groups', color: '#10b981' },
  { emoji: '🎉', label: 'Social', color: '#8b5cf6' },
  { emoji: '📅', label: 'Events', color: '#ef4444' },
  { emoji: '📍', label: 'Other', color: '#6b7280' },
];

function WaypointLegend() {
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className="absolute bottom-8 right-4 z-[1000] hidden md:block"
      style={{ fontFamily: 'Albert Sans' }}
    >
      <div className="bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-lg overflow-hidden transition-all">
        {/* Header - always visible */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors"
        >
          <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
            Legend
          </h4>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {/* Collapsible content */}
        <div
          className={`transition-all duration-200 overflow-hidden ${
            expanded ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-3 pb-3 space-y-1.5">
            {LEGEND_ITEMS.map(({ emoji, label, color }) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs border-2 border-white shadow-sm"
                  style={{ backgroundColor: color }}
                >
                  {emoji}
                </div>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WaypointLegend;

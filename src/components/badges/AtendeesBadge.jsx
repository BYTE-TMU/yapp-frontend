import { Badge } from '../ui/badge';
import { Users } from 'lucide-react';

function AtendeesBadge({ event }) {
  return (
    <Badge className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm rounded-md text-sm">
      <Users className="w-3 h-3" />
      <span>{event.attendees_count || 0}</span>
    </Badge>
  );
}

export default AtendeesBadge;

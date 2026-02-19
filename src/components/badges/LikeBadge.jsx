import { Badge } from '../ui/badge';
import { Heart } from 'lucide-react';

function LikeBadge({ event }) {
  return (
    <Badge
      variant="secondary"
      onClick={(e) => {
        e.stopPropagation();
        // Add like functionality here
      }}
      className="hover:text-destructive bg-destructive/10 hover:bg-destructive/20 text-destructive border-none"
    >
      <Heart className="size-3" />
      <span className="text-xs font-medium text-destructive">
        {event.likes_count || 0}
      </span>
    </Badge>
  );
}

export default LikeBadge;

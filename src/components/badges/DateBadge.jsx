import { Badge } from '../ui/badge';
import { Calendar } from 'lucide-react';
import { formatEventDate } from '@/utils/dateTimeUtils';

function DateBadge({ event }) {
  return (
    <Badge
      variant="secondary"
      className={
        'absolute top-3 left-3 rounded-md bg-white/50 backdrop-blur-sm text-gray-900 text-sm'
      }
    >
      <Calendar className="size-3" />
      {formatEventDate(event.event_datetime)}
    </Badge>
  );
}

export default DateBadge;

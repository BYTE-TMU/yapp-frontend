import { cn } from '@/utils/cnUtils';
import UserAvatar from './UserAvatar';
import { Badge } from '../ui/badge';

function UserBadge({ user, username, isDarkMode, withImage = true }) {
  return (
    <Badge className="px-1" variant="secondary">
      {withImage && <UserAvatar user={user} size="xs" />}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'text-xs font-medium',
            isDarkMode ? 'text-gray-300' : 'text-gray-700',
          )}
        >
          {username || 'Unknown'}
        </span>
      </div>
    </Badge>
  );
}
export default UserBadge;

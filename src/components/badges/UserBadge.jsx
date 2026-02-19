import UserAvatar from './UserAvatar';
import { Badge } from '../ui/badge';

function UserBadge({ user, username, withImage = true }) {
  return (
    <Badge className="px-1" variant="secondary">
      {withImage && <UserAvatar user={user} size="xs" />}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          {username || 'Unknown'}
        </span>
      </div>
    </Badge>
  );
}
export default UserBadge;

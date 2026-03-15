import {
  getDefaultProfilePicture,
  getProfilePictureUrl,
} from '@/utils/profileUtils';
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { cn } from '@/utils/cnUtils';
import { cva } from 'class-variance-authority';
import { Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const avatarVariants = cva(
  'rounded-full dark:border-gray-600 border-gray-300',
  {
    variants: {
      size: {
        default: 'w-8 h-8 border-1',
        xs: 'w-5 h-5 border-1',
        sm: 'w-12 h-12 border-2',
        md: 'w-16 h-16 border-2',
        lg: 'w-32 h-32 border-4',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

function UserAvatar({
  user,
  size,
  className,
  redirectOnClick,
  showCameraBadge = false,
  onCameraBadgeClick,
}) {
  const navigate = useNavigate();
  const handleProfilePhotoClick = (e) => {
    e.stopPropagation();
    navigate(`/profile/${user.user_id}`);
  };
  const handleCameraBadgeClick = (e) => {
    e.stopPropagation();
    onCameraBadgeClick?.(e);
  };

  const badge = showCameraBadge ? (
    <AvatarBadge
      onClick={handleCameraBadgeClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCameraBadgeClick(e);
        }
      }}
      className="cursor-pointer !size-8 hover:opacity-90 transition-opacity"
      aria-label="Change profile picture"
      role="button"
      tabIndex={0}
    >
      <Camera className="!w-4 !h-4" />
    </AvatarBadge>
  ) : null;

  if (redirectOnClick) {
    return (
      <Avatar
        className={cn(
          avatarVariants({ size }),
          showCameraBadge && 'overflow-visible',
          className
        )}
        onClick={handleProfilePhotoClick}
      >
        <AvatarImage
          src={getProfilePictureUrl(user.profile_picture)}
          alt={user.username}
          className="rounded-full"
        />
        <AvatarFallback>{getDefaultProfilePicture()}</AvatarFallback>
        {badge}
      </Avatar>
    );
  }
  return (
    <Avatar
      className={cn(
        avatarVariants({ size }),
        showCameraBadge && 'overflow-visible',
        className
      )}
    >
      <AvatarImage
        src={getProfilePictureUrl(user.profile_picture)}
        alt={user.username}
        className="rounded-full"
      />
      <AvatarFallback>{getDefaultProfilePicture()}</AvatarFallback>
      {badge}
    </Avatar>
  );
}

export default UserAvatar;

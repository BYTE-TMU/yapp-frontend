import {
  getDefaultProfilePicture,
  getProfilePictureUrl,
} from '@/utils/profileUtils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/utils/cnUtils';
import { cva } from 'class-variance-authority';
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

function UserAvatar({ user, size, className, redirectOnClick }) {
  const navigate = useNavigate();
  const handleProfilePhotoClick = (e) => {
    e.stopPropagation();
    navigate(`/profile/${user.user_id}`);
  };
  if (redirectOnClick) {
    return (
      <Avatar
        className={cn(avatarVariants({ size }), className)}
        onClick={handleProfilePhotoClick}
      >
        <AvatarImage
          src={getProfilePictureUrl(user.profile_picture)}
          alt={user.username}
        />
        <AvatarFallback>{getDefaultProfilePicture()}</AvatarFallback>
      </Avatar>
    );
  }
  return (
    <Avatar className={cn(avatarVariants({ size }), className)}>
      <AvatarImage
        src={getProfilePictureUrl(user.profile_picture)}
        alt={user.username}
      />
      <AvatarFallback>{getDefaultProfilePicture()}</AvatarFallback>
    </Avatar>
  );
}

export default UserAvatar;

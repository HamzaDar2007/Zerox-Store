import { Avatar, AvatarFallback, AvatarImage } from '@/common/components/ui/avatar';
import { getInitials } from '@/lib/format';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  name: string;
  image?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
};

export function UserAvatar({
  name,
  image,
  size = 'md',
  className,
}: UserAvatarProps) {
  return (
    <Avatar className={cn(sizeMap[size], className)}>
      {image && <AvatarImage src={image} alt={name} />}
      <AvatarFallback className="bg-primary/10 text-primary font-medium">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

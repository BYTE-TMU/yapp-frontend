import { cn } from "@/utils/cnUtils";
import { Badge } from "../ui/badge";
import { Heart } from "lucide-react";

function LikeBadge({ isDarkMode, event }) {
    return (
        <Badge variant="secondary" onClick={(e) => {
            e.stopPropagation();
            // Add like functionality here
        }}
        className={`hover:text-red-400 bg-red-400/20 dark:bg-red-400/10 `}>
            <Heart className="size-3" />
            <span className={cn('text-xs font-medium', isDarkMode ? 'text-gray-300' : 'text-gray-700')}>
                {event.likes_count || 0}
            </span>
        </Badge>
    );
}

export default LikeBadge;

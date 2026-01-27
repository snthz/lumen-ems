import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface NavigationButtonsProps {
    direction: 'prev' | 'next'
    disabled: boolean
    onClick: () => void
}

export function NavigationButtons({ direction, disabled, onClick }: NavigationButtonsProps) {
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            disabled={disabled}
            className="h-9 w-9"
        >
            {direction === 'prev' ? (
                <ChevronLeft className="h-4 w-4" />
            ) : (
                <ChevronRight className="h-4 w-4" />
            )}
        </Button>
    )
}
'use client'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useTelemetryQueryStore } from '@/features/telemetry/store/telemetry-query.store'
import { PhaseScope } from '@/features/telemetry/telemetry.types'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'

export function ScopeSection({ defaultOpen = true }: { defaultOpen?: boolean }) {
    const phaseScope = useTelemetryQueryStore(state => state.phaseScope)
    const setPhaseScope = useTelemetryQueryStore(state => state.setPhaseScope)

    return (
        <Collapsible defaultOpen={defaultOpen}>
            <div className="border-y py-2 px-6">
                <CollapsibleTrigger className="flex items-center gap-1 cursor-pointer text-sm text-neutral-500 group">
                    <ChevronDown className="size-3.5 transition-transform group-data-[state=closed]:-rotate-90" />
                    Alcance
                </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="px-6 py-4">
                <RadioGroup
                    value={phaseScope}
                    onValueChange={v => setPhaseScope(v as PhaseScope)}
                    className="flex gap-4 pt-2"
                >
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="SYSTEM" id="system" />
                        <Label htmlFor="system" className="cursor-pointer">Sistema</Label>
                    </div>

                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="PHASE" id="phase" />
                        <Label htmlFor="phase" className="cursor-pointer">Por fase</Label>
                    </div>
                </RadioGroup>
            </CollapsibleContent>
        </Collapsible>
    )
}
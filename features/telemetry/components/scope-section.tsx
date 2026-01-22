'use client'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useTelemetryQueryStore } from '@/features/telemetry/store/telemetry-query.store'
import { PhaseScope } from '@/features/telemetry/telemetry.types'

export function ScopeSection() {
    const phaseScope = useTelemetryQueryStore(state => state.phaseScope)
    const setPhaseScope = useTelemetryQueryStore(state => state.setPhaseScope)

    return (
        <div>
            <div className="border-y py-2">
                <span className="px-6 text-sm text-neutral-500">
                    Alcance
                </span>
            </div>

            <div className="px-6 py-4">
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
            </div>
        </div>
    )
}
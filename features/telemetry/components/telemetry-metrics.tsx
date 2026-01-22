'use client'

import { MetricsSection } from './metrics-section'
import { ResolutionSection } from './resolution-section'
import { ScopeSection } from './scope-section'

export function TelemetryMetrics() {
    return (
        <div className="space-y-4">
            <MetricsSection />
            <ResolutionSection />
            <ScopeSection />
        </div>
    )
}
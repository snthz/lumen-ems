export type ThingsBoardJwtClaims = {
    sub: string
    userId: string
    scopes: string[]
    sessionId: string
    exp: number
    iss: string
    iat: number
    firstName: string
    lastName: string
    enabled: boolean
    isPublic: boolean
    isBillingService: boolean
    privacyPolicyAccepted: boolean
    termsOfUseAccepted: boolean
    tenantId: string
    customerId: string
}

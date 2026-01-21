export type EntityType = 'CUSTOMER' | 'TENANT';

export interface EntityId {
    entityType: EntityType;
    id: string; // UUID
}

export interface CustomerAdditionalInfo {
    description?: string;
    allowWhiteLabeling?: boolean;
    homeDashboardId?: string | null;
    homeDashboardHideToolbar?: boolean;
}

export interface TbCustomerDto {
    id: EntityId;
    createdTime: number;

    name: string;
    title: string;

    country: string | null;
    state: string | null;
    city: string | null;
    address: string | null;
    address2: string | null;
    zip: string | null;

    phone: string | null;
    email: string | null;

    tenantId: EntityId;
    ownerId: EntityId;

    parentCustomerId: EntityId | null;
    customerId: EntityId | null;

    externalId: string | null;

    version: number;

    customMenuId: { id: string } | null;

    additionalInfo: CustomerAdditionalInfo;
}

export type TbCustomersResponse = TbCustomerDto[];

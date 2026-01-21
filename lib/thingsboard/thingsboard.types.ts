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


export type TbEntityType =
    | 'DEVICE'
    | 'ASSET'
    | 'CUSTOMER'
    | 'TENANT'
    | 'DASHBOARD'
    | 'USER';

export interface TbEntityRef {
    id: string;          // UUID
    entityType: TbEntityType;
}

export type TbRelationTypeGroup =
    | 'COMMON'
    | 'ALARM'
    | 'RULE_CHAIN';

export interface TbRelation {
    from: TbEntityRef;
    to: TbEntityRef;

    type: string;        // e.g. "Contains", "Manages"
    typeGroup: TbRelationTypeGroup;

    version: number;

    fromName?: string;
    toName?: string;

    additionalInfo: Record<string, unknown>;
    children?: TbRelation[];
}


export type TbRelationsResponse = TbRelation[];

export type ID = string

export interface User {
    createdAt: Date
    createdBy: ID
    createdByUserId: ID
    id: ID,
    memberId: ID,
    modifiedAt: Date
    modifiedBy: ID
    modifiedByUserId: ID
    role: 'member' | string,
    teamId: ID,
    userRole: 'member' | string,
    type: 'team-member' | string,
    email: string
}

export interface TeamUser {
    createdAt: Date
    createdBy: ID
    createdByUserId: ID
    id: ID
    memberId: ID
    modifiedAt: Date
    modifiedBy: ID
    modifiedByUserId: ID
    role: "member"| string
    teamId: ID
    userRole: "member" | string
    type: "team-member" | string
}

export interface Team {
    id: ID
    name: string
}

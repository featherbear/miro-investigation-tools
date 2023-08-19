
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
    role: "member" | string
    teamId: ID
    userRole: "member" | string
    type: "team-member" | string
}

export interface Team {
    id: ID
    name: string
}


export interface Board {
    "id": ID,
    "type": "board",
    "name": string,
    "description": string,
    "links": {
        "self": URL,
        "related": URL
    },
    "createdAt": Date
    "createdBy": {
        "id": ID
        "type": "user",
        "name": string
    },
    "modifiedAt": Date
    "modifiedBy": {
        "id": ID
        "type": "user",
        "name": string
    },
    "owner": {
        "id": ID
        "type": "user",
        "name": string
    },
    "permissionsPolicy": {
        "collaborationToolsStartAccess": string | "all_editors",
        "copyAccess": string | "anyone",
        "copyAccessLevel": string | "anyone",
        "sharingAccess": string | "team_members_with_editing_rights"
    },
    "policy": {
        "permissionsPolicy": {
            "collaborationToolsStartAccess": string | "all_editors",
            "copyAccess": string | "anyone",
            "copyAccessLevel": string | "anyone",
            "sharingAccess": string | "team_members_with_editing_rights"
        },
        "sharingPolicy": {
            "access": string | "private",
            "inviteToAccountAndBoardLinkAccess": string | "no_access",
            "organizationAccess": string | "private",
            "teamAccess": string | "edit"
        }
    },
    "sharingPolicy": {
        "access": string | "private",
        "inviteToAccountAndBoardLinkAccess": string | "no_access",
        "organizationAccess": string | "private",
        "teamAccess": string | "edit"
    },
    "team": {
        "id": ID
        "type": "team",
        "name": string
    },
    "viewLink": URL
}
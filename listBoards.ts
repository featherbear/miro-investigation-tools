import fs from 'fs'
import { ID, Team, TeamUser, User } from './types'

export type URL = string

const sourceFiles = {
  boardsByTeam: 'data/boardsByTeam.json',
  teams: 'data/teams.json',
}

const destFiles = {
  boards: 'data/boards.flat.json',
}

if (!fs.existsSync(sourceFiles.boardsByTeam)) {
  console.error(`${sourceFiles.boardsByTeam} does not exist`)
  process.exit(1)
}

if (!fs.existsSync(sourceFiles.teams)) {
  console.error(`${sourceFiles.teams} does not exist`)
  process.exit(1)
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

let boardsByTeam: { [team: ID]: Board[] } = JSON.parse(fs.readFileSync(sourceFiles.boardsByTeam).toString())
let teams: { [team: ID]: Team } = JSON.parse(fs.readFileSync(sourceFiles.teams).toString()).reduce((obj, team) => ({ ...obj, [team.id]: team }), {})

for (let team of Object
  .values(teams)
  .sort(({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB))
) {
  console.log(team.id, team.name, boardsByTeam[team.id].length);
}

let allBoards: Board[] = []
for (let boards of Object.values(boardsByTeam)) {
  allBoards.push(...boards)
}

fs.writeFileSync(destFiles.boards, JSON.stringify(allBoards))
console.log(`Read in ${allBoards.length} boards`);


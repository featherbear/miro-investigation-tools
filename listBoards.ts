import fs from 'fs'
import { Board, ID, Team, TeamUser, User } from './types'
import { dataMethods } from './utils'

export type URL = string


const destFiles = {
  boards: 'data/boards.flat.json',
}


let boardsByTeam = dataMethods.boardsByTeam()
let teams = dataMethods.teams()
let orgUsers = dataMethods.orgUsers()
const ignoreList = dataMethods.domainIgnoreList()

// // General team information
// for (let team of Object
//   .values(teams)
//   .sort(({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB))
// ) {
//   console.log(team.id, team.name, boardsByTeam[team.id].length);
// }

let allBoards: Board[] = []
for (let boards of Object.values(boardsByTeam)) {
  allBoards.push(...boards)
}

fs.writeFileSync(destFiles.boards, JSON.stringify(allBoards))
console.log(`Read in ${allBoards.length} boards`);

//

let ExternalOwnedBoards: any[] = []
for (let board of allBoards) {
  let email = orgUsers[board.owner.id].email
  if (dataMethods.isDomainEmail(email, ignoreList)) continue
  const newItem = {
    name: board.name, team: board.team.name, owner: email, link: board.viewLink, created: board.createdAt, updated: board.modifiedAt
  }

  ExternalOwnedBoards.push(newItem)
  console.log("Found external board " + ExternalOwnedBoards.length);
}

ExternalOwnedBoards.sort((a,b) => a.updated.localeCompare(b.updated))

console.log(ExternalOwnedBoards.map((o) => Object.values(o).join(",")).join("\n"));
// console.table(ExternalOwnedBoards)
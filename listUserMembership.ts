import { ID, Team, TeamUser, User } from './types'
import { dataMethods } from './utils'

let domainIgnoreList = dataMethods.domainIgnoreList()

let orgUsers = dataMethods.orgUsers()
let externalUsers = dataMethods.externalUsers()
let internalUsers = dataMethods.internalUsers()

let teams = dataMethods.teams()
let teamUsers = dataMethods.teamUsers()

console.log(`Found ${Object.values(orgUsers).length} users added into the organisation (either as a guest, or a team member), of which ${externalUsers.length} are external`);


let unknown: [Team, User][] = []
function alertUnknown(team: Team, obj: User) {
    let email = orgUsers[obj.id]?.email
    if (!email) {
        unknown.push([team, obj])
        return "unknown"
    }
    return email
}

interface TeamUser__Pair {
    Members: User[]
    Team: Team
}

let teamsWithExternalMembers: TeamUser__Pair[] = teams
    .map(team => ({
        Team: team, Members: teamUsers[team.id].flat().filter(

            (user) => !internalUsers.includes(user.id)


        ).map((obj) => ({ ...obj, email: alertUnknown(team, obj) }))
    }))

function filterHasMembers(obj: TeamUser__Pair[]) {
    return [...obj].filter(({ Members }) => Members.length > 0)
}

function sortByMemberCount(obj: TeamUser__Pair[]) {
    return [...obj].sort((a, b) => b.Members.length - a.Members.length)
}

function summateMembers(obj: TeamUser__Pair[]) {
    return obj.map((obj) => ({ ...obj, Members: obj.Members.length }))
}

console.log();
console.log("Teams with external members as guests (Can view some)");
var users = teamsWithExternalMembers.map((obj) => ({ ...obj, Members: obj.Members.filter(u => u.role === 'non_team') }))
console.table(
    summateMembers(
        sortByMemberCount(filterHasMembers(
            users)
        )),
    ["Team", "Members"]
)

console.log();

users = teamsWithExternalMembers.map((obj) => ({ ...obj, Members: obj.Members.filter(u => u.role !== 'non_team') }))
console.log("Teams with external members in the team ⚠️ CAN VIEW ALL BOARDS ⚠️");

// console.table(
//     sortByMemberCount(filterHasMembers(users))
//         .flatMap(o => (
//             o.Members.map((member: User, i) => ({
//                 Team: o.Team.name,
//                 TeamID: o.Team.id,
//                 Count: i + 1,
//                 Member: member.email,

//             }))
//         ))
// );


for (let group of
    (function sortByMemberCount(obj: TeamUser__Pair[]) {
        return [...obj].sort((a, b) => a.Team.name.localeCompare(b.Team.name))
    })(filterHasMembers(users)).map(o => ({
        Team: o.Team.name,
        TeamID: o.Team.id,
        // Admin: teamUsers[o.Team.id].filter(u => u.role === 'admin').map(u => orgUsers[u.id].email),
        Member: o.Members.map(u => u.email).join('*')
    }))
) {
    console.log([group.Team, group.TeamID, group.Member].join(","));
}

// // // // // Team, Count // // // // //
// console.table(
//     summateMembers(
//         sortByMemberCount(filterHasMembers(
//             users
//         )
//         )),
//     ["Team", "Members"]
// )

if (unknown.length > 0) {
    console.warn(unknown)
}

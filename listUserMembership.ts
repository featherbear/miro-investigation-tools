import fs from 'fs'

type ID = string

interface User {
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

interface Team {
    id: ID
    name: string
}

const sourceFiles = {
    orgUsers: "data/orgUsers.json",
    teams: "data/teams.json",
    teamUsers: "data/teamUsers.json"
}

{
    let fail = false
    for (let [type, path] of Object.entries(sourceFiles)) {
        if (!fs.existsSync(path)) {
            console.warn(`${path} does not exist, pull ${type} first`)
        }
    }

    if (fail) {
        process.exit(1)
    }
}

let domainIgnoreList = (process.env["DOMAIN"] ?? "").split(",")

let orgUsers: User[] = JSON.parse(fs.readFileSync(sourceFiles.orgUsers).toString())
let externalUsers: ID[] = Object.values(orgUsers).filter(({ email }: { email: string }) => !domainIgnoreList.some(suffix => email.endsWith(`@${suffix}`))).map(({ id }) => id)
let internalUsers: ID[] = Object.values(orgUsers).filter(({ email }: { email: string }) => domainIgnoreList.some(suffix => email.endsWith(`@${suffix}`))).map(({ id }) => id)

let teams: Team[] = JSON.parse(fs.readFileSync(sourceFiles.teams).toString()).flat()
let teamUsers = JSON.parse(fs.readFileSync(sourceFiles.teamUsers).toString())

console.log(`Found ${Object.values(orgUsers).length} org users, of which ${externalUsers.length} are external`);


let unknown: [Team, User][] = []
function alertUnknown(team: Team, obj: User) {
    let email = orgUsers[obj.id]?.email
    if (!email) {
        unknown.push([team, obj])
        return "unknown"
    }
    return email
}

interface Thingy {
    Members: User[]
    Team: string
}

let teamsWithExternalMembers: Thingy[] = teams
    .map(team => ({
        Team: team.name, Members: teamUsers[team.id].flat().filter(

            (user) => !internalUsers.includes(user.id)


        ).map((obj) => ({ ...obj, email: alertUnknown(team, obj) }))
    }))

function filterHasMembers(obj: Thingy[]) {
    return [...obj].filter(({ Members }) => Members.length > 0)
}

function sortByMemberCount(obj: Thingy[]) {
    return [...obj].sort((a, b) => b.Members.length - a.Members.length)
}

function summateMembers(obj: Thingy[]) {
    return obj.map((obj) => ({ ...obj, Members: obj.Members.length }))
}

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

console.table(
    sortByMemberCount(filterHasMembers(users))
        .flatMap(o => (
            o.Members.map((member: User, i) => ({
                Team: o.Team,
                Count: i + 1,
                Member: member.email
            }))
        ))
);

// // // // // Team, Count // // // // //
// console.table(
//     summateMembers(
//         sortByMemberCount(filterHasMembers(
//             users
//         )
//         )),
//     ["Team", "Members"]
// )

if (unknown.length) {
    console.warn(unknown)
}

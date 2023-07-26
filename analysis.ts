import fs from 'fs'


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

let orgUsers: [] = JSON.parse(fs.readFileSync(sourceFiles.orgUsers).toString())

let orgUsers_external_ids = Object.values(orgUsers)
    // .filter(({ role }) => role !== 'organization_external_user')
    .filter(({ email }: { email: string }) => !email.endsWith(`@${process.env["DOMAIN"]}`))


let atlUsers: string[] = Object.values(orgUsers).filter(({ email }: { email: string }) => email.endsWith("@atlassian.com")).map(({ id }) => id)


let teams: [] = JSON.parse(fs.readFileSync(sourceFiles.teams).toString()).flat()
let teamUsers = JSON.parse(fs.readFileSync(sourceFiles.teamUsers).toString())

console.log(`Found ${Object.values(orgUsers).length} org users, of which ${orgUsers_external_ids.length} are external`);


function filterOutAtlassian(atlID) {
    return !atlUsers.includes(atlID.id)
}

let unknown = []
function alertUnknown(team, obj) {
    let email = orgUsers[obj.id]?.email
    if (!email) {
        unknown.push([team, obj])
        return "unknown"
    }
    return email
}

interface Thingy {
    Members: any[]
    Team: string
}

let teamsWithExternalMembers: Thingy[] = teams
    .map(team => ({ Team: team.name, Members: teamUsers[team.id].flat().filter(filterOutAtlassian).map((obj) => ({ ...obj, email: alertUnknown(team, obj) })) }))

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
    summateMembers(
        sortByMemberCount(filterHasMembers(
            users
        )
        )),
    ["Team", "Members"]
)

// console.log(
// JSON.stringify(
//     sortByMemberCount(filterHasMembers(users)).map(team => ({ team: team.Team, users: team.Members.map(u => u.email) })))
// )


if (unknown.length) {
    console.warn(unknown)
}

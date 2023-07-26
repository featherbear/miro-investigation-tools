import fetch from 'node-fetch'

const sourceFile = "data/teams.json"
const destFile = "data/teamUsers.json"

async function getTeamUsers(team: string, cursor?: string) {
    let params = new URLSearchParams()
    if (typeof cursor !== 'undefined') {
        params.set("cursor", cursor)
    }
    params.set("limit", "100")
    return fetch(
        `https://api.miro.com/v2/orgs/${process.env["ORG_ID"]}/teams/${team}/members?${params.toString()}`,
        {
            headers: {
                "Authorization": "Bearer " + process.env["API_KEY"]
            },

        }
    ).then(r => r.json())
}

import fs from 'fs'
let data = {}

if (!fs.existsSync(sourceFile)) {
    console.error(`${sourceFile} does not exist, pull teams first`)
    process.exit(1)
}
let teams = JSON.parse(fs.readFileSync(sourceFile).toString())
console.log(`Loaded ${teams.length} teams`);

async function main() {

    for (let team of teams) {
        console.log(`Fetching users for '${team.name}' (${team.id})`)
        data[team.id] = []
        let lastCursor = undefined

        let i = 1;
        do {
            let resp = await getTeamUsers(team.id, lastCursor)
            data[team.id].push(...resp['data'])
            lastCursor = resp.cursor
            console.log(`\tFetched page ${i++} (${resp['data'].length})`);
        }
        while (lastCursor)

        console.log(`\tTotal: ${data[team.id].length} users for '${team.name}' (${team.id})`);
    }

    fs.writeFileSync(destFile, JSON.stringify(data))
}

main()
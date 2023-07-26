import fetch from 'node-fetch'

const destFile = "data/teams.json"

async function getTeams(cursor?: string) {
    let params = new URLSearchParams()
    if (typeof cursor !== 'undefined') {
        params.set("cursor", cursor)
    }
    params.set("limit", "100")

    return fetch(
        `https://api.miro.com/v2/orgs/${process.env["ORG_ID"]}/teams?${params.toString()}`,
        {
            headers: {
                "Authorization": "Bearer " + process.env["API_KEY"]
            },

        }
    ).then(r => r.json())
}

import fs from 'fs'
let data = []

async function main() {
    let lastCursor = undefined
    let i = 1;
    do {
        let resp = await getTeams(lastCursor)
        data.push(...resp['data'])
        lastCursor = resp.cursor
        console.log(`Fetched page ${i++} (${resp['data'].length})`);
    }
    while (lastCursor)

    console.log(`Total: ${data.length} teams`);
    fs.writeFileSync(destFile, JSON.stringify(data))
}

main()

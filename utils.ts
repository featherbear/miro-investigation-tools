import { Board, ID, Team, TeamUser, User } from './types'
import fs from 'fs'

export const sourceFiles = {
    orgUsers: "data/orgUsers.json",
    teams: "data/teams.json",
    teamUsers: "data/teamUsers.json",
    boardsByTeam: 'data/boardsByTeam.json',

}

function fileCheck(path: string) {
    if (!fs.existsSync(path)) {
        throw new Error(`${path} does not exist`)
    }
}

export const dataMethods = {
    domainIgnoreList() {
        return (process.env["DOMAIN"] ?? "").split(",")
    },

    isDomainEmail(input: string, domains?: string[]) {
        return (domains ?? dataMethods.domainIgnoreList()).some(domain => input.endsWith('@' + domain))
    },

    orgUsers(): { [id: ID]: User } {
        fileCheck(sourceFiles.orgUsers)
        return JSON.parse(fs.readFileSync(sourceFiles.orgUsers).toString())
    },

    externalUsers(): ID[] {
        return Object.values(dataMethods.orgUsers()).filter(({ email }: { email: string }) => !dataMethods.domainIgnoreList().some(suffix => email.endsWith(`@${suffix}`))).map(({ id }) => id)
    },

    internalUsers(): ID[] {
        return Object.values(dataMethods.orgUsers()).filter(({ email }: { email: string }) => dataMethods.domainIgnoreList().some(suffix => email.endsWith(`@${suffix}`))).map(({ id }) => id)
    },


    boardsByTeam(): { [team: ID]: Board[] } {
        fileCheck(sourceFiles.boardsByTeam)
        return JSON.parse(fs.readFileSync(sourceFiles.boardsByTeam).toString())
    },

    teams(): Team[] {
        fileCheck(sourceFiles.teams)
        return JSON.parse(fs.readFileSync(sourceFiles.teams).toString()).flat()
    },

    teamUsers(): { [team: ID]: TeamUser[] } {
        fileCheck(sourceFiles.teamUsers)
        return JSON.parse(fs.readFileSync(sourceFiles.teamUsers).toString())
    }
}

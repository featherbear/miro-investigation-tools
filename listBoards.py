import os
import json

srcFiles = dict(boardsByTeam="data/boardsByTeam.json", teams="data/teams.json")

if not os.path.exists(srcFiles["boardsByTeam"]):
    print(f"{srcFiles['boardsByTeam']} does not exist")
    exit(1)

if not os.path.exists(srcFiles["teams"]):
    print(f"{srcFiles['teams']} does not exist")
    exit(1)

with open(srcFiles["boardsByTeam"]) as f:
    boardsByTeam = json.load(f)

with open(srcFiles["teams"]) as f:
    _teams = json.load(f)
    teams = {}
    for team in _teams:
        teams[team["id"]] = team

# Alphabetise
teamsOrdered = sorted(
    [teams[teamId] for teamId in boardsByTeam.keys()], key=lambda team: team["name"]
)

for team in teamsOrdered:
    output = (team["id"], team["name"], len(boardsByTeam[team["id"]]))
    print("\t".join(map(str, output)))

# Flatten boards
allBoards = []
for boards in boardsByTeam.values():
    allBoards.extend(boards)

with open("data/boards.flat.json", "w") as f:
    json.dump(allBoards, f)

print(f"There are a total of {len(allBoards)} boards")


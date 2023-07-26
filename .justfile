set dotenv-load := true

@_default:
	just --list

@getOrgUsers:
	yarn sucrase-node getOrgUsers.ts

@getTeams:
	yarn sucrase-node getTeams.ts

@getTeamUsers:
	yarn sucrase-node getTeamUsers.ts

@listUserMembership:
	yarn sucrase-node listUserMembership.ts

@getBoards:
	poetry run python3 getBoards.py

@listBoards:
	poetry run python3 listBoards.py

@_suite:
	just getOrgUsers
	just getTeams
	just getTeamUsers
	just getBoards
	just listUserMembership
	just listBoards
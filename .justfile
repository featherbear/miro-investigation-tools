set dotenv-load := true

@_default:
	just --list

# Get all users of a Miro organisation
@getOrgUsers:
	yarn sucrase-node getOrgUsers.ts

# Get teams of a Miro organisation
@getTeams:
	yarn sucrase-node getTeams.ts

# Get users' team memberships
@getTeamUsers:
	yarn sucrase-node getTeamUsers.ts

# Get boards of a Miro organisation, by team
@getBoards:
	poetry run python3 getBoards.py

# Show information about user memberships
@listUserMembership:
	yarn sucrase-node listUserMembership.ts

# Show information about boards in a team
@listBoards:
	poetry run python3 listBoards.py

@_suite:
	just getOrgUsers
	just getTeams
	just getTeamUsers
	just getBoards
	just listUserMembership
	just listBoards
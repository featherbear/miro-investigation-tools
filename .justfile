set dotenv-load := true

@_default:
	just --list

@getOrgUsers:
	yarn sucrase-node getOrgUsers.ts

@getTeams:
	yarn sucrase-node getTeams.ts

@getTeamUsers:
	yarn sucrase-node getTeamUsers.ts

@analysis:
	yarn sucrase-node analysis.ts

@boardStats:
	poetry run python3 boardStats.py

@downloadBoardData:
	poetry run python3 downloadBoardData.py

@_suite:
	(just getOrgUsers) &
	(just getTeams && just getTeamUsers) &
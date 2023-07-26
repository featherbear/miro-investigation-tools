# async scraper code from https://blog.devgenius.io/best-way-to-speed-up-a-bulk-of-http-requests-in-python-4ec75badabed

import asyncio
import aiohttp
import time
from aiolimiter import AsyncLimiter
import json
import os
import urllib.parse

destPath = "data/boards"

teams: list = []

srcFile = "data/teams.json"
if not os.path.exists(srcFile):
    print(f"{srcFile} does not exist")
    exit(1)

with open(srcFile) as f:
    teams = json.load(f)
    print(f"Loaded {len(teams)} teams")


headers = dict(Authorization="Bearer " + os.getenv("API_KEY"))

pageSize = 50

# There's a limit of 2000 req/min
# https://developers.miro.com/reference/api-reference
# But we'll go under.. in case.. something..
limiter = AsyncLimiter(1600)
semaphore = asyncio.Semaphore(value=100)


async def fetch(teamId: str, offset=0, size=pageSize, logging=True):
    url = "https://api.miro.com/v2/boards/?" + urllib.parse.urlencode(
        dict(team_id=teamId, offset=offset, limit=size)
    )

    async with aiohttp.ClientSession(headers=headers) as session:
        await semaphore.acquire()
        async with limiter:
            if logging:
                print(f"Begin fetching {url} {(time.perf_counter() - s):0.4f} seconds")
            async with session.get(url) as resp:
                content = await resp.json()

                # print(f"Finished fetching {url}")

                semaphore.release()
                return content


boards = dict()


async def web_scrape_task(id: str, offset=0) -> None:
    response = await fetch(id, offset)
    boards[id].extend(response["data"])


async def web_fetch_task(team: dict) -> None:
    id = team["id"]

    tasks = []
    response = await fetch(id, offset=0, size=1, logging=False)
    size = response["total"]

    print(f"Will fetch {size} items in total for {id} ({team['name']})")

    offset = 0
    while offset < size:
        tasks.append(asyncio.create_task(web_scrape_task(id, offset)))
        offset += pageSize

    return tasks


async def main() -> None:
    jobs = []
    for team in teams:
        print(f"Preparing board scraper for {team['id']} ({team['name']})")
        boards[team["id"]] = []
        jobs.append(asyncio.create_task(web_fetch_task(team)))

    done, _ = await asyncio.wait(jobs)

    jobs = []
    for teamTasks in done:
        jobs.extend(teamTasks.result())

    await asyncio.wait(jobs)
    with open("data/boardsByTeam.json", "w") as f:
        json.dump(boards, f)


if __name__ == "__main__":
    s = time.perf_counter()
    asyncio.run(main())
    elapsed = time.perf_counter() - s
    print(f"Execution time: {elapsed:0.2f} seconds.")

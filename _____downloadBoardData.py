# async scraper code from https://blog.devgenius.io/best-way-to-speed-up-a-bulk-of-http-requests-in-python-4ec75badabed

import asyncio
import aiohttp
import time
from aiolimiter import AsyncLimiter
import json
import os

destPath = "data/boards"

# There's a limit of 2000 req/min
# https://developers.miro.com/reference/api-reference
# But we'll go under.. in case.. something..
limiter = AsyncLimiter(1600)

headers=dict(Authorization="Bearer " + os.getenv("API_KEY"))

async def download(id: str, semaphore):
    url = f"https://api.miro.com/v2/boards/{id}"
    async with aiohttp.ClientSession(headers=headers) as session:
        await semaphore.acquire()
        async with limiter:
            print(f"Begin downloading {url} {(time.perf_counter() - s):0.4f} seconds")
            async with session.get(url) as resp:
                

                content = await resp.json()
                print(f"Finished downloading {url}")

                async with aiohttp.ClientSession() as secondarySession:
                    async with secondarySession.head(f"https://miro.com/api/v1/boards/{id}") as accessResp:
                       content["v1_head"] = accessResp.status

                semaphore.release()
                return content

async def write_to_file(id: str, content: dict) -> None:
    filename = f"{destPath}/{id}.json"
    with open(filename, "w") as outputFile:
        print(f"Begin writing to {filename} {(time.perf_counter() - s):0.4f} seconds")
        json.dump(content, outputFile)
        print(f"Finished writing {filename} {(time.perf_counter() - s):0.4f} seconds")

def doesIDexist(id: str) -> bool:
    return os.path.exists(f"{destPath}/{id}.json")

async def web_scrape_task(id: str, semaphore) -> None:
    content = await download(id, semaphore)
    await write_to_file(id, content)

async def main() -> None: 
    tasks = []
    semaphore = asyncio.Semaphore(value=100)
    items = list(filter(lambda d: not doesIDexist(d), map(lambda l: l.strip(), open("ids.txt", "r").readlines())))
    print(f"There are {len(items)} items to fetch")
    if len(items) == 0:
        return

    for i in items:
        tasks.append(web_scrape_task(i, semaphore))
    await asyncio.wait(tasks)

if __name__ == "__main__":
    s = time.perf_counter()
    asyncio.run(main()) # Activate this line if the code is to be executed in VS Code
    # , etc. Otherwise deactivate it.
    # await main()          # Activate this line if the code is to be executed in Jupyter 
    # Notebook! Otherwise deactivate it.
    elapsed = time.perf_counter() - s
    print(f"Execution time: {elapsed:0.2f} seconds.")
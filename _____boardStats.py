import os
import json
import requests

baseDir = "data/boards"
boards = os.listdir(baseDir)

# print(f"Found {len(boards)} files in {baseDir}")
stats = dict(notFound=0, noPermission=0, private=0, publicView=0, publicComment=0, publicEdit=0, noPassword=0)
for filename in boards:
    filename = os.path.join(baseDir, filename)
    
    with open(filename, "r") as f:
        data = json.load(f)
    
    def log():
        print(json.dumps(data))
    
    if data["type"] == "error":
        match data["status"]:
            case 404:
                stats["notFound"] += 1
            case 403:
                stats["noPermission"] += 1
            case 429:
                print("Rate limited...", filename)
                os.remove(filename)
            case _:
                print(data)
                break
        continue
    
    match data["sharingPolicy"]["access"]:
        case "private":
            stats["private"] += 1
        case "view":
            stats["publicView"] += 1
        case "comment":
            stats["publicComment"] += 1
        case "edit":
            stats["publicEdit"] += 1
    
    if data["v1_head"] == 200:
        stats["noPassword"] += 1
        print("reee", data["viewLink"])

print(json.dumps(stats))

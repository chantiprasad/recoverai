import json
from pathlib import Path


RUN_FILE = Path(__file__).resolve().parents[3] / "data" / "latest_run.json"


def save_latest_run(data):
    RUN_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(RUN_FILE, "w") as file:
        json.dump(data, file, indent=2)


def get_latest_run():
    if not RUN_FILE.exists():
        return None

    try:
        with open(RUN_FILE, "r") as file:
            return json.load(file)
    except json.JSONDecodeError:
        return None
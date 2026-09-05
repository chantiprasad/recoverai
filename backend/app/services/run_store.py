import json
from pathlib import Path


DATA_DIR = Path(__file__).resolve().parents[3] / "data"

LATEST_RUN_FILE = DATA_DIR / "latest_run.json"
HISTORY_FILE = DATA_DIR / "run_history.json"


def save_latest_run(data):
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    with open(LATEST_RUN_FILE, "w") as file:
        json.dump(data, file, indent=2)


def get_latest_run():
    if not LATEST_RUN_FILE.exists():
        return None

    try:
        with open(LATEST_RUN_FILE, "r") as file:
            return json.load(file)

    except (json.JSONDecodeError, OSError):
        return None


def save_run_history(run):
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    history = get_run_history()

    history.insert(0, run)

    with open(HISTORY_FILE, "w") as file:
        json.dump(
            {
                "runs": history
            },
            file,
            indent=2
        )


def get_run_history():
    if not HISTORY_FILE.exists():
        return []

    try:
        with open(HISTORY_FILE, "r") as file:
            data = json.load(file)

        if isinstance(data, dict):
            return data.get("runs", [])

        return []

    except (json.JSONDecodeError, OSError):
        return []
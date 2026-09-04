import json
from datetime import datetime
from pathlib import Path


AUDIT_FILE = (
    Path(__file__).resolve().parents[3]
    / "data"
    / "audit_log.json"
)


def write_audit_log(record):

    AUDIT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    existing_logs = []

    if AUDIT_FILE.exists():

        try:
            with open(AUDIT_FILE, "r") as file:
                existing_logs = json.load(file)

        except json.JSONDecodeError:
            existing_logs = []

    record["timestamp"] = datetime.now().isoformat()

    existing_logs.append(record)

    with open(AUDIT_FILE, "w") as file:

        json.dump(
            existing_logs,
            file,
            indent=2
        )


def get_audit_logs():

    if not AUDIT_FILE.exists():
        return []

    with open(AUDIT_FILE, "r") as file:

        try:
            return json.load(file)

        except json.JSONDecodeError:
            return []
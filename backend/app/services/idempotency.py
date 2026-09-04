import json
from pathlib import Path


PROCESSED_FILE = (
    Path(__file__).resolve().parents[3]
    / "data"
    / "processed_actions.json"
)


def load_processed_actions():

    if not PROCESSED_FILE.exists():
        return []

    try:
        with open(PROCESSED_FILE, "r") as file:
            return json.load(file)

    except json.JSONDecodeError:
        return []


def action_already_processed(payment_id, action):

    processed = load_processed_actions()

    action_key = f"{payment_id}:{action}"

    return action_key in processed


def mark_action_processed(payment_id, action):

    processed = load_processed_actions()

    action_key = f"{payment_id}:{action}"

    if action_key not in processed:
        processed.append(action_key)

    PROCESSED_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with open(PROCESSED_FILE, "w") as file:
        json.dump(
            processed,
            file,
            indent=2
        )
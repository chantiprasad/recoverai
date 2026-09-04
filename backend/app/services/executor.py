def execute_recovery(transaction, action):
    """
    Execute a recovery action in simulation mode.

    In production this layer would call the actual
    payment provider / notification service.
    """

    amount = transaction["amount"]
    payment_id = transaction["payment_id"]

    if action == "RETRY_PAYMENT":

        # Simulate a retry result.
        # Network-related failures have a higher
        # chance of succeeding on retry.

        if transaction["failure_reason"] == "network_timeout":
            recovered = True
        else:
            recovered = False

        if recovered:
            return {
                "status": "RECOVERED",
                "message": "Payment retry succeeded",
                "recovered_amount": amount
            }

        return {
            "status": "FAILED",
            "message": "Payment retry did not succeed",
            "recovered_amount": 0
        }

    if action == "SEND_PAYMENT_REMINDER":

        return {
            "status": "ACTION_EXECUTED",
            "message": "Payment reminder scheduled",
            "recovered_amount": 0
        }

    if action == "REQUEST_ALTERNATIVE_PAYMENT":

        return {
            "status": "ACTION_EXECUTED",
            "message": "Alternative payment request sent",
            "recovered_amount": 0
        }

    if action == "REQUEST_CARD_UPDATE":

        return {
            "status": "ACTION_EXECUTED",
            "message": "Card update request sent",
            "recovered_amount": 0
        }

    return {
        "status": "NOT_EXECUTED",
        "message": "No recovery action executed",
        "recovered_amount": 0
    }
import json
import os
import re
import base64
import boto3

ses = boto3.client("sesv2")

SENDER = os.environ.get("SENDER_EMAIL")           
RECIPIENT = os.environ.get("RECIPIENT_EMAIL")     
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN")
ALLOWED_ORIGIN_DEV = os.environ.get("ALLOWED_ORIGIN_DEV") 

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,7}")

def _cors_headers(origin):
    if (origin and ALLOWED_ORIGIN and origin == ALLOWED_ORIGIN) or (origin and ALLOWED_ORIGIN_DEV and origin == ALLOWED_ORIGIN_DEV):
        return {
            "Access-Control-Allow-Origin": origin,
            "Vary": "Origin",
            "Access-Control-Allow-Methods": "POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    return {}

def sanitize(text, max_len=3000):
    text = (text or "").strip()
    text = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F]", "", text)
    return text[:max_len]

def validate(payload):
    email = sanitize(payload.get("email"), 50)
    subject = sanitize(payload.get("subject"), 100)
    message = sanitize(payload.get("message"), 3000)

    if not EMAIL_RE.match(email) or not subject or not message:
        return None, "Invalid input."

    return {
        "email": email,
        "subject": subject,
        "message": message
    }, None

def lambda_handler(event, context):
    headers_in = event.get("headers") or {}
    origin = headers_in.get("origin") or headers_in.get("Origin")
    headers = _cors_headers(origin)

    # Handle CORS preflight
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 204,
            "headers": headers,
            "body": ""
        }

    try:
        body = event.get("body") or "{}"
        if event.get("isBase64Encoded"):
            body = base64.b64decode(body).decode("utf-8")
        data = json.loads(body)
    except Exception:
        return {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"ok": False, "error": "Bad JSON"})
        }

    clean, err = validate(data)
    if err:
        return {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"ok": False, "error": err})
        }

    text_body = (
        f"New contact form submission from AIgoals.app\n\n"
        f"Email: {clean['email']}\n"
        f"Subject: {clean['subject']}\n\n"
        f"Message:\n{clean['message']}\n"
    )

    try:
        ses.send_email(
            FromEmailAddress=SENDER,
            Destination={"ToAddresses": [RECIPIENT]},
            ReplyToAddresses=[clean["email"]],
            Content={
                "Simple": {
                    "Subject": {"Data": f"[Contact] {clean['subject']}"},
                    "Body": {"Text": {"Data": text_body}}
                }
            }
        )
        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({"ok": True})
        }
    except Exception as e:
        # Log e in CloudWatch in real code
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"ok": False, "error": "Send failed"})
        }

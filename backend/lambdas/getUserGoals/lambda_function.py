import json
import boto3
import os

DB_TABLE = os.environ.get("DB_TABLE")
db = boto3.client("dynamodb")

def lambda_handler(event, context):
    try: 
        user_id = event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]
        pk = f"USER#{user_id}"

        response = db.query(
            TableName=DB_TABLE,
            KeyConditionExpression="PK = :pk AND begins_with(SK, :sk_prefix)",
            ExpressionAttributeValues={
                ":pk": {"S": pk},
                ":sk_prefix": {"S": "GOAL#"}
            }
        )

        goals = []
        for item in response["Items"]:
            goals.append({
                "goalId": item["SK"]["S"].replace("GOAL#", ""),
                "goalText": item["goalText"]["S"],
                "createdAt": item["createdAt"]["S"]
            })

        return {
            "statusCode": 200,
            "body": json.dumps({ "goals": goals }),
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Authorization,Content-Type",
                "Access-Control-Allow-Methods": "GET"
            }
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({ "error": str(e) }),
            "headers": { "Access-Control-Allow-Origin": "*" }
        }

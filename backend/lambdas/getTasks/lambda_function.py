import json
import boto3
import os

DB_TABLE = os.environ.get("DB_TABLE")
db = boto3.client("dynamodb")

def lambda_handler(event, context):
    try: 
        user_id = event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]
        pk = f"USER#{user_id}"
        goal_id = event["queryStringParameters"]["goalId"] 

        if not goal_id:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing goalId"}),
                "headers": {"Content-Type": "application/json"}
            }

        sk_prefix = f"TASK#{goal_id}#"

        response = db.query(
            TableName=DB_TABLE,
            KeyConditionExpression="PK = :pk AND begins_with(SK, :sk_prefix)",
            ExpressionAttributeValues={
                ":pk": {"S": pk},
                ":sk_prefix": {"S": sk_prefix}
            }
        )

        tasks = []
        for item in response["Items"]:
            tasks.append({
                "taskId": item["SK"]["S"].split("#")[-1],
                "taskText": item["taskText"]["S"],
                "createdAt": item["createdAt"]["S"],
                "order": float(item["order"]["N"]),
                "completed": item["completed"]["BOOL"],
                "deadline": item["deadline"]["S"],
                "timeSpent": int(item["timeSpent"]["N"])
            })

        return {
            "statusCode": 200,
            "body": json.dumps({ "tasks": tasks }),
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

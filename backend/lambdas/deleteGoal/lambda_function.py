import json
import boto3
import os
import time 

DB_TABLE = os.environ.get("DB_TABLE")
db = boto3.client("dynamodb")

def lambda_handler(event, context):
    try: 
        user_id = event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]
        pk = f"USER#{user_id}"
        goal_id = event["queryStringParameters"]["goalId"] 
        sk_prefix = f"TASK#{goal_id}#"

        if not goal_id:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing goalId"}),
                "headers": {"Content-Type": "application/json"}
            }

        response = db.query(
            TableName=DB_TABLE,
            KeyConditionExpression="PK = :pk AND begins_with(SK, :sk_prefix)",
            ExpressionAttributeValues={
                ":pk": {"S": pk},
                ":sk_prefix": {"S": sk_prefix}
            }
        )
        
        #DELETE TASKS 
        sks = []
        for item in response["Items"]:
            sks.append(item["SK"]["S"])

        deleted = 0 
        for i in range(0, len(sks), 25):
            batch = sks[i:i+25]
            req = {DB_TABLE: [{"DeleteRequest": {"Key": {"PK": {"S": pk}, "SK": {"S": k}}}} for k in batch]}
            print("REQUEST")
            print(req)
            backoff = 0.05
            max_attemps = 5
            while max_attemps > 0:
                resp = db.batch_write_item(RequestItems=req)
                un = resp.get("UnprocessedItems", {}).get(DB_TABLE, [])
                deleted += len(batch) - len(un)
                if not un: 
                    break
                req = {DB_TABLE: un} 
                time.sleep(backoff)
                backoff *= 2
                max_attemps -= 1

        #DELETE GOAL
        sk = f"GOAL#{goal_id}"
        db.delete_item(
            TableName=DB_TABLE,
            Key={
                "PK": {"S": pk},
                "SK": {"S": sk}
            }
        )
        
        print(f"Deleted {deleted} tasks")

        return {
            "statusCode": 200,
            "body": json.dumps({ "success": True }),
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({ "error": str(e) }),
        }

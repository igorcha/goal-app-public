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
        body = json.loads(event["body"])
        task_id = body.get("taskId")
        completed = body.get("completed")

        if not goal_id:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing goalId"}),
                "headers": {"Content-Type": "application/json"}
            }
        if not task_id:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing taskId"}),
                "headers": {"Content-Type": "application/json"}
            }
            
        sk = f"TASK#{goal_id}#{task_id}"

        db.update_item(
            TableName=DB_TABLE,
            Key={
                "PK": {"S": pk},
                "SK": {"S": sk}
            },
            UpdateExpression="SET #completed = :completed",
            ExpressionAttributeNames={
                "#completed": "completed"
            },
            ExpressionAttributeValues={
                ":completed": {"BOOL": completed}
            }
        )


        return {
            "statusCode": 200,
            "body": json.dumps({ "success": True }),
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({ "error": str(e) }),
        }

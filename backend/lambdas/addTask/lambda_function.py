import json
import boto3
import os
import uuid
from datetime import datetime


DB_TABLE = os.environ.get("DB_TABLE")
db = boto3.client("dynamodb")

def lambda_handler(event, context):
    try: 
        user_id = event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]
        pk = f"USER#{user_id}"
        goal_id = event["queryStringParameters"]["goalId"] 
        body = json.loads(event["body"])
        task_id = str(uuid.uuid4())
        order = body.get("order")
        taskText = body.get("taskText")

        if not goal_id:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing goalId"}),
                "headers": {"Content-Type": "application/json"}
            }

        created_at = datetime.utcnow().isoformat()

        if 'deadline' in body:
            deadline = body['deadline']
        else:
            deadline = ''

        db.put_item(
            TableName=DB_TABLE,
            Item={
                "PK": {"S": f"USER#{user_id}"},
                "SK": {"S": f"TASK#{goal_id}#{task_id}"},
                "type": {"S": 'task'},
                "taskText": {"S": taskText},
                "completed": {"BOOL": False},
                "createdAt": {"S": created_at},
                "order": {"N": str(order)},
                "deadline": {"S": deadline},
                "timeSpent": {"N": '0'}
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

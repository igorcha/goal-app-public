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

        tasks = response['Items']
        tasks.sort(key=lambda t: float(t['order']['N']))

        for i, task in enumerate(tasks):
            new_order = (i+1)*1000.0
            task_id = task['SK']['S'].split('#')[-1]

            db.update_item(
                TableName=DB_TABLE,
                Key={
                    'PK': {'S': pk},
                    'SK': {'S': f"TASK#{goal_id}#{task_id}"}
                },
                UpdateExpression="SET #order = :new_order",
                ExpressionAttributeNames={
                    '#order': 'order'
                },
                ExpressionAttributeValues={
                    ':new_order': {'N': str(new_order)}
                }
            )

        return {
            "statusCode": 200,
            "body": json.dumps({ "message": 'Tasks reindexed successfully' }),
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({ "error": str(e) }),
            "headers": { "Access-Control-Allow-Origin": "*" }
        }

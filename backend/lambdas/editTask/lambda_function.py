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
        print(body)
        task_id = body.get("taskId")

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
        

        update_expr = []
        expr_attr_vals = {}
        expr_attr_names = {}

        if 'taskText' in body:
            update_expr.append('#text = :taskText')
            expr_attr_vals[':taskText'] = {'S': body['taskText']}
            expr_attr_names['#text'] = 'taskText'

        if 'deadline' in body:
            update_expr.append('#deadline = :deadline')
            expr_attr_vals[':deadline'] = {'S': body['deadline']}
            expr_attr_names['#deadline'] = 'deadline'

        if 'timeSpent' in body:
            update_expr.append('#timeSpent = :timeSpent')
            expr_attr_vals[':timeSpent'] = {'N': str(body['timeSpent'])}
            expr_attr_names['#timeSpent'] = 'timeSpent'

        if not update_expr:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Nothing to update'})
            }

        db.update_item(
            TableName=DB_TABLE,
            Key={
                "PK": {"S": pk},
                "SK": {"S": sk}
            },
            UpdateExpression='SET ' + ', '.join(update_expr),
            ExpressionAttributeValues=expr_attr_vals,
            ExpressionAttributeNames=expr_attr_names
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

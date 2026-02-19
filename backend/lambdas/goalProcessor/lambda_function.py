import json
import os
import urllib.request
import re 
import time 
import uuid
from datetime import datetime
import boto3
from huggingface_hub import InferenceClient


HF_API_KEY = os.environ.get("HF_API_KEY")
#HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.1"  
#HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.3"
HF_MODEL = "meta-llama/Llama-3.1-8B-Instruct"
DB_TABLE = os.environ.get("DB_TABLE")

db = boto3.client("dynamodb")

#def extract_tasks_bullets(text: str) -> list[str]:
#    # Split by bullet styles: "- ", "* ", or "1. "
#    #raw_tasks = re.split(r'(?m)^\s*(?:[-*]|\d+\.)\s+', text)
#    raw_tasks = re.split(r'\n+\s*(?:[-*•→]|\d+\.)\s+', text)
#
#    # Clean and filter out empty or short lines
#    cleaned_tasks = [task.strip() for task in raw_tasks if task.strip()]
#    return cleaned_tasks

def extract_tasks_bullets(text: str) -> list[str]:                                                                                                                                                                              
      raw_tasks = re.split(r'\n+\s*(?:[-*•→]|\d+\.)\s+', text)                                                                                                                                                                    
                                                                                                                                                                                                                                  
      cleaned = []                                                                                                                                                                                                                
      seen = set()                                                                                                                                                                                                                
      for task in raw_tasks:                                                                                                                                                                                                      
          # Strip markdown formatting and leading number prefixes                                                                                                                                                                 
          task = re.sub(r'[*#_`]+', '', task)                                                                                                                                                                                     
          task = re.sub(r'^\d+\.\s*', '', task).strip()                                                                                                                                                                           
          if not task or len(task) < 10:                                                                                                                                                                                          
              continue                                                                                                                                                                                                            
          key = task.lower()                                                                                                                                                                                                      
          if key not in seen:                                                                                                                                                                                                     
              seen.add(key)                                                                                                                                                                                                       
              cleaned.append(task)                                                                                                                                                                                                
                                                                                                                                                                                                                                  
      return cleaned

def call_huggingface(goal: str):
    #url = f"https://api-inference.huggingface.co/models/{HF_MODEL}"
    #url = "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.3"
    client = InferenceClient(
    provider="novita",
    api_key=HF_API_KEY,
    )
    prompt = f"Break the following goal into a single flat numbered list of actionable tasks. Each task should be a specific, concrete action, not a category or phase. If the goal mentions a timeframe, distribute tasks across that timeframe. Output ONLY the numbered list. No introductions, no summaries, no section headers, no sub-lists, no markdown formatting, no commentary before or after the list. Maximum 12 tasks.\n\nGoal: {goal}" 


    completion = client.chat.completions.create(
        model=HF_MODEL,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    return completion.choices[0].message["content"]


    #headers = {
    #    "Authorization": f"Bearer {HF_API_KEY}",
    #    "Content-Type": "application/json"
    #}
    #payload = json.dumps({"inputs": f"Break this specific goal down into 5-8 steps and output them as bullet points: {goal}"})
    
    #req = urllib.request.Request(url, data=payload.encode(), headers=headers)
    #with urllib.request.urlopen(req) as res:
    #    result = res.read().decode()
    #    return json.loads(result)

def lambda_handler(event, context):
    body = json.loads(event['body']) if 'body' in event else {}
    goal = body.get("goal", "")
    user_id = event['requestContext']['authorizer']['jwt']['claims']['sub']

    if not goal:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Missing goal"}),
            "headers": {"Content-Type": "application/json"}
        }

    try:
        for i in range(3):  # Retry mechanism
            try:
                ai_response = call_huggingface(goal)
                break
            except Exception as e:
                if i == 2:  # Last attempt
                    raise e
                time.sleep(2)  # Wait for 2 seconds before retrying

        # The model usually returns a list with one generated string
        #generated_text = ai_response[0]["generated_text"]
        print("----RAW TEXT----")
        print(repr(ai_response))
        print("----------------")


        # Split it into steps 
        #tasks = [line.strip() for line in generated_text.split("\n") if line.strip()]
        tasks = extract_tasks_bullets(ai_response)

        #store in dynamodb=================================================================
        created_at = datetime.utcnow().isoformat()
        goal_id = str(uuid.uuid4())

        #Goal
        db.put_item(
            TableName=DB_TABLE,
            Item={
                "PK": {"S": f"USER#{user_id}"},
                "SK": {"S": f"GOAL#{goal_id}"},
                "type": {"S": 'goal'},
                "goalText": {"S": goal},
                "createdAt": {"S": created_at}
            }
        )

        #Tasks
        ordered_tasks = []
        for i, task_text in enumerate(tasks):
            task_id = str(uuid.uuid4())
            order = 1000.0 * (i+1)
            db.put_item(
                TableName=DB_TABLE,
                Item={
                    "PK": {"S": f"USER#{user_id}"},
                    "SK": {"S": f"TASK#{goal_id}#{task_id}"},
                    "type": {"S": 'task'},
                    "taskText": {"S": task_text},
                    "completed": {"BOOL": False},
                    "createdAt": {"S": created_at},
                    "order": {"N": str(order)},
                    "deadline": {"S": ""},
                    "timeSpent": {"N": '0'}
                }
            )

            ordered_tasks.append({
                "taskId": task_id,
                "taskText": task_text,
                "order": order,
                "completed": False,
                "createdAt": created_at
            })


        return {
            "statusCode": 200,
            "body": json.dumps({
                "goalId": goal_id,
                "message": f"Your goal: {goal}",
                "tasks": ordered_tasks
            }),
            "isBase64Encoded": False,
            "headers": {"Content-Type": "application/json"}
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}),
            "headers": {"Content-Type": "application/json"}
        }

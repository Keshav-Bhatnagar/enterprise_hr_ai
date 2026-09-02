import json
import re
import os

log_path = r"C:\Users\kesha\.gemini\antigravity-ide\brain\843367e7-17db-4618-b9a3-3b144297a2f1\.system_generated\logs\transcript_full.jsonl"
raw_dir = r"E:\enterprise_hr_ai\data\raw"

print("Starting extraction...")

# Read the last user message containing the CSV dumps
target_content = ""
with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        if data.get('type') == 'USER_INPUT' and 'Age,Attrition,BusinessTravel' in data.get('content', ''):
            target_content = data['content']
            
if not target_content:
    print("Could not find the target user message.")
    exit(1)

# Split the text into blocks based on known headers
blocks = {}

# We know the specific headers from the context
headers = [
    ("Age,Attrition,BusinessTravel,DailyRate", "raw_ibm_attrition.csv"),
    ("EmployeeID,Name,Gender,Age,Department,JobRole,EducationLevel", "raw_demographics.csv"),
    ("Employee ID,Name,Department,Job Role,Performance Score,KPI Score", "raw_performance.csv"),
    ("Employee ID,StartDate,Title,BusinessUnit,EmployeeStatus,EmployeeType", "raw_training.csv")
]

# A simple parser to extract blocks starting with the headers until an empty line
# The user's input might have HTML tags or just be raw text
lines = target_content.split('\n')
current_file = None
current_data = []

for line in lines:
    line = line.strip()
    if not line:
        if current_file and current_data:
            blocks[current_file] = "\n".join(current_data)
            current_file = None
            current_data = []
        continue
        
    # Check if line matches any header
    matched = False
    for header, filename in headers:
        if line.startswith(header):
            if current_file and current_data:
                blocks[current_file] = "\n".join(current_data)
            current_file = filename
            current_data = [line]
            matched = True
            break
            
    if not matched and current_file:
        current_data.append(line)

if current_file and current_data:
    blocks[current_file] = "\n".join(current_data)

for filename, content in blocks.items():
    filepath = os.path.join(raw_dir, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Saved {filename} ({len(content.splitlines())} lines)")

print("Extraction complete.")

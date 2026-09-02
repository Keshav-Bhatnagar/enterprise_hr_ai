import pandas as pd
import requests
import io
import os

url = 'https://raw.githubusercontent.com/atulpal02/HR-recruitment-analysis-Dashboard/main/Recruitment_Data.csv'
try:
    response = requests.get(url)
    response.raise_for_status()
    df = pd.read_csv(io.StringIO(response.text))
    print('Success Atul dataset. Columns:', df.columns.tolist()[:5])
    df.to_csv('data/raw/ats_candidates.csv', index=False)
except Exception as e:
    print('Failed Atul:', e)

if not os.path.exists('data/raw/ats_candidates.csv'):
    url2 = 'https://raw.githubusercontent.com/Resume-Screening/resume_dataset.csv/main/resume_dataset.csv'
    try:
        response = requests.get(url2)
        response.raise_for_status()
        df = pd.read_csv(io.StringIO(response.text))
        print('Success Resume dataset. Columns:', df.columns.tolist()[:5])
        df.to_csv('data/raw/ats_candidates.csv', index=False)
    except Exception as e:
        print('Failed Resume:', e)

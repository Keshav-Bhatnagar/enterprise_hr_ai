import pdfminer.high_level as pml
import os

PDF_DIR = r'C:\Users\kesha\.gemini\antigravity-ide\brain\843367e7-17db-4618-b9a3-3b144297a2f1\.user_uploaded'

pdfs = ['media_1787927809205.pdf', 'media_1787927809226.pdf', 'media_1788196574887.pdf', 'media_1788196575061.pdf']

for fname in pdfs:
    path = os.path.join(PDF_DIR, fname)
    try:
        text = pml.extract_text(path)
        print(f'=== {fname} ({len(text)} chars) ===')
        print(text[:5000])
        print('\n[...]\n')
    except Exception as e:
        print(f'ERROR: {fname}: {e}')

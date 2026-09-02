import pdfminer.high_level as pml
import os

PDF_DIR = r'C:\Users\kesha\.gemini\antigravity-ide\brain\843367e7-17db-4618-b9a3-3b144297a2f1\.user_uploaded'

# Read the architecture/overview PDF fully
for fname in ['media_1788196575061.pdf', 'media_1787927809226.pdf']:
    path = os.path.join(PDF_DIR, fname)
    text = pml.extract_text(path)
    print(f'=== {fname} FULL ({len(text)} chars) ===')
    print(text)
    print('\n\n')

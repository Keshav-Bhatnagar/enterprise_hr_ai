"""
Batch execute all 15 notebooks using the project .venv Python.
Prints a pass/fail summary with key insights from each output.
"""
import subprocess
import sys
import json
import os

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

NOTEBOOKS = [
    "notebooks/01_data_understanding.ipynb",
    "notebooks/02_data_validation.ipynb",
    "notebooks/03_data_cleaning.ipynb",
    "notebooks/04_data_relationships.ipynb",
    "notebooks/05_feature_engineering.ipynb",
    "notebooks/06_baseline_model.ipynb",
    "notebooks/07_model_comparison.ipynb",
    "notebooks/08_model_explainability.ipynb",
    "notebooks/09_engagement_intelligence.ipynb",
    "notebooks/10_role_intelligence.ipynb",
    "notebooks/11_employee_skills.ipynb",
    "notebooks/12_skill_gap_engine.ipynb",
    "notebooks/13_organization_skill_gap.ipynb",
    "notebooks/14_recommendation_engine.ipynb",
    "notebooks/15_employee_intelligence.ipynb",
]

PYTHON = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.venv', 'Scripts', 'python.exe')

results = []
print("=" * 65)
print("EXECUTING ALL 15 NOTEBOOKS")
print("=" * 65)

for nb in NOTEBOOKS:
    name = os.path.basename(nb)
    sys.stdout.write(f"Running {name}... ")
    sys.stdout.flush()
    
    result = subprocess.run(
        [PYTHON, '-m', 'nbconvert', '--to', 'notebook', '--execute',
         '--inplace', '--ExecutePreprocessor.timeout=300', nb],
        capture_output=True, text=True, encoding='utf-8', errors='replace'
    )
    
    if result.returncode == 0:
        print("PASSED")
        results.append((name, "PASSED", ""))
    else:
        # Extract the actual error from stderr
        err_lines = [l for l in result.stderr.split('\n') if 'Error' in l or 'error' in l or 'Exception' in l]
        err = err_lines[-1][:100] if err_lines else result.stderr[-100:]
        print(f"FAILED -- {err}")
        results.append((name, "FAILED", err))

print()
print("=" * 65)
print("EXECUTION SUMMARY")
print("=" * 65)
passed = sum(1 for r in results if r[1] == "PASSED")
failed = sum(1 for r in results if r[1] == "FAILED")
print(f"Passed: {passed}/15  |  Failed: {failed}/15")
print()
for name, status, err in results:
    mark = "OK" if status == "PASSED" else "!!"
    print(f"  [{mark}] {name}")
    if err:
        print(f"       Error: {err}")

print()
print("=" * 65)

# Now extract key insights from executed notebooks
print("KEY INSIGHTS FROM NOTEBOOK OUTPUTS")
print("=" * 65)

for nb_path in NOTEBOOKS:
    try:
        with open(nb_path, 'r', encoding='utf-8') as f:
            nb = json.load(f)
        
        name = os.path.basename(nb_path)
        text_outputs = []
        for cell in nb['cells']:
            if cell['cell_type'] == 'code':
                for output in cell.get('outputs', []):
                    if output.get('output_type') == 'stream' and output.get('name') == 'stdout':
                        text_outputs.extend(output.get('text', []))
        
        if text_outputs:
            print(f"\n--- {name} ---")
            content = ''.join(text_outputs)
            lines = [l.rstrip() for l in content.split('\n') if l.strip()]
            for line in lines[:15]:  # top 15 lines of output per notebook
                print(f"  {line}")
    except Exception as e:
        pass

import json
import glob
import re
import os

files = glob.glob('data/**/*.js', recursive=True)

math_questions = []

for f in files:
    if 'quizzes-list' in f:
        continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        
    blocks = re.findall(r'\{\s*"number":\s*\d+,[\s\S]*?"subCategory":[\s\S]*?\}', content)
    for b in blocks:
        if '"type": "fill-in-number"' in b:
            num_match = re.search(r'"number":\s*(\d+)', b)
            ans_match = re.search(r'"answer":\s*([0-9\.-]+)', b)
            q_match = re.search(r'"question":\s*"([^"]+)"', b)
            exp_match = re.search(r'"explanation":\s*"([^"]+)"', b)
            if num_match and ans_match and q_match and exp_match:
                math_questions.append({
                    'file': f,
                    'number': int(num_match.group(1)),
                    'answer': float(ans_match.group(1)),
                    'question': q_match.group(1),
                    'explanation': exp_match.group(1)
                })

discrepancies = []
for mq in math_questions:
    ans = mq['answer']
    exp = mq['explanation']
    results = re.findall(r'(?:\\approx|=|\bได้|\bเท่ากับ)\s*(-?\d+(?:\.\d+)?)', exp)
    if results:
        last_res = float(results[-1])
        if abs(last_res - ans) > 0.05:
            if not any(abs(float(r) - ans) <= 0.05 for r in results):
                discrepancies.append((mq, last_res, results))

with open('scratch/math_discrepancies.txt', 'w', encoding='utf-8') as out:
    out.write(f"Total fill-in questions: {len(math_questions)}\n")
    out.write(f"Found {len(discrepancies)} potential math discrepancies:\n\n")
    for mq, last_res, results in discrepancies:
        out.write(f"File: {mq['file']} Q{mq['number']}\n")
        out.write(f"Question: {mq['question']}\n")
        out.write(f"Answer: {mq['answer']}\n")
        out.write(f"Results in exp: {results}\n")
        out.write(f"Explanation: {mq['explanation']}\n")
        out.write("-" * 80 + "\n")

print(f"Wrote {len(discrepancies)} candidates to scratch/math_discrepancies.txt")

import re
import sys

with open('public/app.js', encoding='utf-8') as f:
    lines = f.readlines()

out = []
for i, line in enumerate(lines, 1):
    if any(x in line.lower() for x in ['edit', 'modal', 'click', 'saving', 'save']):
        out.append(f"{i}: {line.strip()}")

with open('scratch/search_edit.txt', 'w', encoding='utf-8') as f_out:
    f_out.write('\n'.join(out))

print("Done. Found", len(out), "matching lines.")

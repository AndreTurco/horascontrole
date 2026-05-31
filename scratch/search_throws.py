with open('public/app.js', encoding='utf-8') as f:
    lines = f.readlines()

out = []
for i, line in enumerate(lines, 1):
    if 'throw ' in line:
        out.append(f"{i}: {line.strip()}")

with open('scratch/search_throws.txt', 'w', encoding='utf-8') as f_out:
    f_out.write('\n'.join(out))

print("Done. Found", len(out), "throws.")

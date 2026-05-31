with open('server.js', encoding='utf-8') as f:
    lines = f.readlines()

out = []
for i, line in enumerate(lines, 1):
    if any(x in line.lower() for x in ['safeexcelop', 'excelop', 'lock', 'busy', 'permission', 'catch', 'throw']):
        out.append(f"{i}: {line.strip()}")

with open('scratch/search_safeexcel.txt', 'w', encoding='utf-8') as f_out:
    f_out.write('\n'.join(out))

print("Done.")

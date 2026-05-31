with open('public/index.html', encoding='utf-8') as f:
    lines = f.readlines()

out = []
for i, line in enumerate(lines, 1):
    if any(x in line.lower() for x in ['invest', 'aporte', 'edit-modal', 'modal', 'saida', 'chegada', 'valor']):
        out.append(f"{i}: {line.strip()}")

with open('scratch/search_html.txt', 'w', encoding='utf-8') as f_out:
    f_out.write('\n'.join(out))

print("Done.")

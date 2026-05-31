with open('server.js', encoding='utf-8') as f:
    lines = f.readlines()

out = []
for i, line in enumerate(lines, 1):
    if any(x in line.lower() for x in ['/api/save', 'app.post', 'app.put', 'save']):
        out.append(f"{i}: {line.strip()}")

with open('scratch/search_server.txt', 'w', encoding='utf-8') as f_out:
    f_out.write('\n'.join(out))

print("Done. Found", len(out), "matching lines in server.js")

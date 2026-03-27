import json

with open('d:/Dev/CodeProjects/i/documentos/MERCADOPAGO.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

table_lines = [l for l in lines if '|' in l and '---' not in l and 'descripcion' not in l]

items = []
_id = 1
for l in table_lines:
    parts = [p.strip() for p in l.split('|') if p.strip()]
    if len(parts) >= 6:
        desc = parts[1]
        monto = float(parts[2])
        cuota = int(parts[3])
        total = int(parts[4])
        
        info = f"{cuota} de {total}"
        cuota_abril = monto
        cuota_mayo = monto if cuota < total else 0
        
        items.append({
            'id': _id,
            'destino': desc,
            'pendiente': monto * (total - cuota + 1),
            'cuotaAbril': cuota_abril,
            'cuotaMayo': cuota_mayo,
            'cuotaInfo': info
        })
        _id += 1

print(json.dumps(items, indent=2))

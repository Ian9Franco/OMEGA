import json
import re

with open('d:/Dev/CodeProjects/i/documentos/MERCADOPAGO.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

table_lines = [l for l in lines if '|' in l and '---' not in l and 'descripcion' not in l]

items = []
_id = 1
for l in table_lines:
    parts = [p.strip() for p in l.split('|') if p.strip()]
    if len(parts) >= 6:
        desc = parts[1].replace('"', '')
        monto = float(parts[2])
        cuota = int(parts[3])
        total = int(parts[4])
        
        info = f"{cuota} de {total}"
        cuota_abril = monto
        cuota_mayo = monto if cuota < total else 0
        
        item_str = f"  {{ id: '{_id}', destino: '{desc}', pendiente: {monto * (total - cuota + 1)}, cuotaAbril: {cuota_abril}, cuotaMayo: {cuota_mayo}, cuotaInfo: '{info}' }}"
        items.append(item_str)
        _id += 1

mp_credits_str = "export const MP_CREDITS: MPCreditType[] = [\n" + ",\n".join(items) + "\n];"

with open('d:/Dev/CodeProjects/i/src/lib/constants.ts', 'r', encoding='utf-8') as f:
    content = f.read()

new_content = re.sub(r'export const MP_CREDITS\s*:\s*MPCreditType\[\]\s*=\s*\[.*?\];', mp_credits_str, content, flags=re.DOTALL)

with open('d:/Dev/CodeProjects/i/src/lib/constants.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated constants.ts")

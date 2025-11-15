# kb_loader.py
import os
import json
from pathlib import Path

def load_kb():
    kb = {}
    kb_dir = Path("kb")
    if not kb_dir.exists():
        raise FileNotFoundError(f"Папка {kb_dir.absolute()} не найдена")
    
    for json_path in kb_dir.rglob("*.json"):
        try:
            data = json.loads(json_path.read_text(encoding="utf-8"))
            kb[data["id"]] = data
        except Exception as e:
            print(f"Ошибка загрузки {json_path}: {e}")
    return kb
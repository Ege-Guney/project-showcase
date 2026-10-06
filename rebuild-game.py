from pathlib import Path
import gzip,hashlib,json
root=Path(__file__).resolve().parent
m=json.loads((root/'spectate-export/manifest.json').read_text())
raw=gzip.decompress(b''.join(p.read_bytes() for p in sorted((root/'spectate-export').glob('engine.gz.part-*'))))
assert len(raw)==m['bytes'] and hashlib.sha256(raw).hexdigest()==m['sha256'], 'Engine integrity check failed'
out=root/'dist/spectate/game/index.wasm.gz';out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(gzip.compress(raw,mtime=0))
print('Restored verified compressed WebAssembly engine:', len(raw), 'bytes')

from concurrent.futures import ThreadPoolExecutor,as_completed
from urllib.request import Request,urlopen
from urllib.parse import urlsplit,unquote
from pathlib import Path
from pypdf import PdfReader
import hashlib,json,re,time,logging
logging.getLogger('pypdf').setLevel(logging.ERROR)
import argparse
REPO=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--cache',type=Path,default=REPO/'.cache/taitien');args=parser.parse_args()
ROOT=args.cache
raw=json.loads((ROOT/'raw-products.json').read_text())
jobs={}
for p in raw['products']:
    for d in p['documents']:
        if '/dml_download/' not in d['url']: jobs[d['url']]='pdf' if urlsplit(d['url']).path.lower().endswith('.pdf') else 'chart'
    if p['imageUrl']: jobs[p['imageUrl']]='image'
errors=[]; assets={}
def download(url,kind):
    parts=urlsplit(url)
    if parts.hostname!='www.taitien.com':raise ValueError('Unexpected source host')
    base=unquote(Path(parts.path).name)
    suffix='.pdf' if kind=='pdf' else Path(base).suffix.lower()
    stem=re.sub('[^a-zA-Z0-9_-]+','-',Path(base).stem).strip('-') or 'taitien'
    rel=Path('products' if kind=='image' else 'datasheets')/(stem+'-'+hashlib.sha256(url.encode()).hexdigest()[:10]+suffix)
    target=REPO/'public'/rel;target.parent.mkdir(parents=True,exist_ok=True)
    if target.exists():data=target.read_bytes()
    else:
        for attempt in range(3):
            try:
                with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0 (compatible; SimacityProductCatalog/1.0)'}),timeout=60) as response:data=response.read()
                if kind=='pdf' and not data.startswith(b'%PDF-'):raise ValueError('Source did not return a PDF')
                target.write_bytes(data)
                time.sleep(.2)
                break
            except Exception:
                if attempt==2:raise
                time.sleep(attempt+1)
    record={'path':str(rel),'sourceUrl':url,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
    if kind=='pdf':
        reader=PdfReader(target)
        record['pages']=len(reader.pages)
        text='\n'.join(page.extract_text() or '' for page in reader.pages)
        (ROOT/(target.name+'.txt')).write_text(text)
    return record
with ThreadPoolExecutor(max_workers=3) as pool:
    futures={pool.submit(download,u,k):u for u,k in jobs.items()}
    for i,f in enumerate(as_completed(futures),1):
        try:assets[futures[f]]=f.result()
        except Exception as e:errors.append({'url':futures[f],'error':str(e)})
        if i%20==0:print(f'Downloaded and validated {i}/{len(jobs)}',flush=True)
(ROOT/'assets.json').write_text(json.dumps({'assets':assets,'errors':errors},ensure_ascii=False,indent=2))
print(json.dumps({'files':len(assets),'bytes':sum(a['bytes'] for a in assets.values()),'errors':errors},ensure_ascii=False),flush=True)

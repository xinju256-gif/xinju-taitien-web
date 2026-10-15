import hashlib,json,re,time
from concurrent.futures import ThreadPoolExecutor,as_completed
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.parse import urljoin,urlsplit,urlunsplit,unquote
from xml.etree import ElementTree as ET
from bs4 import BeautifulSoup

import argparse
from datetime import datetime
from zoneinfo import ZoneInfo
parser=argparse.ArgumentParser();parser.add_argument('--cache',type=Path,default=Path(__file__).resolve().parents[1]/'.cache/taitien');args=parser.parse_args()
ROOT=args.cache;ROOT.mkdir(parents=True,exist_ok=True)
CACHE=ROOT/'pages'; CACHE.mkdir(exist_ok=True)
BASE='https://www.taitien.com'
NS={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}

def normalize(url):
    parts=urlsplit(url)
    if parts.hostname in ['taitien.com','www.taitien.com']:
        return urlunsplit(('https','www.taitien.com',parts.path,parts.query,''))
    return url

def fetch(url):
    url=normalize(url)
    target=CACHE/(hashlib.sha256(url.encode()).hexdigest()+'.html')
    if target.exists(): return target.read_bytes()
    for attempt in range(3):
        try:
            with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0 (compatible; SimacityProductCatalog/1.0)'}),timeout=40) as response:
                body=response.read()
            target.write_bytes(body)
            time.sleep(.15)
            return body
        except Exception:
            if attempt==2: raise
            time.sleep(attempt+1)

def clean(tag):
    if tag is None: return ''
    copied=BeautifulSoup(str(tag),'html.parser')
    for sup in copied.select('sup'):
        sup.replace_with(sup.get_text().translate(str.maketrans('0123456789-+','⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺')))
    for br in copied.select('br'): br.replace_with(' / ')
    return re.sub(r'\s+',' ',copied.get_text(' ',strip=True)).strip()

def sections(body, label):
    heading=next((h for h in body.select('h2,h3') if clean(h).lower()==label.lower()),None)
    if not heading: return None
    return heading.parent

sitemap_urls=[u.text for u in ET.ElementTree(ET.fromstring(fetch(BASE+'/ti-products-sitemap.xml'))).findall('s:url/s:loc',NS) if '/ti-products/' in u.text]
category_urls=[u.text for u in ET.fromstring(fetch(BASE+'/product-categories-sitemap.xml')).findall('s:url/s:loc',NS)]
products=set(sitemap_urls)
errors=[]
with ThreadPoolExecutor(max_workers=3) as pool:
    futures={pool.submit(fetch,u):u for u in category_urls}
    for i,f in enumerate(as_completed(futures),1):
        u=futures[f]
        try:
            soup=BeautifulSoup(f.result(),'html.parser')
            for a in soup.select('a[href]'):
                link=normalize(urljoin(u,a['href'])).split('?')[0].rstrip('/')
                if link.startswith(BASE+'/ti-products/'): products.add(link)
        except Exception as e: errors.append({'url':u,'error':str(e)})
        if i%15==0: print(f'Categories {i}/{len(category_urls)}',flush=True)
print(f'{len(sitemap_urls)} sitemap products, {len(products)} after category reconciliation',flush=True)

records=[]
def parse(url):
    soup=BeautifulSoup(fetch(url),'html.parser')
    body=soup.select_one('.article-body-wrap .body-text')
    if body is None: raise ValueError('Product body missing')
    title=clean(soup.select_one('h1'))
    highlight=sections(body,'Product Highlight')
    overview=sections(body,'Overview')
    overview_lines=[clean(li) for li in overview.select('ul > li')] if overview else []
    tables=[]
    for table in body.select('table'):
        rows=[]
        for row in table.select('tr'):
            cells=[]
            for td in row.find_all(['th','td'],recursive=False):
                cells.append({'text':clean(td),'header':td.name=='th','colSpan':int(td.get('colspan',1)),'rowSpan':int(td.get('rowspan',1))})
            if cells: rows.append(cells)
        if rows: tables.append(rows)
    image=body.select_one('img.wp-post-image')
    image_url=normalize(urljoin(url,image.get('data-src-img') or image.get('data-src') or image.get('src'))) if image else None
    # Prefer full-resolution original listed in srcset, keeping the exact published image bytes.
    if image and (image.get('data-srcset-img') or image.get('srcset')):
        image_url=normalize((image.get('data-srcset-img') or image['srcset']).split(',')[-1].strip().split(' ')[0])
    documents=[]
    download=sections(body,'Files Download')
    if download:
        for a in download.select('a[href]'):
            href=normalize(urljoin(url,a['href']))
            documents.append({'label':clean(a),'url':href})
    if not documents:
        for a in body.select('a[href]'):
            if '.pdf' in a['href'].lower(): documents.append({'label':clean(a) or 'Datasheet','url':normalize(urljoin(url,a['href']))})
    documents=list({d['url']:d for d in documents}.values())
    def texts(section):
        block=sections(body,section)
        return [clean(li) for li in block.select('li')] if block else []
    hlines=[clean(li) for li in highlight.select('li')] if highlight else []
    if highlight and not hlines:
        hlines=[clean(p) for p in highlight.select('p') if clean(p)]
        if not hlines:
            clone=BeautifulSoup(str(highlight),'html.parser')
            for h in clone.select('h2,h3'): h.decompose()
            text=clean(clone)
            if text: hlines=[text]
    modified=soup.select_one('meta[itemprop="dateModified"]')
    article=soup.select_one('article')
    return {'id':url.rsplit('/',1)[-1], 'sourceUrl':url,'title':title,'subtitle':clean(body.select_one('.sub-title')),'highlights':hlines,'overview':overview_lines,'tables':tables,'applications':texts('Solution'),'features':texts('Feature'),'categories':texts('Product Categories'),'taxonomy':article.get('class',[]) if article else [],'imageUrl':image_url,'documents':documents,'sourceModified':modified.get('content','') if modified else ''}
with ThreadPoolExecutor(max_workers=3) as pool:
    futures={pool.submit(parse,u):u for u in sorted(products)}
    for i,f in enumerate(as_completed(futures),1):
        try: records.append(f.result())
        except Exception as e: errors.append({'url':futures[f],'error':str(e)})
        if i%15==0: print(f'Products {i}/{len(products)}',flush=True)
records.sort(key=lambda r:r['id'])
result={'fetchedAt':datetime.now(ZoneInfo('Asia/Shanghai')).date().isoformat(),'sitemapCount':len(sitemap_urls),'categoryPageCount':len(category_urls),'discoveredCount':len(products),'products':records,'errors':errors}
(ROOT/'raw-products.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
print(json.dumps({'products':len(records),'errors':errors,'withoutDocuments':[p['id'] for p in records if not p['documents']],'uniqueDocuments':len(set(d['url'] for p in records for d in p['documents']))},ensure_ascii=False),flush=True)

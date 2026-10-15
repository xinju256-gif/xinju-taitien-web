"""Generate the reviewed catalog and provenance manifest from downloaded source data."""
import argparse,hashlib,json,re
from pathlib import Path
from collections import Counter
REPO=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--cache',type=Path,default=REPO/'.cache/taitien');args=parser.parse_args()
raw=json.loads((args.cache/'raw-products.json').read_text())
assets=json.loads((args.cache/'assets.json').read_text())
assert not raw['errors'] and not assets['errors'], 'Resolve source/download errors before publishing'
FAMILIES={
'All Crystal':'crystal','All XO':'oscillator','All VCXO':'vcxo','All VCTCXO/TCXO':'tcxo','All OCXO':'ocxo','Thermistor Crystal (TSX)':'tsx','All Timing Module':'timing','QCM':'qcm','Equipment':'equipment',
}
ZH={
'Crystal Oscillator Programmer':'晶体振荡器编程器','Double Oven OCXO Series':'双恒温槽 OCXO',
'EMI Reduction Spread Spectrum Series':'低 EMI 扩频晶体振荡器','Quartz Watch Analyzer':'石英表分析仪',
'Extended Operating Temp Series':'宽温晶体振荡器','Fast Delivery OCXO Series':'快速交付 OCXO 系列',
'FASTVCXO, Fast Delivery VCXO Series':'FASTVCXO 快速交付压控晶体振荡器',
'FASTXO, Fast Delivery Crystal Oscillator':'FASTXO 快速交付晶体振荡器','FASTXO':'FASTXO 快速交付晶体振荡器',
'High Frequency and Low Noise Differential VCTCXO/TCXO':'高频低噪声差分温补晶体振荡器',
'High Precision and Wide Temperature VCTCXO/TCXO':'高精度宽温温补晶体振荡器','High Precision Crystal':'高精度石英晶体',
'High Precision Series':'高精度晶体振荡器','Stratum 3 VCTCXO':'Stratum 3 压控温补晶体振荡器',
'High Frequency, High Stability, Very Low Noise VCTCXO':'高频高稳定度低噪声压控温补晶体振荡器',
'High Precision VCTCXO/TCXO':'高精度温补晶体振荡器','Ultra Low G Sensitivity VCTCXO/TCXO':'超低加速度敏感度温补晶体振荡器',
'kHz Range Crystal Oscillator Series':'kHz 晶体振荡器','KHz TCXO':'kHz 温补晶体振荡器',
'Low Phase Noise / Low G-Sensitivity OCXO':'低相噪低加速度敏感度 OCXO','Low Voltage TCXO':'低电压温补晶体振荡器',
'MHz Crystal Oscillator':'MHz 晶体振荡器','MHz Range Crystal Oscillators':'MHz 晶体振荡器','MHz Range Crystal':'MHz 石英晶体','MHz Crystal':'MHz 石英晶体',
'Ultra Low Phase Noise Crystal Oscillator':'超低相位噪声晶体振荡器','QCM_5MHz Series':'5 MHz 石英测厚晶体','QCM_6MHz Series':'6 MHz 石英测厚晶体',
'Standard OCXO Series':'标准恒温晶体振荡器','Standard TCXO Series':'标准温补晶体振荡器','High Frequency TCXO':'高频温补晶体振荡器',
'Standard VCTCXO/TCXO':'标准温补晶体振荡器','Miniature VCTCXO/TCXO':'微型温补晶体振荡器','Thermistor Crystal':'热敏晶体 TSX',
'Tuning Fork Crystal Unit':'音叉石英晶体','Ultra-compact, High Precision, Low G-Sensitivity TCXO':'微型高精度低加速度敏感度温补晶体振荡器',
'Ultra Low G-Sensitivity OCXO Series':'超低加速度敏感度恒温晶体振荡器','Ultra Low Noise Series':'超低噪声晶体振荡器',
'Ultra Low Phase Noise OCXO Series':'超低相位噪声恒温晶体振荡器','Ultra Low Phase Noise and Low G-Sensitivity OCXO':'超低相噪低加速度敏感度恒温晶体振荡器',
'Ultra Low Phase Noise VCXO Series':'超低相位噪声压控晶体振荡器','Ultra Low Power Atomic Oscillator (CSAC)':'超低功耗原子振荡器 CSAC',
'Ultra Low Power Disciplined Oscillator':'超低功耗驯服振荡器','Ultra Low Power (VC)OCXO':'超低功耗压控恒温晶体振荡器',
}
SPECIAL={
'GPS Disciplined Oscillator (GPSDO) GT-11 series':('GT-11','GPS 驯服振荡器 GPSDO'),
'Ultra-High Precision Disciplined Oscillator DT-5151 Series':('DT-5151','超高精度驯服振荡器'),
'Ultra-High Precision Disciplined Oscillator DT-6565 series':('DT-6565','超高精度驯服振荡器'),
'O3 Type SMD Crystal Oscillator':('O3','SMD 晶体振荡器'),
}
overrides=json.loads((REPO/'scripts/taitien-catalog-overrides.json').read_text())
products=[];sources=[];gated=[]
for p in raw['products']:
 category=next((value for key,value in FAMILIES.items() if key in p['categories']),None)
 assert category, p['title']
 title=p['title']
 if title in SPECIAL:model,zh=SPECIAL[title]
 else:
  prefix,suffix=title.split(' – ',1)
  match=re.search(r'\b[A-Z][A-Z0-9]*(?:[-_][A-Z0-9.]+)*(?=\s|$)',suffix)
  assert match,title
  model=match.group(0);zh=ZH[prefix]
  if 'Ultra Low Power' in suffix:zh+='（超低功耗）'
  if 'Low Current Consumption' in suffix:zh+='（低电流）'
  if 'LVPECL' in suffix:zh+='（LVPECL / LVDS）' if 'LVDS' in suffix else '（LVPECL）'
  elif 'CMOS' in suffix:zh+='（CMOS）'
  if '312.5MHz' in suffix:zh+='（312.5 MHz）'
 docs=[]
 for d in p['documents']:
  if '/dml_download/' in d['url']:
   gated.append({'productId':p['id'],'label':d['label'],'sourceUrl':d['url'],'reason':'Manufacturer contact-registration form; not downloaded or bypassed.'})
   continue
  a=assets['assets'][d['url']]
  doc={'label':d['label'],'path':a['path'],'bytes':a['bytes'],'format':'PDF' if a['path'].endswith('.pdf') else 'PNG'}
  if 'pages' in a:doc['pages']=a['pages']
  docs.append(doc)
 assert any(d['label']=='Datasheet' and d['format']=='PDF' for d in docs),p['id']
 overview=[]
 for line in p['overview']:
  parts=re.split('[:：]',line,maxsplit=1)
  assert len(parts)==2, line
  overview.append({'label':parts[0].strip(),'value':parts[1].strip()})
 tables=[table for table in p['tables'] if any(cell['text'] for row in table for cell in row)]
 products.append({'id':p['id'],'model':model,'nameZh':model+' '+zh,'nameEn':title,'category':category,'subtitle':p['subtitle'],'overview':overview,'highlights':p['highlights'],'tables':tables,'applications':p['applications'],'features':p['features']+p['categories'],'image':assets['assets'][p['imageUrl']]['path'],'documents':docs,'requestDocuments':[d['label'] for d in gated if d['productId']==p['id']]})
 products[-1].update(overrides.get(p['id'], {'aliases':[], 'notes':[]}))
 sources.append({'id':p['id'],'model':model,'sourceTitle':title,'sourceUrl':p['sourceUrl'],'sourceModified':p['sourceModified'],'documents':p['documents'],'imageSource':p['imageUrl']})
for a in assets['assets'].values():
 data=(REPO/'public'/a['path']).read_bytes()
 assert hashlib.sha256(data).hexdigest()==a['sha256'],a['path']
snapshot={'fetchedAt':raw['fetchedAt'],'products':products}
(REPO/'src/data/products.json').write_text(json.dumps(snapshot,ensure_ascii=False,indent=2)+'\n')
report={'fetchedAt':raw['fetchedAt'],'scope':'All public English-site product entries discovered from the product sitemap and 57 category pages. Series/variants are distinct entries; configurable order-code permutations are not invented.','sitemapProducts':raw['sitemapCount'],'categoryPagesChecked':raw['categoryPageCount'],'productCount':len(products),'byCategory':dict(Counter(p['category'] for p in products)),'datasheetReferences':sum(d['label']=='Datasheet' for p in products for d in p['documents']),'uniqueDatasheets':len({d['path'] for p in products for d in p['documents'] if d['label']=='Datasheet'}),'pdfFiles':sum(a['path'].endswith('.pdf') for a in assets['assets'].values()),'assets':list(assets['assets'].values()),'products':sources,'registrationRequired':gated,'sourceDiscrepancies':overrides}
(REPO/'docs/taitien-catalog-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k not in ['assets','products','scope']},ensure_ascii=False,indent=2))

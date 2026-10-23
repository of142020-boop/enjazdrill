import json,re,sys
from pathlib import Path
from urllib.parse import unquote,urlsplit
from html.parser import HTMLParser
import xml.etree.ElementTree as ET
sys.stdout.reconfigure(encoding='utf-8')
errors=[]; titles=set();descs=set(); urls=set()
class Page(HTMLParser):
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag == 'img':
   if not a.get('alt'): errors.append('Image missing descriptive alt: '+a.get('src',''))
   if not all(a.get(key,'').isdigit() and int(a[key]) > 0 for key in ('width','height')): errors.append('Image missing intrinsic dimensions: '+a.get('src',''))
   if not a.get('srcset'): errors.append('Image missing responsive sources: '+a.get('src',''))
  for key in ['href','src']:
   v=a.get(key,'')
   if v.startswith('/') and not v.startswith('//'):
    p=Path('dist')/unquote(urlsplit(v).path).lstrip('/')
    if p.is_dir() or not p.suffix:p=p/'index.html'
    if not p.exists():errors.append('Missing target: '+str(p))
for f in Path('dist').rglob('*.html'):
 s=f.read_text(encoding='utf-8');Page().feed(s)
 for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>',s,re.S):json.loads(block)
 if f.name=='404.html':
  assert 'noindex' in s
  continue
 assert len(re.findall(r'<h1\b',s))==1,str(f)
 title=re.search(r'<title>(.*?)</title>',s).group(1)
 desc=re.search(r'name="description" content="([^"]+)"',s).group(1)
 assert title not in titles and desc not in descs,str(f)
 titles.add(title);descs.add(desc)
 canonical=re.search(r'rel="canonical" href="([^"]+)"',s).group(1)
 assert canonical.startswith('https://enjazdrill.com/') and canonical.endswith('/'),canonical
 urls.add(unquote(canonical))
 assert 'noindex' not in s,str(f)
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
sitemap=ET.parse('dist/sitemap-0.xml')
listed={unquote(e.text) for e in sitemap.findall('.//s:loc',ns)}
assert listed==urls, f'Sitemap mismatch {listed ^ urls}'
assert not errors,errors
print(f'PASS: {len(urls)} indexable pages; unique titles/descriptions; H1; canonical; JSON-LD; local targets; sitemap coverage; 404 noindex.')

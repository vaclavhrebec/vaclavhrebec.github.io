import re,html,json,sys,unicodedata,collections,os
D='/tmp/tmltexts'; OUT='/home/claude/vaclavhrebec.github.io/concordantia/data'
os.makedirs(OUT,exist_ok=True)
meta=json.load(open('/tmp/tml/tml.json'))
def norm(s):
  s=unicodedata.normalize('NFKD',s.lower()); s=''.join(c for c in s if not unicodedata.combining(c))
  return s.replace('v','u').replace('j','i').replace('æ','ae').replace('œ','oe')
K=json.load(open('/home/claude/build/node_regex.json'))
R={k:re.compile(v.replace('v','u').replace('j','i')) for k,v in K.items()}
BROAD={"counterpoint":(8,600),"consonance":(8,600),"modes":(6,800),"chant":(5,1200),"instruments":(4,2000),"gamut":(6,800),"hand":(4,2000),
 "ars-nova":(6,800),"divisions":(3,3000),"effects":(3,3000),"ficta":(3,3000),"organum":(4,2000),"discant-treatises":(5,1200),"hexachords":(4,1500),
 "mutation":(3,2500),"accent":(3,2500),"psalmody":(5,1200),"finals":(4,1500),"tonary":(4,1500),"proportions":(4,1500),"tactus":(3,2500),
 "national-styles":(8,600),"voice-functions":(5,1200),"imitation":(4,1500),"bowed":(2,5000),"number":(5,1200),"medicine":(3,3000),"history-in-treatises":(2,10**9)}
STRICT=BROAD
pagere=re.compile(r"<span class='pageNo'>\[(.*?)\]</span>")
def loclabel(p):
  p=html.unescape(p).strip('<>')
  if p.startswith('f.') : return 'f. '+re.sub(r'\[\[\d+\]\]','',p[2:])
  if re.fullmatch(r'\d+',p): return 'p. '+p
  if re.fullmatch(r'\d+[rv]',p): return 'f. '+p
  return p
def clean(x): return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>','',x))).strip()
HD=re.compile(r'^(caput|capitulum|cap\.|de |incipit|explicit|liber|tractatus|quomodo|quid |quod |qualiter|prologus|prooemium|praefatio|rubrica|sequitur|pars |particula|distinctio)',re.I)
def ishead(q):
  if not(4<=len(q)<=140) or q.startswith('['): return False
  letters=[c for c in q if c.isalpha()]
  upper=letters and sum(c.isupper() for c in letters)/len(letters)>.6
  return bool(HD.search(q) or re.search(r'\b(caput|capitulum)\b',q,re.I) or upper)
idx={}; byc=collections.defaultdict(dict); stat=collections.Counter()
for o in meta:
  key=o['c']+'/'+o['id']
  f=open(f"{D}/{o['c']}_{o['id']}.html",encoding='utf-8',errors='replace').read()
  i=f.find('id="backToTop"'); body=f[i:] if i>0 else f
  page=''; head=''; sents=[]  # (page, head, sentence)
  for p in re.findall(r'<p>(.*?)</p>',body,re.S):
    parts=pagere.split(p)  # text, page, text, page...
    plain=clean(pagere.sub('',p)); q=re.sub(r'\s*\[[^\]]*\]\s*','',plain).strip().strip('<>').strip()
    if ishead(q):
      if parts[1:]: page=loclabel(parts[-2])
      head=q; continue
    for j,seg in enumerate(parts):
      if j%2==1: page=loclabel(seg); continue
      t=clean(seg)
      for s in re.split(r'(?<=[.?!])\s+(?=[A-Z\[])',t):
        s=s.strip()
        if len(s.split())>=5: sents.append((page,head,s))
  full=norm(' '.join(s for _,_,s in sents)); words=max(1,len(full.split()))
  tops={}
  for k,rx in R.items():
    n=len(rx.findall(full))
    mn,per=STRICT.get(k,(3,2500))
    if k in("super-librum","res-facta","sortisatio","alla-mente","faburden","verbula","contrapunctus-diminutus","coloration","five-parts","david-saul","musica-poetica"): mn,per=1,10**9
    if n>=max(mn,words/per):
      cand=[]
      for ix,(pg,hd,s) in enumerate(sents):
        ns=norm(s); hits=rx.findall(ns)
        if hits:
          w=s.split(); L=len(w)
          score=len(set(map(str,hits)))*3+len(hits)-(2 if L<8 else 0)+(2 if rx.search(norm(hd)) else 0)
          cand.append((score,ix,pg,hd,s))
      cand.sort(key=lambda c:(-c[0],c[1]))
      picked=sorted(cand[:(2 if k in BROAD else 3)],key=lambda c:c[1])
      qs=[]
      for _,ix,pg,hd,s in picked:
        w=s.split()
        if len(w)>55:
          ns=[norm(x) for x in w]; m=next((ii for ii in range(len(w)) if rx.search(' '.join(ns[ii:ii+3]))),0)
          a=max(0,m-20); w2=w[a:a+55]; s=('… ' if a>0 else '')+' '.join(w2)+(' …' if a+55<len(w) else '')
        qs.append([pg,hd[:120],s])
      tops[k]=(round(n/words*10000,1),qs)
  spec=[kv for kv in tops.items() if kv[0] not in BROAD]; broad=sorted([kv for kv in tops.items() if kv[0] in BROAD],key=lambda kv:-kv[1][0])
  best=sorted(spec,key=lambda kv:-kv[1][0])[:10]; best+=broad[:max(3,12-len(best))]
  idx[key]={k:v[0] for k,v in best}
  byc[o['c']][o['id']]={k:v[1] for k,v in best}
  for k,_ in best: stat[k]+=1
json.dump(idx,open(f'{OUT}/index.json','w'),ensure_ascii=False,separators=(',',':'))
for c,d in byc.items(): json.dump(d,open(f'{OUT}/{c}.json','w'),ensure_ascii=False,separators=(',',':'))
print(stat)
os.system(f'du -sh {OUT}; ls -la {OUT}')
d=json.load(open(f'{OUT}/16th.json'))
print(json.dumps(d['ORNMUS4'],ensure_ascii=False,indent=0)[:3000])
print(json.dumps(json.load(open(f'{OUT}/15th.json'))['TINCON2'].get('improv'),ensure_ascii=False))

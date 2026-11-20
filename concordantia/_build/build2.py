# Rebuild tree.js from tree.py, works.py and vernacular.py (no TML download needed: the TML keys come from data/index.json).
import json,re,os,sys
H=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,H)
from works import W
from tree import TREE
import vernacular as V
keys=list(json.load(open(os.path.join(H,'..','data','index.json'))).keys())
W=dict(W); W.update(V.WORKS)
works={}
for k,v in W.items():
    a,t,y,d,p,ctx,spec=v[:7]; q=v[7] if len(v)>7 else f"{a} {t}"
    files=[]
    if spec.startswith('re:'):
        rx=re.compile(spec[3:]); files=[x for x in keys if rx.search(x)]
        if not files: print('NO TML for',k,spec)
    works[k]={"a":a,"t":t,"y":y,"d":d,"p":p,"ctx":ctx,"tml":files,"q":q}
def find(ns,i):
    for n in ns:
        if n['id']==i: return n
        r=find(n['c'],i)
        if r: return r
def lists(ns):
    for n in ns: n['s']=[list(x) for x in n['s']]; lists(n['c'])
lists(TREE)
for par,i,l,a,d in V.NEW_NODES:
    P=find(TREE,par); assert P,par; assert not find(TREE,i),i
    P['c'].append({"id":i,"l":l,"a":a,"d":d,"s":[],"q":None,"c":[]})
for nid,wid,note,qs in V.ADD:
    n=find(TREE,nid); assert n,nid; assert wid in works,wid
    qs=[list(x) for x in qs]
    for s in n['s']:
        if s[0]==wid:
            if qs: (s.append(qs) if len(s)==2 else s[2].extend(qs))
            break
    else: n['s'].append([wid,note]+([qs] if qs else []))
ids=set()
def walk(n):
    assert n['id'] not in ids,n['id']; ids.add(n['id'])
    for s in n['s']: assert s[0] in works,(n['id'],s[0])
    out={"id":n['id'],"l":n['l'],"a":n['a'],"d":n['d'],"s":[list(s) for s in n['s']],"c":[walk(c) for c in n['c']]}
    if n['q']: out["hasq"]=1
    return out
tree=[walk(n) for n in TREE]
with open(os.path.join(H,'..','tree.js'),'w') as f:
    f.write("/* Concordantia topic tree and works. Generated from _build/tree.py, works.py and vernacular.py by build2.py. */\n")
    f.write("const TREE="+json.dumps(tree,ensure_ascii=False,separators=(',',':'))+";\n")
    f.write("const WORKS="+json.dumps(works,ensure_ascii=False,separators=(',',':'))+";\n")
print(len(ids),'nodes',len(works),'works', sum(len(s[2]) for n in ids for s in find(TREE,n)['s'] if len(s)>2),'quotes')

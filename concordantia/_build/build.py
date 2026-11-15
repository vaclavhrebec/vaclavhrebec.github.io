import sys,json,re,os
sys.path.insert(0,'/home/claude/build')
from works import W
from tree import TREE
tml=json.load(open('/tmp/tml/tml.json'))
keys=[o['c']+'/'+o['id'] for o in tml]
works={}
for k,v in W.items():
    a,t,y,d,p,ctx,spec=v[:7]; q=v[7] if len(v)>7 else f"{a} {t}"
    files=[]
    if spec.startswith('re:'):
        rx=re.compile(spec[3:]); files=[x for x in keys if rx.search(x)]
        if not files: print('NO TML for',k,spec)
    works[k]={"a":a,"t":t,"y":y,"d":d,"p":p,"ctx":ctx,"tml":files,"q":q}
ids=set(); regex={}
def walk(n,parent=None,depth=0):
    assert n['id'] not in ids,n['id']; ids.add(n['id'])
    if n['q']: re.compile(n['q']); regex[n['id']]=n['q']
    out={"id":n['id'],"l":n['l'],"a":n['a'],"d":n['d'],"s":n['s'],"c":[walk(c,n['id'],depth+1) for c in n['c']]}
    if n['q']: out["hasq"]=1
    return out
tree=[walk(n) for n in TREE]
os.makedirs('/home/claude/vaclavhrebec.github.io/concordantia',exist_ok=True)
with open('/home/claude/vaclavhrebec.github.io/concordantia/tree.js','w') as f:
    f.write("/* Concordantia topic tree and works. Generated from build/tree.py and build/works.py. */\n")
    f.write("const TREE="+json.dumps(tree,ensure_ascii=False,separators=(',',':'))+";\n")
    f.write("const WORKS="+json.dumps(works,ensure_ascii=False,separators=(',',':'))+";\n")
json.dump(regex,open('/home/claude/build/node_regex.json','w'))
print(len(ids),'nodes',len(regex),'with Latin vocabulary',len(works),'works')

#!/bin/bash
# v2pub.sh <biz-dir> <letter> <slug> "<Business>" "<Title>"  -> builds bannered publish copy and prints files JSON
S=${WORK:-$HOME/.pipeline-work}
src=/home/user/Claude-code/richmond-sprint-v2/$1/concept-$2; out=$S/publish/v2/$3
python3 "$(dirname "$0")"/banner_build.py $src $S/tmpban/$3 "$4" >/dev/null && python3 "$(dirname "$0")"/publish_build.py $S/tmpban/$3 $out $S/none.json "$5" >/dev/null || exit 1
cd $out; grep -c 'Speculative design concept' *.html | tr '\n' ' '; echo
python3 -c "
import os,json;o='$out';f={}
for r,d,fs in os.walk(o):
  for x in fs:
    p=os.path.relpath(os.path.join(r,x),o)
    if p!='index.html' and not p.endswith(('.mjs','.md')): f[p]=os.path.join(o,p)
print(json.dumps(f))"

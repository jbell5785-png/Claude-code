#!/bin/bash
# qa.sh <concept-dir> <port> <label>  — serve, run harness + lint, stop server
dir=$1; port=$2; label=$3; out=${WORK:-$HOME/.pipeline-work}/qa/$label
mkdir -p $out
python3 -m http.server $port --directory $dir >/dev/null 2>&1 & srv=$!
sleep 1
cd "$(dirname "$0")"
timeout 500 node review.js x $port $out > $out/summary.json 2>&1
node cls.js $port index.html menu.html > $out/cls.txt 2>&1
kill $srv
echo "== lint"
grep -n -i -E "elevate|culinary journey|nestled|tantalis|rich tapestry|premier destination|hidden gem|best sushi|award-winning|lorem|Playfair|family=Inter|monospace|Young Serif|Instrument Sans|Italiana|Hanken|Bricolage|Atkinson" $dir/*.html $dir/css/*.css 2>/dev/null | head -20
echo "== tbc markers: $(grep -o 'class="tbc"' $dir/*.html | wc -l), TO CONFIRM comments: $(grep -o 'TO CONFIRM' $dir/*.html | wc -l)"
echo "== external hrefs"; grep -ho 'href="http[^"]*"' $dir/*.html | sort | uniq -c
python3 - $out/summary.json <<'PY'
import json,sys
t=open(sys.argv[1]).read(); j=json.loads(t[t.index('{'):])
print('console:',j['console']); print('failed:',j['failed']); print('badLinks:',j['badLinks'])
print('overflow:',{k:v for k,v in j['overflow'].items() if v}); print('cls:',{k:round(v,3) for k,v in j['cls'].items()})
print('axe:',{k:v for k,v in j['axe'].items() if v})
PY

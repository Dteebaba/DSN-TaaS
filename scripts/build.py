import base64,json
s=open('src/app.html').read()
logo="data:image/png;base64,"+base64.b64encode(open('src/logo.png','rb').read()).decode()
seed=open('scripts/seed.json').read().replace("</","<\\/")
s=s.replace("__LOGO__",logo).replace("__SEED__",seed)
open('index.html','w').write(s)
print(len(s))

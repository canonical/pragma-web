import re
s=open('/home/user/graph-atlas/pragma.css').read()
lic = re.search(r'/\*[^*]*?The MIT License \(MIT\).*?\*/', s, flags=re.S)
nc=re.sub(r'/\*.*?\*/','',s,flags=re.S)
def fix(prelude):
    p=prelude
    p=p.replace(':where(:root)',':host').replace(':root:not(.light)','.island:not(.light)').replace(':root',':host')
    p=re.sub(r'\bhtml,\s*body,\s*#storybook-root\b','.island',p)
    p=re.sub(r'(?<![\w.#-])html(?![\w-])','.island',p)
    p=re.sub(r'(?<![\w.#-])body(?![\w-])','.island',p)
    return p
out=re.sub(r'([^{};@]+)\{', lambda m: fix(m.group(1))+'{', nc)
out=re.sub(r'\n\s*\n+','\n',out)
hdr='/* pragma.css for Shadow DOM islands: :root -> :host, html/body -> .island. Generated from @canonical/styles 0.44.1 and the component packages. */\n'
extra=open('/tmp/claude-0/-home-user/06a72397-f574-54f4-af6d-d59fdfba2a1a/scratchpad/render/extra-logo.css').read()
open('/home/user/graph-atlas/pragma-island.css','w').write((lic.group(0)+'\n' if lic else '')+hdr+out+'\n'+extra)
left=re.findall(r'(?<![\w.#-])(html|body|:root)(?![\w-])[^{;]*\{', out)
print('island bytes', len(out), 'leftover root selectors', left[:5])

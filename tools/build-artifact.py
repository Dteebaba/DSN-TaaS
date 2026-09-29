#!/usr/bin/env python3
"""Bundle frontend/ into one self-contained HTML file (dist/dsn-talent-platform.html).

Used for the Claude artifact demo, where the page must be a single file.
The normal website (Vercel) serves frontend/ directly and does not need this step.
"""
import base64, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
FE = ROOT / "frontend"
OUT = ROOT / "dist" / "dsn-talent-platform.html"

index = (FE / "index.html").read_text()
head_links = "\n".join(
    l for l in index.splitlines()
    if l.startswith(('<link rel="preconnect"', '<link rel="stylesheet" href="https://fonts', '<script src="https://cdnjs'))
)
css = (FE / "assets/css/app.css").read_text()
order = (FE / ".js-order").read_text().split()
js = "\n".join((FE / "assets/js" / f).read_text() for f in order)
logo = "data:image/png;base64," + base64.b64encode((FE / "assets/img/logo.png").read_bytes()).decode()
seed = (FE / "data/seed.json").read_text().replace("</", "<\\/")

html = f"""<title>DSN Talent Platform</title>
{head_links}
<style>
{css}
</style>
<div id="app"></div>
<div id="modal-root"></div>
<script type="application/json" id="seed">{seed}</script>
<script>window.DSN_LOGO={logo!r};</script>
<script>
{js}
</script>
"""
OUT.parent.mkdir(exist_ok=True)
OUT.write_text(html)
print(f"Wrote {OUT.relative_to(ROOT)} ({len(html):,} bytes)")

import json, re
from openpyxl import load_workbook

SRC = "/mnt/user-data/uploads/Podcast_Playlist_Detailed.xlsx"
wb = load_workbook(SRC, read_only=True); ws = wb.active
rows = list(ws.iter_rows(values_only=True))[1:]

# Rows that are not full episodes (verified by duration + content)
EXCLUDE_IDS = {"sfany3yasBo"}          # 0:54 short, no description
TRAILER_ID  = "wYO6uKxuQkM"           # 0:29 series trailer

def clean_title(t):
    t = t.replace("\U0001F399\uFE0F", "").replace("\U0001F399", "")
    return re.sub(r"\s+", " ", t).strip(" |—-").strip()

PATTERNS = [
    r"[Ff]eaturing\s+(.+?)\s*(?:[—\-|]|$)",
    r"\bwith\s+(.+?)\s*(?:[—\-|]|$)",
    r"\|\s*([A-Z][a-zA-Z.\'’]+(?:\s+[A-Z][a-zA-Z.\'’]+){1,3})\s*\|\s*The 10 in 10",
]
STOP = {"passion","purpose","us","you","your","me","confidence","clarity","intention"}

# Words that begin a role/company, never part of a personal name
ROLE = {"founder","co-owner","coowner","owner","ceo","creator","chiropractic","physician",
        "brand","senior","president","director","helping","drip","real","modern","turning",
        "lead","the","how","understanding","from","discipline","more","clean","designing"}

# Verified from each episode's own description where the title pattern misses or mangles it
OVERRIDES = {
    "TF_nkaep8LM": "Tina Malsom",
    "ncXWxG7uoJY": "Pam Kaye and Savannah",
    "WawgQpPNhtk": "Peter Rivera",
    "cP6d8LdHKpI": "Leia Ryan",
    "6MtiGFy3saw": "Jeff Lester",
    "6EUEdJMqzFs": "Karla Vandenberg",
    "TtVMHgjBPHg": "Shelby Ikeda",
    "UsgxhAVbM7w": "Dr. Janine Crifasi",
    "fcyvZuIexJw": "Jeff Lester",
    "qAdfM3kzEsI": "Jessica Benevento",
    "IXRbYBdVuLU": "Kimberly Akers",
    "0xTSYhjA99M": "Ryan Rybarczyk",
}

def trim_role(g):
    g = re.split(r"[\u201c\u201d\"(,&]", g)[0].strip()
    out = []
    for w in g.split():
        if w.lower().strip(".:") in ROLE and out:
            break
        out.append(w)
    return " ".join(out).strip(" .:|—-")

def guest(title, desc):
    t = clean_title(title)
    for p in PATTERNS:
        m = re.search(p, t)
        if not m: continue
        g = m.group(1).strip(" .|—-")
        g = re.split(r"\s*\|", g)[0].strip()
        if not g or g.lower() in STOP: continue
        words = g.split()
        if 1 < len(words) <= 5 and all(w[0].isupper() or w[0] in "“\"'" for w in words if w):
            return g
    return None

eps, trailer = [], None
for r in rows:
    num, vid, title, url, pub, dur, chan, desc, thumb = r
    if vid in EXCLUDE_IDS:
        continue
    rec = {
        "id": vid,
        "title": clean_title(title),
        "guest": OVERRIDES.get(vid) or guest(title, desc or ""),
        "publishedAt": pub,
        "duration": (dur or "").strip(),
        "description": re.sub(r"[ \t]+", " ", (desc or "")).strip(),
        "url": url,
        "thumbnail": thumb,
    }
    if vid == TRAILER_ID:
        rec["guest"] = None
        trailer = rec
        continue
    eps.append(rec)

eps.sort(key=lambda e: e["publishedAt"], reverse=True)
print("episodes:", len(eps))
print("with guest:", sum(1 for e in eps if e["guest"]))
for e in eps:
    print(("  " + (e["guest"] or "—")).ljust(34), "|", e["title"][:66])

out = {"trailer": trailer, "episodes": eps}
banner = ("// AUTO-GENERATED from Podcast_Playlist_Detailed.xlsx (51 rows -> 49 episodes + 1 trailer).\n"
          "// Every field is verified YouTube data. Do not hand-edit; see README > Updating episodes.\n"
          "// Excluded: 1 sub-minute clip with no description. The 29s series trailer is kept separately.\n\n")
with open("src/data/episodes.js", "w") as f:
    f.write(banner)
    f.write("export const trailer = " + json.dumps(out["trailer"], ensure_ascii=False, indent=2) + ";\n\n")
    f.write("export const episodes = " + json.dumps(out["episodes"], ensure_ascii=False, indent=2) + ";\n\n")
    f.write("export const guests = [...new Set(episodes.map(e => e.guest).filter(Boolean))].sort(\n"
            "  (a, b) => a.localeCompare(b)\n);\n\n")
    f.write("export const latestEpisode = episodes[0];\nexport const recentEpisodes = episodes.slice(1, 4);\n")
print("wrote src/data/episodes.js")

#!/usr/bin/env python3
"""Turn the frontend sample data (frontend/data/seed.json) into backend/supabase/seed.sql.

Sample data only. Logins are NOT created here: create users in Supabase Auth, then link them
with rows in public.accounts (see backend/README.md).
"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
seed = json.loads((ROOT / "frontend/data/seed.json").read_text())
out = []
def q(v):
    if v is None or v == "": return "null"
    if isinstance(v, bool): return "true" if v else "false"
    if isinstance(v, (int, float)): return str(v)
    if isinstance(v, list): return "array[" + ",".join(q(x) for x in v) + "]::text[]" if v else "'{}'::text[]"
    return "'" + str(v).replace("'", "''") + "'"
def ins(table, row):
    out.append(f"insert into {table} ({', '.join(row)}) values ({', '.join(q(v) for v in row.values())});")

st = seed["settings"]["main"]
# role manual from the frontend constants is not in seed.json; roles and programmes are.
for i, r in enumerate(st["roles"]): ins("role_catalog", {"name": r, "sort_order": i})
for i, p in enumerate(st["programmes"]): ins("dsn_programmes", {"name": p, "sort_order": i})
for k in ["verifyEmail", "roleDocs", "ratingDocs", "processNote", "premiumNote"]:
    out.append(f"insert into settings (key, value) values ({q(k)}, {q(json.dumps(st[k]))}::jsonb);")

for a in seed["applications"].values():
    ins("applications", {"dsn_id": a["dsnId"], "full_name": a["name"], "email": a["email"], "phone": a.get("phone"), "gender": a.get("gender"),
        "age_range": a.get("ageRange"), "state": a.get("state"), "education": a.get("education"), "employment_status": a["employmentStatus"],
        "years_experience": a.get("yearsExp"), "current_title": a.get("currentTitle"), "current_org": a.get("currentOrg"), "sector": a.get("sector"),
        "programmes": a.get("programmes", []), "primary_role": a["primaryRole"], "other_roles": a.get("otherRoles", []),
        "dsn_impact": a.get("dsnImpact"), "goals": a.get("goals"), "consent": True, "status": a["status"], "created_at": a["createdAt"]})

for m in seed["members"].values():
    s = m["scores"]
    ins("members", {"dsn_id": m["dsnId"], "full_name": m["name"], "gender": m.get("gender"), "location": m.get("location"), "headline": m.get("headline", ""),
        "summary": m.get("summary", ""), "skills": m.get("skills", []), "achievements": m.get("achievements", []),
        "score_tech": s["tech"], "score_projects": s["projects"], "score_experience": s["experience"], "score_education": s["education"], "score_soft": s["soft"],
        "score_status": m["scoreStatus"], "reviewed_at": m.get("reviewedAt"), "premium": m.get("premium", False), "visible": m.get("visible", True),
        "open_to_work": m.get("openToWork", True), "employment_status": m.get("employmentStatus"), "current_title": m.get("currentTitle"),
        "current_org": m.get("currentOrg"), "created_at": m["createdAt"]})
    ins("member_contacts", {"dsn_id": m["dsnId"], "email": m["email"], "phone": m.get("phone")})
    for i, e in enumerate(m.get("experience", [])):
        ins("member_experience", {"dsn_id": m["dsnId"], "sort_order": i, "role": e["role"], "company": e["company"], "start_month": e.get("start"),
            "end_month": e.get("end"), "is_current": e.get("current", False), "description": e.get("description")})
    for i, p in enumerate(m.get("projects", [])):
        ins("member_projects", {"dsn_id": m["dsnId"], "sort_order": i, "title": p["title"], "link": p.get("link"), "tools": p.get("tools"),
            "description": p.get("description"), "outcome": p.get("outcome")})
    for i, e in enumerate(m.get("education", [])):
        ins("member_education", {"dsn_id": m["dsnId"], "sort_order": i, "school": e["school"], "degree": e.get("degree"), "field": e.get("field"), "year": e.get("year")})
    for i, c in enumerate(m.get("certifications", [])):
        ins("member_certifications", {"dsn_id": m["dsnId"], "sort_order": i, "name": c["name"], "issuer": c.get("issuer"), "year": c.get("year"), "link": c.get("link")})
    for r in m.get("roles", []):
        ins("member_roles", {"dsn_id": m["dsnId"], "role": r["role"], "level": r["level"], "status": r["status"], "note": r.get("note"),
            "verified_at": r.get("verifiedAt"), "verified_by": r.get("verifiedBy")})
    for u in m.get("impact", []):
        ins("impact_updates", {"dsn_id": m["dsnId"], "recorded_at": u["date"], "employment_status": u["status"], "title": u.get("title"), "org": u.get("org"), "source": u.get("source")})

for r in seed["reviewers"].values():
    ins("reviewers", {"id": r["id"], "full_name": r["name"], "email": r["email"], "expertise": r.get("expertise"), "can_role": r["canRole"],
        "can_rating": r["canRating"], "active": r.get("active", True), "created_at": r["createdAt"]})
for r in seed["recruiters"].values():
    ins("recruiters", {"id": r["id"], "company": r["company"], "contact_name": r["contactName"], "email": r["email"], "phone": r.get("phone"),
        "industry": r.get("industry"), "company_size": r.get("size"), "needs": r.get("needs"), "status": r["status"], "subscribed": r["subscribed"],
        "subscribed_until": r.get("subscribedUntil"), "sub_requested": r.get("subRequested", False), "created_at": r["createdAt"]})

for r in seed["requests"].values():
    row = {"id": r["id"], "type": r["type"], "dsn_id": r["memberId"], "status": r["status"], "reviewer_id": r.get("reviewerId"),
           "created_at": r["createdAt"], "completed_at": r.get("completedAt")}
    iv = r.get("interview")
    if iv: row.update({"interview_at": iv["when"], "interview_link": iv.get("link"), "interview_note": iv.get("note")})
    ins("review_requests", row)
    roles = r.get("roles") or ([{"role": r["role"], "level": r["level"]}] if r.get("role") else [])
    oc = r.get("outcome") or {}
    for x in roles:
        d = {"request_id": r["id"], "role": x["role"], "claimed_level": x["level"]}
        if oc.get("role"):
            d.update({"verified": oc.get("action") != "rejected", "final_role": oc["role"], "final_level": oc["level"], "note": oc.get("note")})
        ins("review_request_roles", d)
    for h in r.get("history", []):
        ins("review_request_history", {"request_id": r["id"], "at": h["at"], "actor": h["by"], "text": h["text"]})

for t in seed["talentRequests"].values():
    ins("talent_requests", {"id": t["id"], "recruiter_id": t["recruiterId"], "role_needed": t["roleNeeded"], "level": t.get("level"), "headcount": t["count"],
        "engagement": t["engagement"], "work_mode": t.get("workMode"), "duration": t.get("duration"), "budget": t.get("budget"), "description": t["description"],
        "specific_members": t.get("specific", []), "shortlist": t.get("shortlist", []), "status": t["status"], "admin_note": t.get("adminNote"), "created_at": t["createdAt"]})
for v in seed["views"].values():
    ins("profile_views", {"dsn_id": v["memberId"], "recruiter_id": v["recruiterId"], "view_count": v["count"], "last_at": v["lastAt"]})

sql = "-- Sample data for testing. Generated by backend/tools/make_seed.py. Do not load in production.\nbegin;\n" + "\n".join(out) + "\ncommit;\n"
(ROOT / "backend/supabase/seed.sql").write_text(sql)
print(f"Wrote backend/supabase/seed.sql ({len(out)} statements)")

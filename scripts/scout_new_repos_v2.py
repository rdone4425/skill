import json, urllib.request, os

REPO_DIR = "/tmp/skill_repo"

def load_existing_names():
    names = set()
    cats = os.listdir(os.path.join(REPO_DIR, "static-categories"))
    for cat in cats:
        p = os.path.join(REPO_DIR, "static-categories", cat)
        if os.path.isdir(p):
            for fn in os.listdir(p):
                if fn.endswith(".json"):
                    names.add(fn.replace(".json", ""))
    return names

def map_category(topics, desc):
    t, d = " ".join(topics).lower(), (desc or "").lower()
    combined = t + " " + d
    if "agent" in combined and "framework" in combined:
        return "agent-framework"
    if "browser" in combined or "automation" in combined or "scrape" in combined:
        return "automation-productivity"
    if "dev" in combined or "code" in combined or "programming" in combined:
        return "dev-tools"
    if "security" in combined or "scan" in combined or "bot" in combined:
        return "security"
    if "data" in combined or "analysis" in combined or "sql" in combined:
        return "data-ai"
    if "design" in combined or "ui" in combined or "visual" in combined:
        return "design-ui"
    if "video" in combined:
        return "video-multimedia"
    if "audio" in combined or "voice" in combined or "speech" in combined:
        return "audio"
    if "game" in combined:
        return "game-dev"
    return "general"

def main():
    queries = [
        ("MCP+server+created:%3E2026-01-01", "MCP"),
        ("AI+agent+automation+created:%3E2026-01-01", "agent"),
        ("AI+browser+automation+created:%3E2026-01-01", "browser"),
        ("LLM+tool+framework+created:%3E2026-01-01", "llm"),
    ]
    all_items = []
    for q, label in queries:
        try:
            url = f"https://api.github.com/search/repositories?q={q}&sort=stars&order=desc&per_page=20"
            req = urllib.request.Request(url, headers={"User-Agent": "skill-hub"})
            with urllib.request.urlopen(req, timeout=20) as r:
                data = json.loads(r.read().decode())
                items = data.get("items", [])
                print(f"[{label}] Fetched {len(items)} repos")
                all_items.extend(items)
        except Exception as e:
            print(f"Error fetching {label}: {e}")

    dedup = {i["full_name"]: i for i in all_items}
    print(f"Total unique repos: {len(dedup)}")

    existing = load_existing_names()
    print(f"Existing skills: {len(existing)}")

    new_skills = []
    for full_name, repo in dedup.items():
        stars = repo.get("stargazers_count", 0)
        desc = repo.get("description", "") or ""
        name = repo["name"]
        lc_existing = {n.lower() for n in existing}
        if stars > 30 and desc and len(desc) > 10 and name not in existing and name.lower() not in lc_existing:
            new_skills.append({
                "name": name,
                "description": desc[:200],
                "url": repo["html_url"],
                "category": map_category(repo.get("topics", []), desc),
                "platform": "general",
                "stars": stars,
            })

    new_skills.sort(key=lambda x: -x["stars"])
    print(f"New skills: {len(new_skills)}")
    for s in new_skills[:20]:
        print(f"  [{s['stars']}] {s['category']} | {s['name']} | {s['description'][:70]}")

    if new_skills:
        batch_path = os.path.join(REPO_DIR, "new_skills_batch.json")
        with open(batch_path) as f:
            existing_batch = json.load(f)
        for s in new_skills:
            s2 = {k: v for k, v in s.items() if k != "stars"}
            existing_batch.append(s2)
        with open(batch_path, "w") as f:
            json.dump(existing_batch, f, indent=2, ensure_ascii=False)
        print(f"Saved. Total batch size: {len(existing_batch)}")

if __name__ == "__main__":
    main()

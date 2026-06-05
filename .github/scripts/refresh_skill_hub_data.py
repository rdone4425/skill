#!/usr/bin/env python3
"""Refresh stars for existing Skill Hub entries and report missing data."""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path


def build_headers() -> dict[str, str]:
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "skill-hub-maintenance",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def request_url(url: str, *, method: str = "GET", headers: dict[str, str] | None = None, timeout: int = 30) -> urllib.request.addinfourl:
    req = urllib.request.Request(url, headers=headers or {}, method=method)
    return urllib.request.urlopen(req, timeout=timeout)


def request_json(url: str, *, headers: dict[str, str]) -> dict:
    with request_url(url, headers=headers) as response:
        return json.loads(response.read().decode("utf-8"))


def check_url_exists(url: str, headers: dict[str, str]) -> tuple[str, str | None]:
    try:
        with request_url(url, method="HEAD", headers=headers):
            return "ok", None
    except urllib.error.HTTPError as exc:
        if exc.code in {403, 405}:
            try:
                with request_url(url, method="GET", headers=headers):
                    return "ok", None
            except urllib.error.HTTPError as inner:
                if inner.code in {404, 410}:
                    return "missing", f"http-{inner.code}"
                return "unknown", f"http-{inner.code}"
            except Exception as inner:  # noqa: BLE001
                return "unknown", type(inner).__name__
        if exc.code in {404, 410}:
            return "missing", f"http-{exc.code}"
        return "unknown", f"http-{exc.code}"
    except Exception as exc:  # noqa: BLE001
        return "unknown", type(exc).__name__


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def dump_json_text(payload: dict) -> str:
    return json.dumps(payload, ensure_ascii=False, indent=2) + "\n"


def write_if_changed(path: Path, text: str) -> bool:
    old = path.read_text(encoding="utf-8") if path.exists() else None
    if old == text:
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8", newline="\n")
    return True


def bucket_paths(root: Path) -> list[Path]:
    return sorted(root.glob("agents/*/*/skills.json"))


def skill_rows(paths: list[Path]) -> list[tuple[Path, dict, dict]]:
    rows: list[tuple[Path, dict, dict]] = []
    for path in paths:
        payload = load_json(path)
        for skill in payload.get("skills", []):
            rows.append((path, payload, skill))
    return rows


def repo_api_url(repo: str) -> str:
    owner, name = repo.split("/", 1)
    return f"https://api.github.com/repos/{urllib.parse.quote(owner)}/{urllib.parse.quote(name)}"


def sort_skills(skills: list[dict]) -> list[dict]:
    return sorted(
        skills,
        key=lambda item: (
            -int(item.get("stars") or 0),
            str(item.get("name") or "").lower(),
            str(item.get("repo") or "").lower(),
        ),
    )


def counter_rows(counter: Counter) -> list[dict]:
    return [
        {"name": name, "count": count}
        for name, count in sorted(counter.items(), key=lambda item: (-item[1], item[0]))
    ]


def build_agent_stats(root: Path) -> dict[str, list[dict]]:
    grouped: dict[str, list[dict]] = defaultdict(list)
    for path in bucket_paths(root):
        payload = load_json(path)
        agent = path.parts[-3]
        grouped[agent].extend(payload.get("skills", []))
    return grouped


def stats_text(agent: str, skills: list[dict]) -> str:
    category_counts = Counter(str(skill.get("functionCategory") or skill.get("group") or "general") for skill in skills)
    source_counts = Counter(str(skill.get("source") or "general") for skill in skills)
    repo_counts = Counter(str(skill.get("repo") or "") for skill in skills if skill.get("repo"))
    payload = {
        "generatedAt": "maintenance",
        "sourceData": "agents directory",
        "agent": agent,
        "totalSkills": len(skills),
        "functionCategoryCount": len(category_counts),
        "functionCategories": counter_rows(category_counts),
        "sources": counter_rows(source_counts),
        "repos": counter_rows(repo_counts),
        "topSkills": [
            {
                "name": skill.get("name"),
                "repo": skill.get("repo"),
                "stars": int(skill.get("stars") or 0),
                "functionCategory": skill.get("functionCategory") or skill.get("group") or "general",
                "source": skill.get("source") or "general",
                "url": skill.get("url"),
            }
            for skill in sort_skills(skills)[:10]
        ],
    }
    return "window.AGENT_STATS = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n"


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default=".", help="Skill Hub repository root")
    parser.add_argument("--dry-run", action="store_true", help="Check data without writing files")
    parser.add_argument("--verbose", action="store_true", help="Print per-entry updates")
    parser.add_argument("--max-skills", type=int, default=0, help="Only process the first N skills for local testing")
    parser.add_argument("--fail-on-missing", action="store_true", help="Exit non-zero when missing repos or URLs are found")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    root = Path(args.root).resolve()
    paths = bucket_paths(root)
    if not paths:
        print(f"No skills.json files found under {root}", file=sys.stderr)
        return 2

    headers = build_headers()
    repo_cache: dict[str, tuple[str, int | None, str | None]] = {}
    url_cache: dict[str, tuple[str, str | None]] = {}
    missing: list[dict] = []
    warnings: list[dict] = []
    file_changed = 0
    star_updates = 0
    checked = 0

    rows = skill_rows(paths)
    if args.max_skills > 0:
        rows = rows[: args.max_skills]

    payloads_by_path = {path: load_json(path) for path in paths}

    for path, _payload, skill in rows:
        repo = str(skill.get("repo") or "").strip()
        url = str(skill.get("url") or "").strip()
        checked += 1

        repo_state = "ok"
        repo_reason = None
        stars = None
        if repo:
            if repo not in repo_cache:
                try:
                    repo_payload = request_json(repo_api_url(repo), headers=headers)
                    repo_cache[repo] = ("ok", int(repo_payload.get("stargazers_count") or 0), None)
                except urllib.error.HTTPError as exc:
                    if exc.code in {404, 410}:
                        repo_cache[repo] = ("missing", None, f"http-{exc.code}")
                    else:
                        repo_cache[repo] = ("unknown", None, f"http-{exc.code}")
                except Exception as exc:  # noqa: BLE001
                    repo_cache[repo] = ("unknown", None, type(exc).__name__)
            repo_state, stars, repo_reason = repo_cache[repo]

            if repo_state == "ok" and stars is not None and int(skill.get("stars") or 0) != stars:
                if args.verbose:
                    print(f"[stars] {repo}: {skill.get('stars')} -> {stars}")
                skill["stars"] = stars
                star_updates += 1

        url_state = "ok"
        url_reason = None
        if url:
            if url not in url_cache:
                url_cache[url] = check_url_exists(url, headers)
            url_state, url_reason = url_cache[url]

        if repo_state == "missing" or url_state == "missing":
            reasons = []
            if repo_state == "missing":
                reasons.append(f"repo:{repo_reason}")
            if url_state == "missing":
                reasons.append(f"url:{url_reason}")
            missing.append(
                {
                    "agent": path.parts[-3],
                    "functionCategory": path.parts[-2],
                    "name": skill.get("name"),
                    "repo": repo,
                    "url": url,
                    "reason": ", ".join(reasons),
                }
            )
            if args.verbose:
                print(f"[missing] {skill.get('name')}: {', '.join(reasons)}")
        elif repo_state == "unknown" or url_state == "unknown":
            reasons = []
            if repo_state == "unknown":
                reasons.append(f"repo:{repo_reason}")
            if url_state == "unknown":
                reasons.append(f"url:{url_reason}")
            warnings.append(
                {
                    "agent": path.parts[-3],
                    "functionCategory": path.parts[-2],
                    "name": skill.get("name"),
                    "repo": repo,
                    "url": url,
                    "reason": ", ".join(reasons),
                }
            )
            if args.verbose:
                print(f"[warn] {skill.get('name')}: {', '.join(reasons)}")

    if not args.dry_run:
        touched_paths = {path for path, _payload, _skill in rows}
        for path in touched_paths:
            payload = payloads_by_path[path]
            text = dump_json_text(payload)
            if write_if_changed(path, text):
                file_changed += 1

        for agent, skills in build_agent_stats(root).items():
            stats_path = root / "agents" / agent / "stats.js"
            if write_if_changed(stats_path, stats_text(agent, skills)):
                file_changed += 1

        health_report = {
            "summary": {
                "checkedSkills": checked,
                "uniqueRepos": len(repo_cache),
                "missingCount": len(missing),
                "warningCount": len(warnings),
                "starUpdates": star_updates,
            },
            "missing": sorted(
                missing,
                key=lambda item: (
                    item["agent"],
                    item["functionCategory"],
                    str(item["name"] or "").lower(),
                ),
            ),
            "warnings": sorted(
                warnings,
                key=lambda item: (
                    item["agent"],
                    item["functionCategory"],
                    str(item["name"] or "").lower(),
                ),
            ),
        }
        if write_if_changed(root / "agents" / "health-report.json", dump_json_text(health_report)):
            file_changed += 1

    print(
        f"Checked {checked} skills, refreshed {star_updates} star values, "
        f"found {len(missing)} missing entries, {len(warnings)} warnings, changed {file_changed} files."
    )

    if args.fail_on_missing and missing:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

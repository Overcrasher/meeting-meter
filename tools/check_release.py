#!/usr/bin/env python3
"""Pre-publish checks for config.js. Usage: python3 tools/check_release.py [--release]

Fails (exit 1) if a donation link is not an https://buy.stripe.com/ or https://donate.stripe.com/ link, looks like a
test-mode / placeholder link, THANKS_URL is not the expected thanks page, the manifest lacks the matching thanks
content-script match, or lib/validate.js does not contain the same thanks URL.
With --release the three EUR links (small, medium, large) must also be set.
"""
import json, os, re, sys

# Mirrors ALLOWED_DONATION_ORIGINS in lib/support.js.
ALLOWED_ORIGINS = ("https://buy.stripe.com", "https://donate.stripe.com")
EXPECTED_THANKS = "https://overcrasher.github.io/meeting-meter/thanks.html"
EXPECTED_MATCH = EXPECTED_THANKS + "?session_id=*"
KEYS = ("small", "medium", "large")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
release = "--release" in sys.argv
errors = []


def read(rel):
    path = os.path.join(ROOT, rel)
    if not os.path.isfile(path):
        errors.append("%s: file not found" % rel)
        return None
    with open(path, encoding="utf-8") as fh:
        return fh.read()


cfg = read("config.js")
manifest_text = read("manifest.json")
validate = read("lib/validate.js")
manifest = {}
if manifest_text is not None:
    try:
        manifest = json.loads(manifest_text)
    except ValueError as e:
        errors.append("manifest.json: invalid JSON (%s)" % e)


def link_set(name):
    m = re.search(r"export const " + name + r"\s*=\s*\{([^}]*)\}", cfg)
    if not m:
        errors.append("config.js: %s not found" % name)
        return {}
    return dict(re.findall(r'(\w+)\s*:\s*"([^"]*)"', m.group(1)))


if cfg is not None:
    sets = {"DONATE_LINKS": link_set("DONATE_LINKS"), "DONATE_LINKS_USD": link_set("DONATE_LINKS_USD")}
    for name, links in sets.items():
        for key, url in links.items():
            where = "%s.%s" % (name, key)
            if key not in KEYS:
                errors.append("%s: unexpected key (allowed: %s)" % (where, ", ".join(KEYS)))
            if not url:
                continue
            if not url.startswith(tuple(o + "/" for o in ALLOWED_ORIGINS)):
                errors.append("%s: must start with one of %s (got %r)" % (where, ", ".join(o + "/" for o in ALLOWED_ORIGINS), url))
            if "test_" in url:
                errors.append("%s: looks like a Stripe test-mode link (contains 'test_')" % where)
            if re.search(r"TODO|PLACEHOLDER", url, re.I):
                errors.append("%s: contains TODO/PLACEHOLDER" % where)
    if release:
        for key in KEYS:
            if not sets["DONATE_LINKS"].get(key):
                errors.append("--release: DONATE_LINKS.%s (EUR) is empty - create the Stripe Payment Link and set it" % key)

    m = re.search(r'export const THANKS_URL\s*=\s*"([^"]*)"', cfg)
    if not m:
        errors.append("config.js: THANKS_URL not found")
    elif m.group(1) != EXPECTED_THANKS:
        errors.append("config.js: THANKS_URL is %r, expected %r" % (m.group(1), EXPECTED_THANKS))

if manifest:
    matches = []
    for cs in manifest.get("content_scripts", []):
        if "thanks.js" in cs.get("js", []):
            matches += cs.get("matches", [])
    if EXPECTED_MATCH not in matches:
        errors.append("manifest.json: no content_scripts match %r for thanks.js (found %r)" % (EXPECTED_MATCH, matches))

if validate is not None and EXPECTED_THANKS not in validate:
    errors.append("lib/validate.js: does not contain thanks URL %r" % EXPECTED_THANKS)

if errors:
    print("check_release: FAILED")
    for e in errors:
        print("  - " + e)
    sys.exit(1)
print("check_release: OK" + (" (release)" if release else ""))

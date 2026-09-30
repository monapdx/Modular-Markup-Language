# MML maintenance scripts

Maintenance scripts and package commands are installed. The Pages workflow is unchanged.

Run from the repository root:

```sh
npm install --save-dev --save-exact marked@17.0.5
npm run maintenance
```

Only the optional documentation builder needs the marked installation above. Commit package.json and package-lock.json if you install it. Node 22 is recommended. Checks use built-in Node modules; only the documentation builder needs marked.

## Commands

- `npm run check`: existing tests and all local checks; stops at the first failure.
- `npm run maintenance`: runs every check and writes maintenance-report.md; exits unsuccessfully if any check fails.
- `npm run check:external`: also checks external URLs, with 15-second timeouts. Access-denied responses need human review; links are never deleted automatically.
- `npm run build:schema-index`: writes DOCS/SCHEMA-INDEX.md from grammar exports.
- `npm run build-docs`: regenerates HTML under export/DOCS, links to your existing style.css, and rewrites Markdown links. Review the generated layout before deployment; the existing Obsidian export wrapper is replaced.

## Initial findings

The current repository contains documentation/implementation differences. The scripts report them rather than changing language behavior:

- Some documented shorthands and synonyms are not implemented.
- Notes scripts refer to export-blank, which is absent.
- Complete examples currently use text fences. Change complete, valid examples to mml, and deliberately invalid examples to mml-invalid. Keep fragments and syntax illustrations as text. The examples check fails if it finds no marked examples, so it cannot silently report success without coverage.
- Broken local links and heading anchors need review.

The schema index lists tags, aliases, parent candidates, and schema module exports. Attributes and complete validation rules remain authored in SPEC.md; it does not infer them from arbitrary JavaScript.

The path checker checks static relative imports, direct node commands, and the repository's __dirname path.join directory pattern. The link checker handles Markdown inline/reference definitions and quoted HTML href/src attributes. Neither evaluates dynamic expressions or CSS url() references.

The documentation builder supports GFM through marked. It preserves raw HTML from trusted repository Markdown. Do not use it on untrusted submissions without sanitization. Assets outside export are reported by link checks; copy required assets into the published directory.

## Deployment integration

After resolving the initial failures, add these steps after Checkout and before Upload Pages artifact in .github/workflows/pages.yml:

```yaml
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
      - run: npm ci
      - run: npm run build:schema-index
      - run: npm run build-docs
      - run: npm run check
```

The included maintenance workflow runs on pushes, PRs, manually, and weekly. Only the weekly run checks external URLs. Reports are uploaded even on failure. It does not write commits or create issues.

## Verification

Scripts were checked against a snapshot of main. Existing parser tests and the documentation generation were run. Current maintenance findings are included in VERIFICATION.txt. Fixture checks cover complete valid/invalid examples, broken imports, missing links, and generated document links. The report runner’s child-process integration could not be exercised in this execution sandbox; individual checks were run directly. External HTTP checks were not run.

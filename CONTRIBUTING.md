# Contributing to Modular Markup (MML)

Thanks for your interest in contributing to MML! This project is an early-stage
specification and parser, which means contributions can range from proposing
new semantic tags to fixing parser bugs to improving the spec's wording. This
document explains how to do each of those well.

Please also read our [Code of Conduct](./CODE_OF_CONDUCT.md) — we expect all
contributors to follow it.

## Table of Contents

- [Ways to Contribute](#ways-to-contribute)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Tags, Schemas, and Features](#suggesting-tags-schemas-and-features)
- [Development Setup](#development-setup)
- [Coding Style Guidelines](#coding-style-guidelines)
- [Branch Naming Conventions](#branch-naming-conventions)
- [Commit Message Format](#commit-message-format)
- [Pull Request Process](#pull-request-process)

## Ways to Contribute

Because MML has both a **specification** and a **parser**, contributions
generally fall into one of these categories:

| Type | Examples |
|---|---|
| Specification | Proposing a new tag, refining validation rules, clarifying semantics |
| Parser / Compiler | Fixing parsing bugs, improving AST generation, adding compilation targets |
| Documentation | Improving the README, SPEC, or tag reference docs |
| Tooling | Editor support, linting, test infrastructure |

If you're unsure which category your idea fits into, open an issue first and
we'll help you figure it out.

## Reporting Bugs

Before opening a new bug report:

1. **Search existing issues** to make sure it hasn't already been reported.
2. **Confirm it's reproducible** with the latest version of the parser.

When you open a bug report, please include:

- **A minimal MML snippet** that reproduces the issue (the smaller, the better)
- **Expected behavior** — what should the parser/compiler do?
- **Actual behavior** — what did it do instead, including any error messages
  (e.g. `Error: evidence requires parent claim`)
- **Environment details** — parser version, Node/runtime version, OS

Example of a good minimal repro:

````md
```
evidence
The final output is already HTML.
/evidence
```

Expected: a validation error stating `evidence` requires a `claim` parent.
Actual: the parser throws an unrelated stack trace.
````

## Suggesting Tags, Schemas, and Features

MML is meaning-first: a new tag should only be proposed if it represents a
concept that **cannot already be expressed** using existing tags. Before
proposing one, check the [TAGS](#) list and [PROPOSED TAGS](#) list.

When proposing a new tag or schema, open an issue using the **Tag Proposal**
or **Schema Proposal** template (or label your issue `tag-proposal` /
`schema-proposal` if templates aren't available yet) and include:

- **Name** — singular, lowercase, e.g. `citation`, not `citations`
- **Meaning** — the real-world concept it represents
- **Why existing tags don't cover it**
- **Parent/child rules** — what it requires as a parent, and what (if
  anything) it requires or allows as children
- **Example source** — a short MML snippet showing it in use
- **Example compiled output** — the resulting AST/XML-like structure

For general feature ideas that aren't tags (e.g. compiler targets, CLI
options, tooling), open a regular feature request issue describing the
problem you're trying to solve, not just the solution — this helps us
evaluate whether it fits MML's design principles (Text Wins, Singular
Elements, Explicit Closure, Semantic Necessity).

## Development Setup

```bash
# Clone the repository
git clone https://github.com/<org>/mml.git
cd mml

# Install dependencies
npm install

# Run the test suite
npm test

# Run the parser locally against a sample file
npm run parse -- examples/sample.mml
```

> If your local setup differs (e.g. a different package manager or build
> step), please update this section in your PR rather than leaving it stale.

## Coding Style Guidelines

- **Language conventions**: follow existing style in the file you're editing;
  consistency with surrounding code takes priority over personal preference.
- **Formatting**: run the project's formatter/linter before committing
  (`npm run lint` / `npm run format`) if configured.
- **Naming**: tag names in the spec and code are **singular** (`claim`, not
  `claims`) — mirror this in variable and function names that represent tag
  types.
- **Tests**: every parser change should include test cases covering both
  valid and invalid MML input (e.g. a case that should parse successfully,
  and a case that should raise the expected validation error).
- **Comments**: explain *why*, not *what* — the code already shows what it
  does.

## Branch Naming Conventions

Use the format `<type>/<short-description>`, where `type` is one of:

| Type | Use for |
|---|---|
| `feat` | New tags, schemas, or parser features |
| `fix` | Bug fixes |
| `docs` | Documentation-only changes |
| `refactor` | Code change that doesn't alter behavior |
| `test` | Adding or fixing tests |
| `chore` | Tooling, build config, dependency updates |

Examples:

```
feat/timeline-schema
fix/evidence-parent-validation
docs/contributing-guide
```

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

- **type**: `feat`, `fix`, `docs`, `refactor`, `test`, `chore` (same as branch
  types above)
- **scope** (optional): the area affected, e.g. `parser`, `schema`, `spec`
- **summary**: imperative mood, lowercase, no trailing period

Examples:

```
feat(schema): add timeline tag with year-start/year-end validation
fix(parser): correctly reject evidence without claim parent
docs: clarify text node auto-wrapping behavior
```

If a commit closes an issue, reference it in the footer:

```
fix(parser): correctly reject evidence without claim parent

Closes #42
```

## Pull Request Process

1. **Open an issue first** for anything beyond a trivial fix or typo —
   especially new tags or schema changes — so the approach can be discussed
   before you invest time in implementation.
2. **Fork and branch** from `main` using the naming convention above.
3. **Keep PRs focused** — one tag, one bug fix, or one cohesive change per PR.
   Large, unrelated changes bundled together are harder to review and merge.
4. **Add or update tests** for any parser/compiler behavior change.
5. **Update documentation** (README, SPEC, tag reference) if your change
   affects user-facing behavior or syntax.
6. **Fill out the PR template** completely, including the checklist.
7. **Ensure CI passes** — tests, linting, and any build checks must be green.
8. **Request review** — a maintainer will review your PR. Be responsive to
   feedback; PRs with no activity for 30+ days after a review may be closed
   and can be reopened when ready.
9. **Squash or clean up commits** if requested, to keep history readable.

Once approved, a maintainer will merge your PR. Thank you for contributing to
MML!

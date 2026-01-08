#!/bin/bash

# ============================================================================
# Claude Code Workflow Setup Script
# ============================================================================
# This script sets up the autonomous Claude Code workflow in your project.
#
# Usage:
#   curl -sSL https://raw.githubusercontent.com/.../setup.sh | bash
#   # OR
#   ./setup-claude-workflow.sh
#
# What it does:
#   1. Creates .claude/ directory with settings and agents
#   2. Creates .github/workflows/ for GitHub Actions
#   3. Creates template files (CLAUDE.md, DAILY_PLAN.md)
#   4. Installs Claude Code globally (if not present)
#   5. Installs Ralph Wiggum plugin
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Print functions
info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Banner
echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║       Claude Code Autonomous Workflow Setup               ║"
echo "║                                                           ║"
echo "║  This will set up:                                        ║"
echo "║  • GitHub Actions for scheduled runs                      ║"
echo "║  • Claude Code settings with safety hooks                 ║"
echo "║  • Subagents for implementation and review                ║"
echo "║  • Template files for daily planning                      ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if in a git repo
if [ ! -d ".git" ]; then
    error "Not in a git repository. Please run from your project root."
fi

PROJECT_ROOT=$(pwd)
info "Setting up in: $PROJECT_ROOT"

# Create directories
info "Creating directory structure..."
mkdir -p .claude/agents
mkdir -p .claude/commands
mkdir -p .github/workflows
mkdir -p scripts
mkdir -p logs

# Check for existing files
check_existing() {
    if [ -f "$1" ]; then
        warn "File exists: $1"
        read -p "Overwrite? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            info "Skipping $1"
            return 1
        fi
    fi
    return 0
}

# Create .claude/settings.json
if check_existing ".claude/settings.json"; then
    info "Creating .claude/settings.json..."
    cat > .claude/settings.json << 'SETTINGS_EOF'
{
  "plugins": [
    "ralph-wiggum@claude-plugins-official",
    "security-guidance@claude-plugins-official"
  ],
  "model": "claude-sonnet-4-5-20250929",
  "permissions": {
    "allow": [
      "Bash(bun:*)", "Bash(npm:*)", "Bash(npx:*)", "Bash(node:*)",
      "Bash(git:*)", "Bash(cat:*)", "Bash(ls:*)", "Bash(grep:*)",
      "Bash(find:*)", "Bash(mkdir:*)", "Bash(cp:*)", "Bash(mv:*)",
      "Bash(**/ralph-wiggum/**)",
      "Read(*)", "Write(*)", "Edit(*)", "Glob(*)", "Grep(*)"
    ],
    "deny": [
      "Bash(rm -rf /*)", "Bash(*sudo*)", "Bash(*chmod 777*)",
      "Bash(git push*--force*)", "Bash(git push*-f*)",
      "Write(*.env)", "Write(*.env.*)", "Write(*secrets*)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [{
          "type": "command",
          "command": "bash -c 'FILE=$(cat | jq -r \".file_path // empty\" 2>/dev/null); if [[ \"$FILE\" == *.ts ]] || [[ \"$FILE\" == *.tsx ]]; then npx eslint --fix \"$FILE\" 2>/dev/null || true; fi; echo \"{\\\"continue\\\":true}\"'"
        }]
      }
    ]
  }
}
SETTINGS_EOF
    success "Created .claude/settings.json"
fi

# Create feature-implementer agent
if check_existing ".claude/agents/feature-implementer.md"; then
    info "Creating feature-implementer agent..."
    cat > .claude/agents/feature-implementer.md << 'AGENT_EOF'
---
name: feature-implementer
description: Implements features using TDD. Invoke for new functionality.
tools: Read, Write, Edit, Bash, Glob, Grep
---

# Feature Implementer Agent

You implement features using Test-Driven Development:

1. **Understand**: Read spec, identify affected files
2. **Test First**: Write failing tests
3. **Implement**: Minimum code to pass tests
4. **Refactor**: Clean up, add docs
5. **Verify**: Run tests, typecheck, lint

Always follow existing patterns. Never skip tests.
AGENT_EOF
    success "Created feature-implementer agent"
fi

# Create code-reviewer agent
if check_existing ".claude/agents/code-reviewer.md"; then
    info "Creating code-reviewer agent..."
    cat > .claude/agents/code-reviewer.md << 'AGENT_EOF'
---
name: code-reviewer
description: Reviews code for quality and security.
tools: Read, Grep, Glob, Bash
---

# Code Reviewer Agent

Review checklist:
- Security: No secrets, input validation, injection prevention
- Quality: Small functions, no duplication, proper types
- Testing: Tests exist, cover edge cases
- Performance: No N+1 queries, proper pagination

Report: APPROVED / CHANGES_REQUESTED / NEEDS_DISCUSSION
AGENT_EOF
    success "Created code-reviewer agent"
fi

# Create GitHub workflow
if check_existing ".github/workflows/claude-daily-work.yml"; then
    info "Creating GitHub Actions workflow..."
    cat > .github/workflows/claude-daily-work.yml << 'WORKFLOW_EOF'
name: Claude Daily Development

on:
  schedule:
    - cron: '0 7 * * 1-5'  # 9 AM Bucharest (UTC+2)
  workflow_dispatch:
    inputs:
      max_iterations:
        description: 'Max iterations'
        default: '30'

jobs:
  implement:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Setup
        run: |
          git config user.name "Claude Code Bot"
          git config user.email "claude-bot@users.noreply.github.com"
          git checkout -B claude-work
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - uses: oven-sh/setup-bun@v1
      
      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code
      
      - name: Run Claude
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude /plugin install ralph-wiggum@claude-plugins-official || true
          claude -p '/ralph-loop "Read DAILY_PLAN.md and implement all [ ] tasks. Mark [x] when done. Output <promise>ALL_DONE</promise> when complete." --max-iterations ${{ github.event.inputs.max_iterations || 30 }} --completion-promise "ALL_DONE"'
      
      - name: Push & Create PR
        run: |
          git add -A
          git diff --cached --quiet || git commit -m "feat: daily implementation $(date +%Y-%m-%d)"
          git push -u origin claude-work --force
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - uses: peter-evans/create-pull-request@v5
        with:
          branch: claude-work
          title: "🤖 Daily Implementation"
          labels: automated,claude-code
WORKFLOW_EOF
    success "Created GitHub workflow"
fi

# Create CLAUDE.md if not exists
if [ ! -f "CLAUDE.md" ]; then
    info "Creating CLAUDE.md..."
    cat > CLAUDE.md << 'CLAUDE_EOF'
# CLAUDE.md - Project Instructions

## Tech Stack
- Runtime: Bun.js / Node.js
- Frontend: React + TypeScript
- Backend: Hono.js
- Testing: Vitest

## Conventions
- Use strict TypeScript
- Prefer type over interface
- Use Zod for validation
- Conventional commits (feat:, fix:, etc.)

## Commands
```bash
bun dev       # Start dev server
bun test      # Run tests
bun run lint  # Lint code
```

## Task Protocol
1. Read task from DAILY_PLAN.md
2. Search related files
3. Write tests first
4. Implement
5. Run tests, lint, typecheck
6. Mark [x] and commit
CLAUDE_EOF
    success "Created CLAUDE.md"
else
    warn "CLAUDE.md exists, skipping"
fi

# Create DAILY_PLAN.md template
if [ ! -f "DAILY_PLAN.md" ]; then
    info "Creating DAILY_PLAN.md template..."
    cat > DAILY_PLAN.md << 'PLAN_EOF'
# Daily Plan - $(date +%Y-%m-%d)

## Context
Describe what you're building today.

## Tasks

### Priority 1
- [ ] **Task 1**
  - Description: What to do
  - Files: `src/path/to/file.ts`
  - Acceptance: How to verify

### Priority 2
- [ ] **Task 2**
  - Description: What to do

## Constraints
- Things NOT to modify
- Dependencies to be aware of

## Success Criteria
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No linting errors

---
*Update this file daily before Claude runs*
PLAN_EOF
    success "Created DAILY_PLAN.md"
else
    warn "DAILY_PLAN.md exists, skipping"
fi

# Create BLOCKED.md
touch BLOCKED.md

# Create .gitignore additions
if ! grep -q "logs/" .gitignore 2>/dev/null; then
    echo -e "\n# Claude Code\nlogs/\n.claude/session.log" >> .gitignore
    success "Updated .gitignore"
fi

# Install Claude Code if not present
if ! command -v claude &> /dev/null; then
    info "Installing Claude Code..."
    npm install -g @anthropic-ai/claude-code
    success "Claude Code installed"
else
    info "Claude Code already installed: $(claude --version 2>/dev/null || echo 'unknown version')"
fi

# Install Ralph Wiggum plugin
info "Installing Ralph Wiggum plugin..."
claude /plugin install ralph-wiggum@claude-plugins-official 2>/dev/null || warn "Could not install plugin (may need API key)"

# Final instructions
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    Setup Complete!                        ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo ""
echo "1. ${YELLOW}Add your API key to GitHub Secrets:${NC}"
echo "   Settings → Secrets → Actions → New secret"
echo "   Name: ANTHROPIC_API_KEY"
echo ""
echo "2. ${YELLOW}Update CLAUDE.md with your project specifics${NC}"
echo ""
echo "3. ${YELLOW}Update DAILY_PLAN.md with today's tasks${NC}"
echo ""
echo "4. ${YELLOW}Test locally:${NC}"
echo "   export ANTHROPIC_API_KEY=your_key"
echo "   claude"
echo "   /ralph-loop \"Test task\" --max-iterations 5"
echo ""
echo "5. ${YELLOW}Commit and push:${NC}"
echo "   git add ."
echo "   git commit -m \"chore: add Claude Code workflow\""
echo "   git push"
echo ""
echo -e "${GREEN}The workflow will run automatically at 9 AM (Bucharest time)${NC}"
echo -e "${GREEN}or trigger manually from GitHub Actions tab.${NC}"
echo ""

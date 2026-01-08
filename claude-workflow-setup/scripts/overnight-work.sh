#!/bin/bash

# ============================================================================
# Claude Code Overnight Worker
# ============================================================================
# This script runs Claude Code with Ralph Wiggum plugin to work through
# DAILY_PLAN.md tasks autonomously overnight.
#
# Usage:
#   ./scripts/overnight-work.sh                    # Default: 30 iterations
#   ./scripts/overnight-work.sh --max-iterations 50
#   ./scripts/overnight-work.sh --dry-run          # Preview only
#
# Prerequisites:
#   - Claude Code installed: npm install -g @anthropic-ai/claude-code
#   - ANTHROPIC_API_KEY set in environment
#   - Ralph Wiggum plugin installed
#
# Cron setup (run at 9 AM weekdays):
#   0 9 * * 1-5 /path/to/project/scripts/overnight-work.sh >> /var/log/claude-work.log 2>&1
# ============================================================================

set -e

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK_BRANCH="claude-work"
MAX_ITERATIONS="${MAX_ITERATIONS:-30}"
LOG_DIR="${PROJECT_DIR}/logs"
LOG_FILE="${LOG_DIR}/claude-$(date +%Y%m%d-%H%M%S).log"
DRY_RUN=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --max-iterations)
            MAX_ITERATIONS="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help)
            echo "Usage: $0 [--max-iterations N] [--dry-run]"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        INFO)  color=$GREEN ;;
        WARN)  color=$YELLOW ;;
        ERROR) color=$RED ;;
        *)     color=$NC ;;
    esac
    
    echo -e "${color}[$timestamp] [$level] $message${NC}"
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log INFO "Checking prerequisites..."
    
    # Check Claude Code
    if ! command -v claude &> /dev/null; then
        log ERROR "Claude Code not found. Install with: npm install -g @anthropic-ai/claude-code"
        exit 1
    fi
    
    # Check API key
    if [ -z "$ANTHROPIC_API_KEY" ]; then
        log ERROR "ANTHROPIC_API_KEY not set"
        exit 1
    fi
    
    # Check git
    if ! command -v git &> /dev/null; then
        log ERROR "Git not found"
        exit 1
    fi
    
    # Check DAILY_PLAN.md exists
    if [ ! -f "$PROJECT_DIR/DAILY_PLAN.md" ]; then
        log ERROR "DAILY_PLAN.md not found in $PROJECT_DIR"
        exit 1
    fi
    
    # Check for uncompleted tasks
    if ! grep -q "^\- \[ \]" "$PROJECT_DIR/DAILY_PLAN.md"; then
        log WARN "No uncompleted tasks found in DAILY_PLAN.md"
        exit 0
    fi
    
    log INFO "All prerequisites met"
}

# Setup working branch
setup_branch() {
    log INFO "Setting up work branch: $WORK_BRANCH"
    
    cd "$PROJECT_DIR"
    
    # Ensure we're on latest main
    git fetch origin
    
    # Create or checkout work branch
    if git show-ref --verify --quiet "refs/heads/$WORK_BRANCH"; then
        git checkout "$WORK_BRANCH"
        git pull origin "$WORK_BRANCH" || true
    else
        git checkout -b "$WORK_BRANCH" origin/main
    fi
    
    log INFO "On branch: $(git branch --show-current)"
}

# Install dependencies
install_dependencies() {
    log INFO "Installing dependencies..."
    
    cd "$PROJECT_DIR"
    
    if [ -f "bun.lockb" ]; then
        bun install
    elif [ -f "package-lock.json" ]; then
        npm ci
    elif [ -f "package.json" ]; then
        npm install
    fi
    
    log INFO "Dependencies installed"
}

# Run Claude with Ralph Wiggum
run_claude() {
    log INFO "Starting Claude Code with Ralph Wiggum loop..."
    log INFO "Max iterations: $MAX_ITERATIONS"
    
    cd "$PROJECT_DIR"
    
    # Create logs directory
    mkdir -p "$LOG_DIR"
    
    if [ "$DRY_RUN" = true ]; then
        log INFO "[DRY RUN] Would execute:"
        echo "claude -p '/ralph-loop \"...\" --max-iterations $MAX_ITERATIONS --completion-promise \"ALL_DONE\"'"
        return 0
    fi
    
    # Install Ralph Wiggum plugin if not present
    claude /plugin install ralph-wiggum@claude-plugins-official 2>/dev/null || true
    
    # Run the loop
    claude -p '/ralph-loop "
Read DAILY_PLAN.md and implement all tasks marked with [ ].

## Your Process
For each uncompleted task [ ]:
1. Read the task description carefully
2. Read relevant existing code files first
3. Plan the implementation (think step by step)
4. Write tests first (TDD approach)
5. Implement following the conventions in CLAUDE.md
6. Run tests: bun test (or npm test)
7. Run linter: bun run lint:fix
8. Run typecheck: bun run typecheck
9. If all pass, mark task as [x] in DAILY_PLAN.md
10. Git commit with descriptive conventional commit message
11. Move to next task

## Error Handling
- If a task fails after 3 attempts, mark it as [BLOCKED: reason]
- Document blockers in BLOCKED.md with details
- Continue to next task

## HARD STOPS
- When you encounter a task marked HARD STOP, output <promise>CHECKPOINT</promise>
- Wait for human verification before proceeding

## Completion
- When ALL tasks are [x] or [BLOCKED], output <promise>ALL_DONE</promise>
- If >50% tasks blocked, output <promise>NEEDS_HELP</promise>

## Rules
- Never modify files outside the project directory
- Never force push
- Always run tests before committing
- Follow existing code patterns
" --max-iterations '"$MAX_ITERATIONS"' --completion-promise "ALL_DONE"' 2>&1 | tee -a "$LOG_FILE"
}

# Push results
push_results() {
    log INFO "Pushing results..."
    
    cd "$PROJECT_DIR"
    
    # Add any remaining changes
    git add -A
    
    if ! git diff --cached --quiet; then
        git commit -m "chore: final changes from Claude session $(date +%Y-%m-%d)"
    fi
    
    # Push to remote
    git push origin "$WORK_BRANCH"
    
    log INFO "Results pushed to origin/$WORK_BRANCH"
}

# Generate summary
generate_summary() {
    log INFO "Generating summary..."
    
    cd "$PROJECT_DIR"
    
    local completed=$(grep -c "^\- \[x\]" DAILY_PLAN.md 2>/dev/null || echo "0")
    local blocked=$(grep -c "^\- \[BLOCKED" DAILY_PLAN.md 2>/dev/null || echo "0")
    local remaining=$(grep -c "^\- \[ \]" DAILY_PLAN.md 2>/dev/null || echo "0")
    local total=$((completed + blocked + remaining))
    
    echo ""
    echo "=============================================="
    echo "           CLAUDE WORK SUMMARY"
    echo "=============================================="
    echo "  ✅ Completed:  $completed"
    echo "  🚫 Blocked:    $blocked"
    echo "  ⏳ Remaining:  $remaining"
    echo "  📊 Total:      $total"
    echo "=============================================="
    echo "  Branch: $WORK_BRANCH"
    echo "  Log:    $LOG_FILE"
    echo "=============================================="
    echo ""
    
    if [ "$remaining" -eq 0 ] && [ "$blocked" -eq 0 ]; then
        log INFO "🎉 All tasks completed successfully!"
    elif [ "$blocked" -gt $((total / 2)) ]; then
        log WARN "⚠️ More than 50% tasks blocked - needs human review"
    fi
    
    # Show comparison link
    echo "Review changes at:"
    echo "https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/compare/main...$WORK_BRANCH"
}

# Main execution
main() {
    echo ""
    log INFO "=========================================="
    log INFO "  Claude Code Overnight Worker Started"
    log INFO "=========================================="
    
    # Create log directory
    mkdir -p "$LOG_DIR"
    
    check_prerequisites
    setup_branch
    install_dependencies
    run_claude
    
    if [ "$DRY_RUN" = false ]; then
        push_results
    fi
    
    generate_summary
    
    log INFO "=========================================="
    log INFO "  Overnight work completed"
    log INFO "=========================================="
}

# Run main
main "$@"

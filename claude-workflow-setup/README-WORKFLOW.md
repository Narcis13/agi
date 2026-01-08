# Claude Code Autonomous Development Workflow

Un setup complet pentru a rula Claude Code în mod autonom folosind tehnica Ralph Wiggum. Claude lucrează pe task-urile tale în timpul zilei, iar tu faci review seara.

## 🎯 Workflow Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DAILY WORKFLOW                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🌅 DIMINEAȚA (Tu)                                                   │
│  ├── Actualizezi DAILY_PLAN.md cu task-urile zilei                  │
│  ├── Push la GitHub                                                  │
│  └── Pleci la serviciu                                               │
│                                                                      │
│  ☀️ ZIUA (Claude - Automat)                                          │
│  ├── GitHub Actions pornește la ora configurată (9 AM)              │
│  ├── Claude citește DAILY_PLAN.md                                    │
│  ├── Ralph Wiggum loop: implementează task după task                │
│  ├── Marchează [x] task-urile completate                            │
│  ├── Documentează blockerele în BLOCKED.md                          │
│  └── Creează PR automat când termină                                │
│                                                                      │
│  🌙 SEARA (Tu)                                                       │
│  ├── Verifici PR-ul creat de Claude                                 │
│  ├── Review codul                                                    │
│  ├── Merge în main (sau request changes)                            │
│  └── Pregătești planul pentru mâine                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## 📁 Structura Fișierelor

```
project/
├── .github/
│   └── workflows/
│       └── claude-daily-work.yml    # GitHub Action pentru automatizare
├── .claude/
│   ├── settings.json                # Configurare Claude Code
│   ├── agents/
│   │   ├── feature-implementer.md   # Subagent pentru implementare
│   │   └── code-reviewer.md         # Subagent pentru review
│   └── commands/
│       └── implement-daily.md       # Custom command
├── scripts/
│   ├── overnight-work.sh            # Script pentru rulare locală
│   └── setup-claude-workflow.sh     # Script de instalare
├── CLAUDE.md                        # Instrucțiuni pentru Claude
├── DAILY_PLAN.md                    # Task-urile zilei (ACTUALIZEAZĂ ZILNIC)
├── BLOCKED.md                       # Documentare blockere
└── README-WORKFLOW.md               # Acest fișier
```

## 🚀 Quick Start

### 1. Setup Automat

```bash
# Clonează sau copiază fișierele în proiectul tău
chmod +x scripts/setup-claude-workflow.sh
./scripts/setup-claude-workflow.sh
```

### 2. Configurare GitHub

1. **Adaugă API Key-ul**:
   - Go to: Settings → Secrets and variables → Actions
   - New repository secret: `ANTHROPIC_API_KEY`

2. **Permite PR-uri automate**:
   - Go to: Settings → Actions → General
   - Workflow permissions: "Read and write permissions"
   - Check: "Allow GitHub Actions to create and approve pull requests"

### 3. Testare Locală

```bash
# Setează API key
export ANTHROPIC_API_KEY=sk-ant-...

# Testează Ralph Wiggum
claude
> /ralph-loop "Test: create a hello.txt file with 'Hello World'" --max-iterations 3 --completion-promise "DONE"
```

## 📋 Cum să Scrii DAILY_PLAN.md

### Format Recomandat

```markdown
# Daily Plan - 9 Ianuarie 2026

## Context
Building user authentication for PostNow app.

## Tasks

### Priority 1: Must Have
- [ ] **Create login endpoint**
  - Description: POST /api/auth/login with email/password
  - Files: `src/routes/auth.ts`
  - Acceptance: Returns JWT on success, 401 on failure

- [ ] **Add password hashing**
  - Description: Use bcrypt for password hashing
  - Files: `src/lib/auth.ts`
  - Acceptance: Passwords hashed with salt rounds 12

### Priority 2: Should Have  
- [ ] **Write login tests**
  - Description: Integration tests for login flow
  - Files: `tests/auth.test.ts`

### HARD STOPS
- [ ] **HARD STOP** - Verify login works before continuing

## Constraints
- Don't modify existing user table
- Use existing JWT library

## Success Criteria
- [ ] All tests pass
- [ ] No TypeScript errors
```

### Tips pentru Task-uri Eficiente

✅ **DO:**
- Fii specific: "Create POST /api/users endpoint" nu "Add user API"
- Include fișierele relevante
- Definește acceptance criteria clare
- Folosește HARD STOP pentru puncte de verificare

❌ **DON'T:**
- Task-uri vagi: "Improve code"
- Task-uri prea mari: "Build entire auth system"
- Fără acceptance criteria

## ⚙️ Configurare Avansată

### Schimbă Ora de Rulare

În `.github/workflows/claude-daily-work.yml`:

```yaml
on:
  schedule:
    # Format: minute hour day month weekday
    - cron: '0 7 * * 1-5'   # 9 AM Bucharest (UTC+2)
    # Alte exemple:
    # - cron: '0 5 * * 1-5'   # 7 AM Bucharest
    # - cron: '0 22 * * 0-4'  # 12 AM Bucharest (overnight)
```

### Ajustează Limita de Iterații

```yaml
# În workflow
max_iterations:
  default: '30'  # Schimbă valoarea default

# Sau la runtime
workflow_dispatch:
  inputs:
    max_iterations:
      default: '50'
```

### Adaugă Notificări Slack

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    fields: repo,message,commit,author
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## 🔒 Safety Features

### Hooks de Securitate

Configurate în `.claude/settings.json`:

1. **PreToolUse Hooks**: Blochează comenzi periculoase
   - `rm -rf /`
   - `sudo`
   - `git push --force`
   - SQL injection patterns

2. **PostToolUse Hooks**: Auto-lint după editare
   - Rulează ESLint fix pe fișiere .ts/.tsx

3. **Permission Deny List**: Previne scrierea în
   - `.env` files
   - `*secrets*`
   - `*.pem`, `*.key`

### Ralph Wiggum Safety

- **`--max-iterations`**: ÎNTOTDEAUNA setează o limită
- **`--completion-promise`**: Definește când să se oprească
- **HARD STOPS**: Puncte de verificare umană

## 🔧 Troubleshooting

### Claude nu pornește

```bash
# Verifică instalarea
claude --version

# Verifică API key
echo $ANTHROPIC_API_KEY

# Reinstalează
npm install -g @anthropic-ai/claude-code
```

### Ralph Wiggum nu funcționează

```bash
# Verifică plugin-ul
claude /plugin list

# Reinstalează
claude /plugin install ralph-wiggum@claude-plugins-official

# Verifică permisiunile în settings.json
# "Bash(**/ralph-wiggum/**)" trebuie să fie în allow
```

### GitHub Action eșuează

1. Check Secrets: `ANTHROPIC_API_KEY` setat corect?
2. Check Permissions: Workflow are write access?
3. Check Logs: Actions → Failed run → View logs

### Task-uri blocate frecvent

- Fă task-urile mai mici și specifice
- Adaugă mai mult context în CLAUDE.md
- Verifică dacă dependencies sunt instalate

## 📊 Monitorizare

### Verifică Progresul

```bash
# Vezi task-urile completate
grep "^\- \[x\]" DAILY_PLAN.md | wc -l

# Vezi task-urile blocate
grep "^\- \[BLOCKED" DAILY_PLAN.md

# Vezi log-urile
cat logs/claude-*.log | tail -100
```

### Metrics Recomandate

- Task-uri completate per zi
- Task-uri blocate (indiciu că task-urile sunt prea complexe)
- Timpul până la PR
- Număr de iterații per task

## 🔄 Workflow Alternativ: Local Overnight

Dacă preferi să rulezi local în loc de GitHub Actions:

```bash
# Adaugă în crontab
crontab -e

# Adaugă linia (rulează la 9 AM în zilele de lucru)
0 9 * * 1-5 cd /path/to/project && ./scripts/overnight-work.sh >> /var/log/claude.log 2>&1
```

## 📚 Resurse

- [Claude Code Documentation](https://code.claude.com/docs)
- [Ralph Wiggum Plugin](https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

## ❓ FAQ

**Q: Cât costă să rulezi asta zilnic?**
A: Depinde de complexitatea task-urilor. Cu 30 iterații și task-uri moderate, aproximativ $5-15/zi cu Claude Sonnet.

**Q: Pot să folosesc alt model?**
A: Da, schimbă `model` în `.claude/settings.json`. Opus e mai bun dar mai scump.

**Q: Ce se întâmplă dacă Claude face ceva greșit?**
A: Totul e pe un branch separat și necesită PR review. Nu poate afecta main direct.

**Q: Pot să opresc Claude în timpul execuției?**
A: Da, din GitHub Actions poți cancela workflow-ul. Local: Ctrl+C.

---

Made with 🤖 for autonomous development

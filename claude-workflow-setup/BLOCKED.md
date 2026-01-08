# Blocked Tasks Log

This file documents tasks that Claude could not complete and require human intervention.

---

## How to use this file

When Claude encounters a task it cannot complete after multiple attempts, it will document the blocker here with:
- Task reference from DAILY_PLAN.md
- What was attempted
- Why it failed
- What's needed to proceed

**Human action required:** Review blockers and either:
1. Provide missing information/access
2. Modify the task to be more achievable
3. Complete the task manually

---

## Blockers

<!-- Claude will append blockers below this line -->

### Template

```markdown
### [DATE] - Task: [TASK_NAME]

**From:** DAILY_PLAN.md - [Task description]

**Attempts:**
1. Attempt 1: [What was tried]
   - Result: [What happened]
2. Attempt 2: [What was tried]
   - Result: [What happened]

**Blocker:** [Why it cannot be completed]

**Needs:** [What's required to proceed]
- [ ] Information needed: [specific info]
- [ ] Access needed: [specific access]
- [ ] Decision needed: [what decision]

**Workaround:** [If any temporary workaround was applied]

---
```

<!-- Blockers start here -->

---
name: high-fortitude-quality
enabled: true
event: stop
pattern: .*
action: warn
---

**Quality Checkpoint - High Fortitude Mode**

Before completing this task, verify excellence:

**Code Quality:**
- [ ] No `console.log` left in production code
- [ ] Error handling is comprehensive, not just happy path
- [ ] Types are explicit and meaningful (no `any`)
- [ ] Functions are small and single-purpose

**Architecture:**
- [ ] Changes follow existing patterns in the codebase
- [ ] No unnecessary abstractions or over-engineering
- [ ] Imports are organized and minimal

**Testing & Validation:**
- [ ] Edge cases considered
- [ ] Build still passes (`pnpm build`)
- [ ] No TypeScript errors

**Documentation:**
- [ ] Complex logic has explanatory comments
- [ ] Public APIs have JSDoc if needed

*"Ship fast AF, but ship quality."* - CLAUDE.md philosophy

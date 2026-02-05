---
name: warn-dangerous-rm
enabled: true
event: bash
pattern: rm\s+(-rf|-fr|--recursive\s+--force|--force\s+--recursive)
action: warn
---

**Dangerous rm command detected!**

You're about to run a recursive force delete. Please verify:

- [ ] The target path is correct
- [ ] No important files will be lost
- [ ] This isn't running against `/`, `~`, or project root

**Tip:** Consider using `trash` or moving to a temp location first for reversibility.

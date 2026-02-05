---
name: warn-any-type
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.(ts|tsx)$
  - field: new_text
    operator: regex_match
    pattern: ":\\s*any\\b"
action: warn
---

**TypeScript `any` type detected!**

Per CLAUDE.md: "Strict mode always - no `any` types"

**Alternatives:**
- `unknown` - for truly unknown types (requires type narrowing)
- `Record<string, unknown>` - for object with unknown properties
- Generic type parameter - `<T>` for flexible but typed functions
- Union types - `string | number | null` for specific possibilities

**If `any` is truly needed:** Add a comment explaining why, like:
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = externalLibraryCall(); // Legacy API returns untyped
```

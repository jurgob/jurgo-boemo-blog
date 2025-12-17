---
  slug: "/posts/types-in-typescript-should-make-your-life-easier/"
  date: 2025-12-17 11:37
  title: "Types in Typescript should make your life easier"
  draft: false
  description: "Types in Typescript should make your life easier"
  categories: ["Types", "Typescript"]
  keywords: ["Types", "Typescript", "React", "zod", "ts-rest", "drizzle"]
---


Type systems are great, but it depends how you use them. I see often developers obsessed with name conventions or pattern design architectures, but not very often to tackle what matters. 
what it matters to me: 
- Most real failures come from I/O: environment variables, network boundaries, databases, and external APIs. If someone changes a function inside your codebase, you’ll see it in reviews or tests. If an external API changes its payload shape, you often only discover it in production. If you forgot and env vars, your be may not start up after the deployment, if your react client got the wrong response, it may not render your page correctly and so on. A good coding and testing style prioritizes **validating I/O early, explicitly, and at the boundaries**.
- Defining and mantaining Types should not be a lot of "manual" works and it should be driven by the compiler, not from you hammering differnt types to keep them in sync. There are some rules you can follow. 
- You should know as many think as possible at compile time. if you are using Typescript for evertying and you have a  monorepo, then if infra code breaks the be code (let's say due to an env var change), you should know it at compile time. if the backend change the contract and breaks the render of  the frontend , you should know it at compile time,an so on..


---

## Zod Is the De‑Facto Standard

In the TypeScript ecosystem, **Zod is effectively the de‑facto standard** for runtime validation that stays aligned with static types.

Zod:
- Synchronizes runtime checks and TypeScript inference
- Makes failures explicit
- Pushes errors to the *leafs* of the system, where unknown data enters

Prefer **Zod‑compatible libraries** so validation remains consistent:
- Network contracts: `ts-rest`, `tRPC`
- Environment variables: Zod schemas parsed at startup
- Databases: Drizzle + Zod for inputs/outputs

---

## Validate What You Don’t Control

If someone changes a function in your codebase, you’ll notice.  
If an external system changes its behavior, you won’t—unless you validate.

Typical I/O boundaries:
- Environment variables
- Network requests and responses
- Database reads/writes
- Third‑party APIs

Fail fast, close to the source.

---

## Never Use `any`

**Never use `any`.**  
If you don’t know the shape, use `unknown` and narrow it.

If you know *something*, encode it:

```ts
Record<string, unknown>
```

This forces assumptions to be proven instead of silently trusted.

---

## Strings Are Overused

A user ID is not “just a string”. It’s a **UserId**.

Use branded types:

```ts
export const UserId = z.uuid().brand<'UserId'>();
export type UserId = z.infer<typeof UserId>;
```

Reuse branded identifiers everywhere. This prevents accidentally mixing unrelated strings across your domain.

---

## Avoid Enums: They Kill Composability

TypeScript `enum`s reduce composability and flexibility.

Prefer literal unions (or `as const` arrays) instead. They:
- Compose naturally
- Work cleanly with Zod
- Avoid runtime artifacts

If you want to enforce this, enable:

```json
{
  "compilerOptions": {
    "erasableSyntaxOnly": true
  }
}
```

---

## Prefer `type` Over `interface`

Interfaces:
- Don’t compose as well
- Encourage inheritance

Prefer `type` aliases:
- Better with unions and intersections
- More aligned with functional domain modeling

---

## Strict Types Aren’t Expensive — Duplication Is

Most “types are expensive” complaints come from duplication.

Model relationships and derive types instead of redefining them.

```ts
export const User = z.object({
  id: UserId,
  name: UserName,
  dob: UserDob,
});

export const CreateUser = User.omit({ id: true });
export const ModifyUser = CreateUser.partial();
```

Derivation keeps refactors cheap and models consistent.

---

## Use Discriminated Unions

Discriminated unions make invalid states unrepresentable.

### Zod Example

```ts
import { z } from 'zod';

const WithOpeningDate = z.object({
  openingDateStatus: z.literal('available'),
  opening_date: z.date(),
});

const NoOpeningDate = z.object({
  openingDateStatus: z.literal('notav'),
});

const CommonForm = z.object({
  title: z.string(),
  description: z.string(),
});

export const Form = z.discriminatedUnion('openingDateStatus', [
  CommonForm.merge(WithOpeningDate),
  CommonForm.merge(NoOpeningDate),
]);

export type Form = z.infer<typeof Form>;
```

Both runtime and compile‑time validation now agree.

---

## Explicit Environment Variable Validation

Validate environment variables at startup. Fail loudly.

```ts
import { z } from 'zod';

export const Stages = z.union([
  z.literal('local'),
  z.literal('dev'),
  z.literal('staging'),
  z.literal('prod'),
]);

const DatabaseUrl = z.union([z.string().url(), z.literal(':inmemory:')]);

export const EnvSchema = z.object({
  STAGE: Stages,
  AWS_REGION: z.string(),
  DATABASE_URL: DatabaseUrl.default(':inmemory:'),
});

const parsedEnv = EnvSchema.parse(process.env);

for (const [key, value] of Object.entries(parsedEnv)) {
  if (process.env[key] === undefined && value !== undefined) {
    process.env[key] = value.toString();
  }
}

export const envVarsConfig = parsedEnv;
```

**Do not lazily validate config later.**  
Delayed validation leads to opaque runtime failures.

---

## Share Types in a Monorepo

If you use a monorepo, **share your types**:
- Share env var schemas between infra and backend
- Share domain models between backend and frontend
- Share network contracts between server and client

This prevents drift.

---

## Network Validation with ts‑rest

Use `ts-rest` on both server and client so the network boundary is typed *and* validated.

- Zod defines the contract
- The server validates requests and responses
- The client is type‑safe by construction

No duplicated DTOs. No guessing.

---

## Minimal Monorepo Example (Conceptual)

**Stack**
- Zod (schemas)
- ts-rest (network)
- Express (server)
- Drizzle (database)
- React (client)
- CDK (infra)

**Shared package**
- Domain schemas
- Env var schemas
- API contracts

**Backend**
- Parses env vars using shared schema
- Validates network input via ts-rest
- Uses Drizzle for typed DB access

**Frontend**
- Uses ts-rest client generated from shared contract
- Uses shared Zod schemas for input validation

**Infra (CDK)**
- Reuses env var definitions from shared package
- Avoids config drift

---

## Final Takeaways

- Types are great, but **I/O validation is critical**
- Validate what you don’t control
- Zod is the de‑facto standard
- Never use `any`
- Avoid enums
- Prefer `type` over `interface`
- Use branded types for domain identifiers
- Derive related schemas instead of duplicating them
- Use discriminated unions
- Share schemas and contracts across your monorepo

Strong types plus explicit runtime validation lead to predictable systems and far fewer production surprises.




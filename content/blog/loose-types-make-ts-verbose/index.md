---
  slug: "/posts/loose-types-make-ts-verbose/"
  date: 2025-06-12 15:19
  title: "Loose Types Make Your Code Verbose — Type Narrowing to the Rescue!"
  draft: false
  description: "TypeScript’s type system isn’t strictly safe by default — and that was likely a conscious decision to make it more accessible to JavaScript developers."
  categories: []
  keywords: []
---


# Loose Types Make Your Code Verbose — Type Narrowing to the Rescue!

TypeScript’s type system isn’t strictly safe by default — and that was likely a conscious decision to make it more accessible to JavaScript developers. This flexibility helped drive adoption in the JS community. But as TypeScript gained popularity, it also attracted developers from other languages. As a result, the community now includes both developers who aren’t used to static types, and others who don’t fully understand JavaScript’s quirks. That mix has led to a lot of confusion about how types should actually be used in TypeScript.

---

## The `User` Object: Starting Simple

Here’s a pattern I’ve seen many times in real-world code.
Imagine we have a basic `User` object that allows arbitrary data.
let's say you want to get the `user.data.role` property from your user. 


“Arbitrary” sounds like you can put `any` kind of value there, right? 

so the type would be:

```ts
type User = {
  id: string;
  name: string;
  data?: any;
};

const user:User = {
    id:"1",
    name:"user1",
}


console.log(user.data.role)
```
[TS Playground](https://www.typescriptlang.org/play/?#code/C4TwDgpgBAqgzhATlAvFA3gKClAlgEwC4o5hFcA7AcwG5soKBDAWwmNPOrp30eEYD8xRhRB0AvnUwBjAPYVSUAK4JEheElQZ6OAoQBEARn0AaHQxZt9KpMbPjMjuQtkAbCADpXsqgAobiB68-B6IbhAAlEA)


your compiler will be happy, but you will get an error at runtime. 

The complier is happy because typing properties with  any does not mean only accept "any value", in reality  `any mean: "accept any value" AND "disable the typecheck for this property".`

Now if you are an old-school js developer, you know that the js, has many dynamic languages, is based on [Duck Typing](https://en.wikipedia.org/wiki/Duck_typing). 
In a nutshell, if you are too lazy to read wikipedia, duck typing means you got to write a bunch of checks at runtime if object properties exists.
This forse you to write repetitive, defensive checks:

```ts
console.log(user?.data?.role)
```

but what if you want to be sure this is `really` and object?

And even that won’t prevent all issues — it's fragile and untyped. Immagine if data allow nested object!

Is my belive that `any` was one of the major weapon to convince js developers to move to typescript. But in 2025 any  still exist in typescript mainlty for retrocompatibility reasons (and any linter discourage you to use it)


---

## `unknown` to the Rescue

If you think you should use `any`, it probaly means you want to use `unknown`:


let's see how this changes:


```ts
type User = {
  id: string;
  name: string;
  data?: unknown;
};

const user:User = {
    id:"1",
    name:"user1",
    data:{role: "user"}
}

if(user?.data && typeof user?.data ==="object" &&  "role" in user.data ) // you need to add this if or the complier will not let you do it.
    console.log(user?.data?.role)
```
[TS playground](https://www.typescriptlang.org/play/?#code/C4TwDgpgBAqgzhATlAvFA3gKClAlgEwC4o5hFcA7AcwG5soKBDAWwmNPOrp30eEYD8xAK4UA1hQD2Adwp0AvnUwBjSRVJRhCRIXhJUGejgKEARAEZTAGiMMWbU1qSWbOHn0aF0iSQBs2UI7apvKYoZi4AGYAFE6IAgB0vPxQAGSpUKCQkpGa2onJjKgoKKaSAEYAVhDKwKZpGYE+-vWUeUhJHlAAlFAA9H1QIJLCDBAQ+JmSUIz4k8AAFrhweLmSyIvQqsxgvrj60ri+vgySwFD+58Oj+NO4wAm2qup+EAm+klSx+Z38ic0QbpAA)

Now, TypeScript *forces* you to check before use, that's why the check is changed. now it is safe, but it is super verbose. For this reason, I saw many develper prefering to use any and hoping to not be on call if this became an error in production.


✅ The check is still at runbime, but **you can't forget it anymore**. The compiler has your back. Still very verbose indeed.

---

## What About `object`?

Using `object` feels more descriptive, I mean, in js an object is that thing you define with `{}`, right? it is basically an hashmap, correct? seems exactly what I need!
Here is how your type would be:

```ts
type User = {
  id: string;
  name: string;
  data: object;
};

if(user?.data  &&  "role" in user.data ) 
    console.log(user?.data.role)
```

But it still hides sharp edges.
This allows **any value where `typeof value === "object"`**, which includes:

- Arrays (`[]`)
- `null`
- `{}`

So basically, wtll the same typecheck. Not ideal for safe usage or good DX.

---

## ✅ Use `Record<string, unknown>`

The reality is that whay you need is a record. Your key values are probably strings, and if you don't know your values type, you can use `unknown`. Something like:

```ts
type User = {
  id: string;
  name: string;
  data: Record<string, unknown>;
};

const user = {
    id:"1",
    name:"user1",
    data:{}
}

if("role" in user.data && user.data?.role === "agent"){
    console.log(user.data.role)
}
```
[Check this on the TS Playground](https://www.typescriptlang.org/play/?ssl=15&ssc=2&pln=7&pc=1#code/C4TwDgpgBAqgzhATlAvFA3gKClAlgEwC4o5hFcA7AcwG5soKBDAWwmNPOrp30eEeIAlCAGMA9onwAeDpSoAaKAFcKAawpiA7hQB8dAL51M4iqWUJkaLDhwFCAIgCM9+fRxNWDpReeubUXn5CdH1MUMxcADMACntEMQAbCHs8CnMkADpAxigAMlz0xCy+RgB+DPik1BQ0e0YqCApgewBKaxsTOESIDISxKmjvTOyK7pawoA)


This enforces you to have data :
- Must be a plain object
- Keys must be strings
- Values must be explicitly narrowed before use

### How you use it:

If you try to access `someValue` without narrowing, the compiler will complain — which is **exactly** what you want.

### Bonus tip

If you don’t use `symbol` or `number` keys in your objects (and you almost never do unless writing a compiler or framework), you don’t need `Record<symbol | string, ...>`. Stick with `Record<string, ...>`.

---

## Narrowing with Union Types

You can also limit the types of values allowed inside `data`:

```ts
type User = {
  id: string;
  name: string;
  data: Record<string, string | number | boolean>;
};
```

### Now usage becomes simpler:

```ts
function processUser(user: User) {
  const theme = user.data["theme"];
  if (typeof theme === "string") {
    console.log(theme.toUpperCase());
  }
}
```

Because you’ve already told TypeScript what values are possible, narrowing is straightforward and less error-prone.

---

## 🌲 Recursive Type for Nested Objects

What if `data` can contain nested objects and arrays, like JSON? Use a recursive type:

```ts
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

type User = {
  id: string;
  name: string;
  data: JSONValue;
};
```

### Example usage:

```ts
function getTheme(user: User) {
  if (
    typeof user.data === "object" &&
    user.data !== null &&
    "settings" in user.data
  ) {
    const settings = user.data["settings"];
    if (
      typeof settings === "object" &&
      settings !== null &&
      "theme" in settings
    ) {
      const theme = (settings as any)["theme"];
      if (typeof theme === "string") {
        return theme;
      }
    }
  }
  return "default";
}
```

This is especially useful when your data comes from user input or APIs.

---

## Summary

| Type                       | Compiler Safe? | Allows `null`? | Good Default? | Requires Manual Checks? |
|---------------------------|----------------|----------------|----------------|--------------------------|
| `null`                    | ❌              | ✅              | ❌              | ✅                        |
| `unknown`                 | ✅              | ✅              | ✅              | ✅                        |
| `object`                  | ✅              | ✅              | ❌              | ✅                        |
| `Record<string, unknown>` | ✅              | ❌              | ✅✅✅           | ✅                        |
| Recursive JSONValue       | ✅              | ✅              | ✅ (for deep data) | ✅                        |

---

### ✅ Pro tip:

Start with `unknown`, then **narrow** to a more precise shape using:

- `Record<string, unknown>` for plain JS objects  
- Union types (`string | number | boolean`) for value sets  
- Recursive types for deeply nested structures  

---

Narrow types are your best friend. They make your library safer, reduce bugs, and improve your developer experience.

Want to dig deeper into advanced type guards or build custom ones for your library? Drop a comment — or better, share how *you* handle dynamic data with TypeScript!

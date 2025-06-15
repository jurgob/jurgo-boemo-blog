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

## TLDR Version

if you don't have time, here is what you are gonna learn: 
when you are defining your types, follow those rules:
- avoid `any` at any cost, eventyally use `unknown`
- if you know you need an object, avoid the type `object`. use the type `Record<string, MyUnion>`, make the uninon as strict as you can.
- strict union still allows you to have nested data.
- if you type your data right, your code will became very concise,  the optional chaining is gonna be all what you need in most cases.

If this is not clear enough or you can't wait to read my amazing article, keep reading, if you understand anything then feel free to skip the rest.

## The `User` Object: Starting Simple

Here’s a pattern I’ve seen many times in real-world code.
Imagine we have a basic `User` object that allows arbitrary data.
let's say you want to get the `user.data.role` property from your user. 
Ideally, if you know what is the [optional chaining](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html) (the `?.` operator) you would expect that you could do something like `const role = user?.data?.role` and eventually assign `underfined` if something in this chain does not exist.


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
This force you to write repetitive, defensive checks, and if you are not an experienced javascript developer, probably you don't even know what to check exactly.

Is my believe that `any` was one of the major weapon to convince js developers to move to typescript. But in 2025 any  still exist in typescript mainly for retrocompatibility reasons (and any linter discourage you to use it)


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

Using `object` feels more descriptive, I mean, in js an object is that thing you define with `{}`, right? it is basically an [hashmap](https://youtu.be/pKO9UjSeLew?si=zavllTNv_Gmtqppf&t=58), correct? It seems exactly what I need!
Here is how your type would be:

```ts
type User = {
  id: string;
  name: string;
  data?: object;
};

if(user?.data  &&  "role" in user.data ) 
    console.log(user?.data.role)
```

A little better, but still too verbose. Also this is not particularry safe. 
In fact, this allows **any value where `typeof value === "object"`**, which includes:

- Arrays (`[]`)
- `null`
- `{}`

That's because typescript need to reflect what javascript do. 
In general, Not ideal for safe usage or good DX.

---

## ✅ Use `Record<string, unknown>`

The reality is that what you need is a record. Your key values are probably strings, and if you don't know your values type, you can use `unknown`. Something like:

```ts
type User = {
  id: string;
  name: string;
  data?: Record<string, unknown>;
};

const user:User = {
    id:"1",
    name:"user1",
    data:{
      "role": "user"
    }
}

console.log(user.data?.role)
```
[Check this on the TS Playground](https://www.typescriptlang.org/play/?ssl=15&ssc=2&pln=7&pc=1#code/C4TwDgpgBAqgzhATlAvFA3gKClAlgEwC4o5hFcA7AcwG5soKBDAWwmNPOrp30eEeIAlCAGMA9onwAeDpSoAaKAFcKAawpiA7hQB8dAL51M4iqWUJkaLDhwFCAIgCM9+fRxNWDpReeubUXn5CdH1MUMxcADMACntEMQAbCHs8CnMkADpAxigAMlz0xCy+RgB+DPik1BQ0e0YqCApgewBKaxsTOESIDISxKmjvTOyK7pawoA)


This enforces you to have data :
- Must be a plain object
- Keys must be strings

### How you use it:

This is finally what we want!

### Bonus tip

String is not the only type you can use for object keys in javascript and typescript. But if you don't know what a symbole is, or why this is true in js:  `typeof [] ==='string'`,  Stick with `Record<string, ...>`.

---

## Narrowing with Union Types

You can do better then this. You can also limit the types of values allowed inside `data`:

```ts
type User = {
  id: string;
  name: string;
  data: Record<string, string | number | boolean>;
};

const user:User = {
    id:"1",
    name:"user1",
    data:{
      "role": "user"
    }
}

console.log(user.data?.role)
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

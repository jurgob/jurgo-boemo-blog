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

## TL;DR Version

If you don't have time, here is what you are gonna learn: 

When you are defining your types, follow these rules:
- ❌ Avoid `any` at any cost; prefer `unknown`
- ❌ If you need an object type, avoid  `object`. 
- ✅ Use Instead  `Record<string, MyUnion>`and make the union as strict as possible.
- ✅ With properly typed data, [optional chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) (`?.`) will usually be all you need.


## The `User` Object: Starting Simple

Here’s a pattern I’ve seen many times in real-world code.
Imagine we have a basic `User` object that allows arbitrary data.
let's say you want to get the `user.data.role` property from your user. 
Ideally, if you know what is the [optional chaining](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html) (the `?.` operator) you would expect that you could do something like `const role = user?.data?.role` and eventually assign `undefined` if something in this chain does not exist.


At first glance, `data?: any` feels like the simplest way to allow any shape of object… but it silently disables all checks

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
[Try this example on TS Playground](https://www.typescriptlang.org/play/?#code/C4TwDgpgBAqgzhATlAvFA3gKClAlgEwC4o5hFcA7AcwG5soKBDAWwmNPOrp30eEYD8xRhRB0AvnUwBjAPYVSUAK4JEheElQZ6OAoQBEARn0AaHQxZt9KpMbPjMjuQtkAbCADpXsqgAobiB68-B6IbhAAlEA)


your compiler will be happy, but you will get an error at runtime. 

The compiler is happy because typing properties with  any does not mean only accept "any value", in reality  `any` means  `"accept any value" AND "disable the typecheck for this property"`.

Now if you are an old-school js developer, you know that the js, has many dynamic languages, is based on [Duck Typing](https://en.wikipedia.org/wiki/Duck_typing). 
In a nutshell, if you are too lazy to read wikipedia, duck typing means you got to write a bunch of checks at runtime if object properties exists.
This force you to write repetitive, defensive checks, and if you are not an experienced javascript developer, probably you don't even know what to check exactly.

It is my belief that `any` was one of the major weapons to convince js developers to move to typescript. But in 2025 any still exists in typescript mainly for retrocompatibility reasons (and any linter discourages you to use it)

---

## `unknown` to the Rescue

If you think you should use `any`, it probably means you want to use `unknown`:


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

if(user?.data && typeof user?.data ==="object" &&  "role" in user.data ) // you need to add this if or the compiler will not let you do it.
    console.log(user?.data?.role)
```

[Try this example on TS Playground](https://www.typescriptlang.org/play/?#code/C4TwDgpgBAqgzhATlAvFA3gKClAlgEwC4o5hFcA7AcwG5soKBDAWwmNPOrp30eEYD8xAK4UA1hQD2Adwp0AvnUwBjSRVJRhCRIXhJUGejgKEARAEZTAGiMMWbU1qSWbOHn0aF0iSQBs2UI7apvKYoZi4AGYAFE6IAgB0vPxQAGSpUKCQkpGa2onJjKgoKKaSAEYAVhDKwKZpGYE+-vWUeUhJHlAAlFAA9H1QIJLCDBAQ+JmSUIz4k8AAFrhweLmSyIvQqsxgvrj60ri+vgySwFD+58Oj+NO4wAm2qup+EAm+klSx+Z38ic0QbpAA)

Now, TypeScript *forces* you to check before use, that's why the check is changed. Now it is safe, but it is super verbose. For this reason, I saw many developers preferring to use any and hoping to not be on call if this becomes an error in production.


✅ The check is still at runtime, but **you can't forget it anymore**. The compiler has your back. Still very verbose indeed.

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

A little better, but still too verbose. Also this is not particularly safe. 
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
[Check this on the Try this example on TS Playground](https://www.typescriptlang.org/play/?ssl=15&ssc=2&pln=7&pc=1#code/C4TwDgpgBAqgzhATlAvFA3gKClAlgEwC4o5hFcA7AcwG5soKBDAWwmNPOrp30eEeIAlCAGMA9onwAeDpSoAaKAFcKAawpiA7hQB8dAL51M4iqWUJkaLDhwFCAIgCM9+fRxNWDpReeubUXn5CdH1MUMxcADMACntEMQAbCHs8CnMkADpAxigAMlz0xCy+RgB+DPik1BQ0e0YqCApgewBKaxsTOESIDISxKmjvTOyK7pawoA)


This enforces you to have data :
- Must be a plain object
- Keys must be strings

### How you use it:

This is finally what we want!

### Bonus tip

String is not the only type you can use for object keys in javascript and typescript. But if you don't know what a symbol is, or why this is true in js:  `typeof [] === 'object'`,  stick with `Record<string, ...>`.

---

## Narrowing with Union Types

You can do better than this. You can also limit the types of values allowed inside `data`:

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

## Summary

Using narrow, well-defined types makes your code safer, reduces bugs, and dramatically improves your developer experience.

Want to dig deeper into advanced type guards or build custom ones for your library? Drop a comment — or better, share how *you* handle dynamic data with TypeScript!

---
  slug: "/posts/exhaustive_pattern_matching_in_typeScript/"
  date: 2024-03-03 20:27
  title: "Exhaustive Pattern Matching in TypeScript"
  draft: false
  description: "Exhaustive Pattern Matching in TypeScript, what, why, how."
  categories: []
  keywords: ["Typescript", "Exhaustive Pattern MAtching", "rust"]
---

# Exhaustive Pattern Matching in TypeScript

Pattern matching is a powerful programming construct that allows developers to match values against a series of patterns and execute code based on the matched pattern. Exhaustive pattern matching ensures that all possible cases are handled, leaving no room for unintended behavior. In this article, we'll explore exhaustive pattern matching in TypeScript, its importance, and various techniques to achieve it.

## Why Exhaustive Pattern Matching?

Exhaustive pattern matching is crucial for writing robust and maintainable code. By ensuring that all possible cases are handled, it helps prevent unexpected runtime errors and makes code more predictable and easier to reason about.

Let's start with an example in Rust to illustrate the concept:

```rust
enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter,
}

fn value_in_cents(coin: Coin) -> u32 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter => 25,
    }
}
```



In this Rust code, the `match` expression guarantees exhaustive pattern matching for the `Coin` enum. Each variant is handled explicitly, leaving no possibility of unhandled cases.

Try to remove some of the match in the value_in_cents function in [the rust playground](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=66af4923be7b7c1bb165f0d12399ab26), you will get an error at compile time.



## Exhaustive Pattern Matching in TypeScript

Rust kind of force you to into the Exhaustive Pattern Matching. Typescript does not. 
So, if you are a Typescript developer who has never heard of this concept, you may implement the code above in this way: 

```typescript
type Coin = "Penny" | "Nickel" | "Dime" | "Quarter";

function valueInCents(coin: Coin): number {
    switch (coin) {
        case "Penny":
            return 1;
        case "Nickel":
            return 5;
        case "Dime":
            return 10;
        case "Quarter":
            return 25;
        default:
            return 0
    }
}
```
Check this on the [TS Playground](https://www.typescriptlang.org/play?ssl=16&ssc=2&pln=1&pc=2#code/C4TwDgpgBAwg9gSwHZQLxQEQAUJKSDKAH0wDkEBjAawgBtCSMARBAWwgcwEUBXAQwBOwCAIwBuAFASAZjyQVgCOCgBufWjwgBJJDFzAAzgAoKiJAC5YZgJSWkPVgCMRUAN4SonqAYDuCYBQAFlAmNm4eXpEUfAbQ2Lj4GOYRkalQAhDAPAIoAIySaZ7RsWSUNPTJhakZWTlQAKwFhcVxLOxJKVXpmdl5AAxNaS3c-EIiHV1eNb1QAEyNnZEAJhDSfDy0wJWT3bUofZ0AvhLHUhJAA)


Do you see the problem? If you forget to manage a case, the compiler will not help you. If tomorrow, there's a new type of Coin, the compiler will not tell you that you have to update the `valueInCents` function. 

(p.s. if you are asking yourself why I didn't use an enum , it's because in Typescript [enum are not type-safe](https://dev.to/ivanzm123/dont-use-enums-in-typescript-they-are-very-dangerous-57bh).


In TypeScript, achieving exhaustive pattern matching involves leveraging the `never` type. By using `never`, TypeScript ensures that a function or switch statement covers all possible input types or values.

### Enter the `never`

What does the `never` keyword do?. In TypeScript, the never keyword represents the type of values that never occur. When a function has a return type of never, it means that the function never returns normally and either throws an error or enters an infinite loop. never is a useful tool for making TypeScript code more robust and ensuring that all possible cases are handled. Read more about it in the [official TS docs](https://www.typescriptlang.org/docs/handbook/basic-types.html#never) or go even more deep [here](https://www.zhenghao.io/posts/ts-never).



### Using `never` in Functions

Here is how we can implement the example we did in Rust using never:

```typescript
type Coin = "Penny" | "Nickel" | "Dime" | "Quarter";

function valueInCents(coin: Coin): number {
    switch (coin) {
        case "Penny":
            return 1;
        case "Nickel":
            return 5;
        case "Dime":
            return 10;
        case "Quarter":
            return 25;
        default:
            return 0 as never
    }
}
```

In this function, if a new Coin type is introduced in the future, TypeScript ensures that we handle it explicitly by assigning it to a variable of type `never` (which will give a compile error). This guarantees exhaustive pattern matching.

Try to add a value to the Coin union or to remove a case in the switch [on the typescript background](https://www.typescriptlang.org/play?ssl=16&ssc=2&pln=1&pc=1#code/C4TwDgpgBAwg9gSwHZQLxQEQAUJKSDKAH0wDkEBjAawgBtCSMARBAWwgcwEUBXAQwBOwCAIwBuAFASAZjyQVgCOCgBufWjwgBJJDFzAAzgAoKiJAC5YZgJSWkPVgCMRUAN4SonqAYDuCYBQAFlAmNm4eXpEUfAbQ2Lj4GOYRkalQAhDAPAIoAIySaZ7RsWSUNPTJhakZWTlQAKwFhcVxLOxJKVXpmdl5AAxNaS3c-EIiHV1eNb1QAEyNnZEAJhDSfDy0wJWT3bUofVAxUEgQKiKdAL4SV1ISQA), you will see the compiler complaining.


### Using `never` in Switch Statements

Similarly, we can achieve exhaustive pattern matching using `never` in switch statements:

```typescript
type Coin = "Penny" | "Nickel" | "Dime" | "Quarter";

function myFunction(coin: Coin): void {
    
    let value = 0;
    switch (coin) {
        case "Penny":
            value= 1;
            break;
        case "Nickel":
            value= 5;
            break;
        case "Dime":
            value= 10;
            break;
        case "Quarter":
            value= 25;
            break;
        default:
            value = 0 as never
    }
}
```

This will also return an error in case you forget a `break`.

Try to remove a break in the [typescript playground](https://www.typescriptlang.org/play?ssl=22&ssc=2&pln=1&pc=1#code/C4TwDgpgBAwg9gSwHZQLxQEQAUJKSDKAH0wDkEBjAawgBtCSMARBAWwgcwEUBXAQwBOwCAIwBuAFASAZjyQVgCOClYgAYnIVKkACgqIkALlgGAlMYBuiACZQA3hKhOoj57QjAoFvrR7R0AAySzlAAzgDuCMAUABZQemb2riFOFHyh0Ni4+BiGySkh3r4Q6ACMwQUpAEYCEHxUFQVpGWSUNPR5lSlFfugArI1dUDV1DfkhzZks7LnjlT0lUKVBcwUj9YMT6Zm8gsKinUNOC+gATAOr1bUbl9YQ0nw8tMCHRwtoUAFQ6VBIEBYifIAXwkIKkQA).


## Error handling. 

You may have noticed that in the default branch, which in theory is never reached, I'm returning a 0. The reason is that Typescript is not a very safe/strict type system (and this is by design), so you can always end up having unexpected value. It can be because you are parsing the information from a network request, cli input, file, etc... and your parser is not very strict. Or it can be just because you have just used `as Coin` like this: 

```typescript
type Coin = "Penny" | "Nickel" | "Dime" | "Quarter";

function valueInCents(coin: Coin): number {
    switch (coin) {
        case "Penny":
            return 1;
        case "Nickel":
            return 5;
        case "Dime":
            return 10;
        case "Quarter":
            return 25;
        default:
            return 0 as never
    }
}

const value = valueInCents("CoinNotValid" as Coin) // thh compiler will be happy. value is gonna be 0

```
aka: if I have passed an invalid coin, the value in cent is 0. 
you may instead want to be more explicit in the error handling and delegate it to the caller of the `valueInCent` function. 
you could throw an Error like this: 

```typescript
type Coin = "Penny" | "Nickel" | "Dime" | "Quarter";

function valueInCents(coin: Coin): number {
    switch (coin) {
        case "Penny":
            return 1;
        case "Nickel":
            return 5;
        case "Dime":
            return 10;
        case "Quarter":
            return 25;
        default:
            throw Error("hello") as never;
    }
}

valueInCents("CoinNotValid" as Coin)
```

Or you could return `undefined`. If you go this way, you should change the signature of the function to return `number | undefined`  The Compiler does not force you, but in this way you will force whoever is using the function to manage `undefined`. Obviously I'm assuming you are working with `"strict": true` in your complier option

the could would look like this: 

```typescript
type Coin = "Penny" | "Nickel" | "Dime" | "Quarter";

function valueInCents(coin: Coin): number|undefined {
    switch (coin) {
        case "Penny":
            return 1;
        case "Nickel":
            return 5;
        case "Dime":
            return 10;
        case "Quarter":
            return 25;
        default:
            return undefined as never;
    }
}

const res:number = valueInCents("CoinNotValid" as Coin)  || 0 //the complier force you to manage the case is undefined
```

Go to the [typescript playground](https://www.typescriptlang.org/play?ssl=18&ssc=119&pln=1&pc=1#code/C4TwDgpgBAwg9gSwHZQLxQEQAUJKSDKAH0wDkEBjAawgBtCSMARBAWwgcwEUBXAQwBOwCAIwBuAFASAZjyQVgCOCgBufWjwgBJJDFzAAzgAoKiJAC5YZgJSWkPVgCMRROQBMI05BDdQA3hJQQVAGAO4IwBQAFlAmNv6BwUkUfAbQ2Lj4GOaJSXlQAhDAPAIoAIyS+UEpaWSUNPQ5VXmFxaVQAKyVVTXpLOzZuc0FRSXlAAzd+b3c-EIig8PBrWNQAExdQ0ke0nw8tMBNSyNtKO6e3r6pUEgQKiJTUAC+Ei8SpkgGwCMG5vZOIjQUDUGm0un0xgw8GQpDgwAAauoEG5CNdoUhrEEiCRxlAAPR44BRaCmVhgWgIQHSOACCjQEBwHhQYBwKCsPhIPgAc2gRJJqWgCAMUHOXlubikQA) and try to remove the `|| 0`. the compiler will complain. Try to remove also the `|undefined` from the signature, now the compiler will be happy. Unluckily it is gonna be up to you to be disciplined.
  


## Alternatives

While using `never` for exhaustive pattern matching is effective, there are alternative approaches available in the TypeScript ecosystem:

### ts-pattern Library

The `ts-pattern` library provides a powerful pattern matching syntax for TypeScript:

```typescript
import { match, _ } from 'ts-pattern';

type Result = "success" | "error";

const message = match<Result>('error')
    .with('success', () => 'Operation succeeded!')
    .with('error', () => 'An error occurred!')
    .exhaustive();
```

### ECMAScript Pattern Matching Proposal

The [ECMAScript Pattern Matching proposal](https://github.com/tc39/proposal-pattern-matching) introduces native pattern matching syntax to JavaScript and TypeScript. While still a proposal, it shows promise for simplifying pattern matching in TypeScript in the future.

## Conclusion

Exhaustive pattern matching is a valuable technique for writing reliable and maintainable code. By leveraging TypeScript's type system and features like `never`, developers can ensure that all possible cases are handled, leading to more robust software. Additionally, with libraries like `ts-pattern` and upcoming language features, pattern matching in TypeScript is becoming even more expressive and convenient.
Anyway, My personal opinion is that the pattern matching in typescript  right now, in terms of ergonomics, is  very far from the one you got in languages like Rust.  Such a fundamental things should be part of the language, so I'm really looking forward for the pattern matching proposal.
But don't wait for it, us it now! with ts-pattern or with never.
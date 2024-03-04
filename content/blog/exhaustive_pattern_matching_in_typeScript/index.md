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
    }
}
```

Do you see the problem? If you forget to manage a case, the compliler will not help you. If tomorrow, there's a new type of Coin, the compiler will not tell you that you have to update the `valueInCents` function. 

(p.s. if you are asking yourself why I didn't use an enum , it's because in Typescript [enum are not typesafe](https://dev.to/ivanzm123/dont-use-enums-in-typescript-they-are-very-dangerous-57bh).


In TypeScript, achieving exhaustive pattern matching involves leveraging the `never` type. By using `never`, TypeScript ensures that a function or switch statement covers all possible input types or values.

### Using `never` in Functions

This is the same example we did in rust:

```typescript
type Coin = "Penny" | "Nickel" | "Dime" | "Quarter";

function valueInCents(shape: Coin): number {
    switch (shape) {
        case "Penny":
            return 1;
        case "Nickel":
            return 5;
        case "Dime":
            return 10;
        case "Quarter":
            return 25;
        default:
            const exhaustiveCheck: never = shape;
            return exhaustiveCheck
    }
}
```

In this function, if a new Coin type is introduced in the future, TypeScript ensures that we handle it explicitly by assigning it to a variable of type `never` (which will give a compile erro). This guarantees exhaustive pattern matching.

Try to add a value to the Coin union or to remove a case in the switch [on the typescript background](https://www.typescriptlang.org/play?ssl=17&ssc=2&pln=1&pc=1#code/C4TwDgpgBAwg9gSwHZQLxQEQAUJKSDKAH0wDkEBjAawgBtCSMARBAWwgcwEUBXAQwBOwCAIwBuAFASAZjyQVgCOCgBufWjwgBJJDFzAAzgAoDACz6QAXLERIAlNaQ9WAIxFQA3hKg+oBgO4IwBSmUCbmkHae3r6xFHwG0Ni4+BiWMbGZUAIQwDwCKACMklk+8YlklDT06aWZOXkFUACsJaXlSSzsaRl12bn5RQAMbVkd3PxCIj19vg2DUABMrb2xACYQ0nw8tMC1s1AUygbAUBAAHuY8JwgqEDCmENSOEHcCaH4REKN9800XVxudweTyovQAvhJIRIgA), you will see the compiler complaining.


### Using `never` in Switch Statements

Similarly, we can achieve exhaustive pattern matching using `never` in switch statements:

```typescript
type Coin = "Penny" | "Nickel" | "Dime" | "Quarter";

function myFunction(shape: Coin): number {
    
    let value = 0;
    switch (shape) {
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
            const exhaustiveCheck: never = shape;
            value = exhaustiveCheck
    }
}
```

This will also return an error in case you forget a `break`.

Try to remove a break in the [typescript backtround](https://www.typescriptlang.org/play?ssl=23&ssc=2&pln=1&pc=1#code/C4TwDgpgBAwg9gSwHZQLxQEQAUJKSDKAH0wDkEBjAawgBtCSMARBAWwgcwEUBXAQwBOwCAIwBuAFASAZjyQVgCOClYgAYnIVKkACgDOACz6QAXLERIAlGaQ9WAIxFQA3hKjuobj7QjAoANz5aHmh0AAZJDyg9AHcEYAoDKH0jSEsXLyj3Cj49aGxcfAwTTKyowOCIdABGSLKs+wEIPio6spy8skoaehL6rIqQ9ABWNv6oRubW0qiO-JZ2Ypn6waqoaojlssmWsdnc-N5BYVE+8fdV9AAmUa2Gpt27gBMIaT4eWmAz84plPT8IAAPIw8f4IfwQGAGCDUGwQCECNDRVIQPYrIIhJFAkFgiFQmFUUoAXwkJIkQA).

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
Anyway, My personal opinion is that the pattern matching in typescript  right now, in terms of ergonomics, is  very far from the one you got in languages like Rust.  Such a foundamental things should be part of the language, so I'm really looking forward for the pattern matching proposal.
But don't wait for it, us it now! with ts-pattern or with never.
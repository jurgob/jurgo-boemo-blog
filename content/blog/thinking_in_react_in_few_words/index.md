---
  slug: "/posts/thinking_in_react_in_few_words/"
  date: 2025-06-21 20:55
  title: "Thinking in React in few words"
  draft: false
  description: "In an era dominated by AI agents and vibecoding, mastering the fundamentals has never been more important. That's why I created my own version of 'Thinking in React' and the Tic Tac Toe tutorial, shorter, easier, with Typescript and slot machines."
  categories: []
  keywords: []
---


# Thinking in React

In an era dominated by AI agents and vibecoding, mastering the fundamentals has never been more important. That's why I created my own version of [Thinking in React](https://react.dev/learn/thinking-in-react) and the [Tic Tac Toe](https://react.dev/learn/tutorial-tic-tac-toe) tutorial - shorter, easier, with Typescript and slot machines.

Find my code [here](https://stackblitz.com/edit/vitejs-vite-6q5ngvmj?file=README.md)

---

## The "Minimal State" Principle

There’s a core idea in [Thinking in React](https://react.dev/learn/thinking-in-react) that’s both crucial and often misunderstood: **Find the minimal but complete representation of UI state**.
Everyone agrees with this in principle, yet I see many developers struggling in practice. 

Let’s look at an example. Suppose you want a `User` type with `birthDate` and `age`:

```ts
type User = {
  birthDate: string,
  age: number
}
```

You might write:

```ts
const user: User = {
  birthDate: "2022/11/21",
  age: 2
}
```

This is incorrect. The problem is that `birthDate` and `age` must stay in sync — and that's fragile..

### A Better Approach

Instead, compute `age` from `birthDate`:

```ts
function ageFromDate(dateString: string){
    const birth = new Date(dateString);
    const today = new Date();
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    // Adjust age if birthday hasn't occurred this year yet
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
}

const person = {
  birthDate: "2022/11/21",
  
  get age(): number {
    return ageFromDate(this.birthDate)
  }
};
```

> 💡 If you’re not familiar with JavaScript getters, [check them out here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get).

You could write an OOP version of this, but the point is clear: **`age` should not be stored — it’s derived from `birthDate`.**

---

## The React Tic Tac Toe Challenge

Now that we understand minimal state, let’s bring that into React.

Where do you store state in React? If you're not using an external state manager, you use the `useState` hook.

Here’s the challenge:  
**How many `useState` hooks do you need to implement Tic Tac Toe?**

The answer: **Only one — and not the one you're probably thinking.**

> 🧠 Want to try it yourself? Or check out the full [Tic Tac Toe tutorial](https://react.dev/learn/tutorial-tic-tac-toe) for a more patient explanation.

But if you're like me and want the fast version:

```ts
  const initialMovesHistory: Move[] = [];
  const [movesHistory, setMoveHistory] = useState(initialMovesHistory);
```

That’s it! The only state you need is the **history of moves** for the current game.  
[Check the code here](https://stackblitz.com/edit/vitejs-vite-6q5ngvmj) (open [App.tsx](https://stackblitz.com/edit/vitejs-vite-6q5ngvmj?file=src%2FApp.tsx)) and see the magic in action.

---


### Defining Types

Here’s what we’re working with:

```ts
type Player = 'x' | 'o';
type Move = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 ;
type GameHistory = Move[];
```

- A `Player` can be `'x'` or `'o'`. Nothing to see here.
- A `Move` is just a grid index (0–8). 
- A `GameHistory` is a list of moves.

### But Who Made the Move?

You might wonder:  
> Why am I not storing the player in the `Move`?

Because you can **derive** it. If `'x'` always starts first, then:

- Even-indexed moves in the history (`0, 2, 4, …`) belong to `'x'`.
- Odd-indexed moves (`1, 3, 5, …`) belong to `'o'`.

```ts
function getPlayerFromMoveIndex(movesHistoryLength: number): Player {
  return movesHistoryLength % 2 === 0 ? 'x' : 'o';
}
```

---


## Determining Game Status

The next derived value is the **game status**. Here’s how:

```ts
const winningCombinations: Move[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 4, 8],
  [2, 4, 6],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
] as const;

type GameStatus =
  | {
      status: 'inprogress';
      player: Player;
    }
  | {
      status: 'ended:tie';
    }
  | {
      status: 'ended:won';
      player: Player;
    };

function gameStatus(movesHistory: GameHistory): GameStatus {
  const hlen = movesHistory.length;
  for (const [a, b, c] of winningComps) {
    const aPlayer = getPlayerForSquare(a, movesHistory);
    if (aPlayer) {
      const bPlayer = getPlayerForSquare(b, movesHistory);
      const cPlayer = getPlayerForSquare(c, movesHistory);
      if (aPlayer == bPlayer && bPlayer === cPlayer) {
        return {
          status: 'ended:won',
          player: aPlayer,
        };
      }
    }
  }

  if (hlen >= GRID_SIZE) {
    return {
      status: 'ended:tie',
    };
  }
  return {
    status: 'inprogress',
    player: getPlayerFromMoveIndex(hlen),
  };
}
```

From just the `movesHistory` and a set of `winningCombinations`, you can fully determine:

- Whether the game is still in progress.
- If it ended in a tie.
- If someone won — and who they are.

---

## That’s All, Folks!

Everything else is glue code and some CSS. Again, [check the full code here](https://stackblitz.com/edit/vitejs-vite-6q5ngvmj?file=README.md,src%2FApp.tsx) if you're curious.


## A Note on Performance

You might be concerned about performance — but in most real apps, bottlenecks come from side effects like:

- HTTP requests
- Local storage access
- Expensive re-renders

Don’t prematurely optimize.

> 🧙 Want to become a React performance wizard?  
Make sure you understand **React’s compiler** and **memoization** first.




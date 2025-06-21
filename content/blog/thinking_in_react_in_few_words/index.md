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

In an era dominated by AI agents and vibecoding, mastering the fundamentals has never been more important. That's why I created my own version of [Thinking in React](https://react.dev/learn/thinking-in-react) and the [Tic Tac Toe](https://react.dev/learn/tutorial-tic-tac-toe) tutorial, shorter, easier, with Typescript and slot machines.

Find my code [here](https://stackblitz.com/edit/vitejs-vite-6q5ngvmj?file=README.md)

---

## The "Minimal State" Affair

There's a concept in [Thinking in React](https://react.dev/learn/thinking-in-react) that I think is super important and hard to achieve: **Find the minimal but complete representation of UI state** 
Everyone agrees with this in principle, yet I see everyone failing. Let's do an example, you want to make a type `user` which have dateOfBirth and the current age. the type is: 

```ts
type User = {
  birthDate: string,
  age: number
}
```

you may start doing something like: 

```ts
const user: User ={
  birthDate: "2022/11/21",
  age: 2
}
```
this is so wrong I don't even know where to start. But anyway, the problem is that you have to keep in sync `birthDate`  and `age`.

A better approach is: 


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

If you don't know what are js getter [check here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get). You could do an OOP version of this, but I hope the point is clear: `age` is not something you store and update anything, it is a value derived from `birthDate`.

## The React Tic Tac Toe challenge

Now that you know what is a minimal state, let's think about React. Where do you put the state in React? basically, if you are not using any state manager, you are gonna put it in the hook useState. 
Now, Let's tackle this challenge: how many useState do you need to implement a Tic Tac Toe? The answer is: "only one and not the one you are probably thinking". 

Now maybe you want to take a break and try to do it by yourself, or you want to read the the [Tic Tac Toe tutorial](https://react.dev/learn/tutorial-tic-tac-toe)  where people with much more patience then me is explaining you step-by-step the thought process you can follow. 

But here is the response for impatient guys like me: 
```ts
  const initialMovesHistory: Move[] = [];
  const [movesHistory, setMoveHistory] = useState(initialMovesHistory);
```
the only thing you need is the history of the moves done for the current name. I swear!. check the code [here](https://stackblitz.com/edit/vitejs-vite-6q5ngvmj?file=src%2FApp.tsx), open the [App.tsx](https://stackblitz.com/edit/vitejs-vite-6q5ngvmj?file=src%2FApp.tsx) file and see the magic. How is it possible?


### Some Types

the reality is that you can derive anything else. but first some types: 

```ts
type Player = 'x' | 'o';
type Move = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 ;
type GameHistory = Move[];

```

a Player can be `x` or `o`. nothing to see here
a `Move` is just someone that selected a grid, so a move is basically a grid index
a `GameHistory` is a list of moves.

### what player did the move?

now you may ask yourself: "why I'm not storing in the Move what player did that move?" the response is that you can derive that. assuming x is the player that it is always gonna start, you know that the moves in history which have an even index are done by `x`, the odd indexes are `o` moves. here is the function:

```ts
function getPlayerFromMoveIndex(movesHistoryLength: number): Player {
  return movesHistoryLength % 2 === 0 ? 'x' : 'o';
}
```

### how do I get the game status? 

The other thing you may find hard to derive is the game status. but also for that you just need the history. here is the code: 

```ts
const winningComps: Move[][] = [
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

basically from the history, and a set of winning configuration (`winningComps`), at every step you can check if someone won, if someone won then you can know what player did those moves using `getPlayerForSquare`. the rest are simple checks you can understand from the code above. 

That's all Folks, the rest of the code is just glue code and some css,again, [check the full code here](https://stackblitz.com/edit/vitejs-vite-6q5ngvmj?file=README.md,src%2FApp.tsx).

## About performance

Reading about this solution you may have some concern regarding the performance of this code. Typically your bottleneck will be in some side effect (http network requests, accessing the local storage, etc...). Don't try to optimize problem you don't have. If you still really want to become an optimization wizard, then be sure you know `how the React compiler works`  and `what is memoization` first.




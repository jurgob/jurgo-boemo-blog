---
  slug: "/posts/redis-for-a-high-concurrency-reservation-system/"
  date: 2026-09-18 00:01
  title: "Redis for a High-Concurrency Reservation System"
  draft: false
  description: "Redis for a High-Concurrency Reservation System"
  categories: ["Redis", "NodeJS"]
  keywords: ["Redis", "NodeJS", "Concurrency", "TypeScript"]
---

Knowing your database's primitives isn't optional trivia — your app's state lives inside them. If you don't understand what a database actually guarantees, you can't know what your code is silently relying on.

## The Problem we are solving


<div class="callout-yellow">

We want to design and develop the REST API service that will manage the event seat
reservations of our new application.

The service is required to expose the following endpoints:

- Create an event.
  An event consists of several seats. The total number of seats is required to create the event
  and it could be anything between 10 and 1,000 (included).
- Hold a particular seat.
  Users can “Hold” a seat for a limited amount of time. This is particularly useful when other
  parts of the system are, for example, completing the confirmation flow and payment.
  In order to Hold a seat, your system will require the user identifier. For this exercise, the user
  will simply be identified by an UUID.
  A user can hold a seat for a configured maximum time of seconds, after which the seat will
  become available to other users. You can default this to 60 seconds.
- Reserve a particular seat.
  A user can complete the reservation of a seat, only if the user is “Holding” the relevant seat.
  After the reservation, this seat becomes permanently assigned to the user.
- List available seats for a given event.
  The list of available seats should only include the seats that are not “On Hold” and not yet fully
  Reserved.

Additional Points

- Limit the number of seats a given user can hold in one event.
- Add an endpoint to “refresh” a Hold on a seat.

</div>

## The naive way: same client, plain keys

Every snippet below — naive and final — uses the same client: [node-redis](https://github.com/redis/node-redis) (`redis` on npm), the standard TypeScript client for Redis. What changes is which primitives we ask it for.

```ts
async function createEvent(totalSeats: number) {
  const eventId = `evt-${randomUUID()}`
  await redisClient.set(`event:${eventId}:totalSeats`, totalSeats)
  return { eventId }
}

async function holdSeat(eventId: string, seatIndex: number, userId: string) {
  const seatKey = `seat:${eventId}:${seatIndex}`
  const existing = await redisClient.get(seatKey)
  if (existing) throw new Error("Seat is already held or reserved")
  await redisClient.set(seatKey, userId)
  await redisClient.expire(seatKey, 60)
}

async function reserveSeat(eventId: string, seatIndex: number, userId: string) {
  const seatKey = `seat:${eventId}:${seatIndex}`
  const holder = await redisClient.get(seatKey)
  if (holder !== userId) throw new Error("Seat is not held by user")
  await redisClient.set(seatKey, userId) // SET with no TTL clears the earlier EXPIRE — permanent
}

async function getAvailableSeats(eventId: string) {
  const totalSeats = Number(await redisClient.get(`event:${eventId}:totalSeats`))
  const available: number[] = []
  for (let seatIndex = 1; seatIndex <= totalSeats; seatIndex++) {
    const holder = await redisClient.get(`seat:${eventId}:${seatIndex}`)
    if (!holder) available.push(seatIndex)
  }
  return available
}
```

Still Redis, still the same client — just `GET`/`SET`/`EXPIRE` on plain string keys. It works if you test it without thinking about race conditions — you might even ship it and never notice, because without concurrency tests or metrics you rarely catch concurrency bugs in the wild. Here's how it breaks:

- Two users call `holdSeat` on the same seat at the same instant — both `get` see the seat as free, both `set` succeed, and the second write silently overwrites the first. Both users now believe they hold the same seat.
- The process crashes (or throws) between `set` and `expire` — the seat is held forever, with no TTL left to ever release it.
- `getAvailableSeats` has to loop and `GET` every seat one by one — there's no primitive here for "give me all the seats of this event at once", and nothing stops a seat from changing state mid-scan.

#### Redis primitives used

| Redis primitive | TS client method | Description |
|---|---|---|
| [`GET`](https://redis.io/docs/latest/commands/get/) | [`redisClient.get()`](https://github.com/redis/node-redis/tree/master#redis-commands) | Read a plain string key |
| [`SET`](https://redis.io/docs/latest/commands/set/) | [`redisClient.set()`](https://github.com/redis/node-redis/tree/master#redis-commands) | Write a plain string key |
| [`EXPIRE`](https://redis.io/docs/latest/commands/expire/) | [`redisClient.expire()`](https://github.com/redis/node-redis/tree/master#redis-commands) | Set a TTL on a whole key |

## My implementation

[github.com/jurgob/reservation-system](https://github.com/jurgob/reservation-system) — one Redis hash per event, seat number as field, `userId` as value.

We need to use more advanced Redis primitives, and understand them.

#### Redis primitives we are gonna use

| Redis primitive | TS client method | Description |
|---|---|---|
| [`HSET`](https://redis.io/docs/latest/commands/hset/) | [`redisClient.hSet()`](https://github.com/redis/node-redis/tree/master#redis-commands) | Write a field inside a hash — if it already exists, it overrides it |
| [`HGET`](https://redis.io/docs/latest/commands/hget/) | [`redisClient.hGet()`](https://github.com/redis/node-redis/tree/master#redis-commands) | Read one field from a hash |
| [`HGETALL`](https://redis.io/docs/latest/commands/hgetall/) | [`redisClient.hGetAll()`](https://github.com/redis/node-redis/tree/master#redis-commands) | Read every field of a hash |
| [`HKEYS`](https://redis.io/docs/latest/commands/hkeys/) | [`redisClient.hKeys()`](https://github.com/redis/node-redis/tree/master#redis-commands) | List the field names of a hash |
| [`HSETNX`](https://redis.io/docs/latest/commands/hsetnx/) | [`redisClient.hSetNX()`](https://github.com/redis/node-redis/tree/master#redis-commands) | Write a hash field only if it doesn't exist yet — atomic check-and-set |
| [`HEXPIRE`](https://redis.io/docs/latest/commands/hexpire/) | [`redisClient.hExpire()`](https://github.com/redis/node-redis/tree/master#redis-commands) | Set a TTL on a single hash field, with `NX`/`XX`/`GT`/`LT` flags |
| [`MULTI`](https://redis.io/docs/latest/commands/multi/)/[`EXEC`](https://redis.io/docs/latest/commands/exec/) | [`redisClient.multi().exec()`](https://github.com/redis/node-redis/tree/master#transactions-multiexec) | Queue commands and run them as one atomic block |

### holdSeat — atomic claim + expiry

[reservations_client.ts#L50-L76](https://github.com/jurgob/reservation-system/blob/main/src/reservations_client.ts#L50-L76)

```ts
const holdSeat = async (eventId: EventId, userId: UserId, seatIndex: SeatNumber, holdSeatExpiration?:HoldSeatExpiration|undefined) => {
    holdSeatExpiration = HoldSeatExpiration.parse(holdSeatExpiration);
    const seatKey = seatIndex.toString()
    const hashKey = eventId+":seats"
    await getEvent(eventId);
    /* there are 3 possible way to limit a user to have n max seats.
      1. use a separate hash per user -> this is more performante but it will require more memory
      2. inside the transation, count the keys that have the user id value -> this is the more correct, but the less performant (the transaction will block the hash for more time)
      3. do like the point 2, but before the transaction -> this is the middle ground, is not an issue give that the hash can have no more then 1000 keys, also in some edge case the user could be able to require more then n seat, but I thing is the best trade off in this case
    */

    const hash = await redisClient.hGetAll(hashKey);
    const userSeatsCount = Object.values(hash).filter(value => value === userId).length;

    if((userSeatsCount+1) > props.userMaxSeats){
        throw new Error("User has already the maximum number of seats")
    }


    const transaction = redisClient.multi();
    transaction.hSetNX(hashKey, seatKey, userId);
    transaction.hExpire(hashKey,seatKey, holdSeatExpiration, "NX");
    const transactionResult =  await transaction.exec();
    const holdResult =  transactionResult[0];
    if(!holdResult)
        throw new Error("Seat is already held")
}
```

`HSETNX` only sets the field if it's empty; wrapping it in `MULTI`/`EXEC` means no other client can slot in between the set and the expiry.

### refreshHoldSeat — extend, never shrink

[reservations_client.ts#L78-L91](https://github.com/jurgob/reservation-system/blob/main/src/reservations_client.ts#L78-L91)

```ts
const refreshHoldSeat = async (eventId: EventId, userId: UserId, seatIndex: SeatNumber, holdSeatExpiration?:HoldSeatExpiration|undefined) => {
    holdSeatExpiration = HoldSeatExpiration.parse(holdSeatExpiration);
    const seatKey = seatIndex.toString()
    const hashKey = eventId+":seats"
    const holdSeat = await redisClient.hGet(hashKey, seatKey);
    if(typeof holdSeat !== "string" ||holdSeat !== userId){
        throw new Error("Seat is not held by user")
    }

    const [expireResult] = await redisClient.hExpire(hashKey,seatKey, holdSeatExpiration, "GT");
    if(expireResult === 0){
        throw new Error("Seat has already expired")
    }
}
```

`GT` only applies the new TTL if it's *greater* than the current one — a refresh can't accidentally shorten a hold.

### reserveSeat — turn the hold permanent

[reservations_client.ts#L93-L103](https://github.com/jurgob/reservation-system/blob/main/src/reservations_client.ts#L93-L103)

```ts
const reserveSeat = async (eventId: EventId, userId: UserId, seatIndex:SeatNumber) => {
    const seatKey = seatIndex.toString()
    const hashKey = eventId+":seats"
    const holdSeat = await redisClient.hGet(hashKey, seatKey);
    if(typeof holdSeat !== "string" ||holdSeat !== userId){
        throw new Error("Seat is not held by user")
    }
    await redisClient.hExpire(hashKey,seatKey, HOLD_SEAT_EXPIRATION_DONOT_EXPIRE, "XX");
    // await redisClient.hPersist(hashKey, seatKey);

}
```

A "permanent" reservation is a TTL of 100 years, not `PERSIST` — that keeps the field lockable by `HSETNX` for the whole hold/reserve lifecycle.

### getAvailableSeats

[reservations_client.ts#L112-L120](https://github.com/jurgob/reservation-system/blob/main/src/reservations_client.ts#L112-L120)

```ts
const getAvailableSeats = async (eventId: EventId): Promise<SeatNumber[]> => {
    const totalSeatsString = await redisClient.hGet(eventId, "totalSeats");
    const totalSeats = SeatCounter.parse(parseInt(totalSeatsString||""));
    const hashKey = eventId+":seats"
    const seatsNotAvailable = await redisClient.hKeys(hashKey);
    const potentialAvailableSeatch = Array.from({"length": totalSeats}, (_,i) => `${i+1}`)
    return potentialAvailableSeatch.filter(seat => !seatsNotAvailable.includes(seat)).map(seat => SeatNumber.parse(seat));

}
```

## The tests that prove the point

### The basic race

[reservations_client.integration.test.ts#L160-L170](https://github.com/jurgob/reservation-system/blob/main/src/reservations_client.integration.test.ts#L160-L170):

```ts
it('if userA hold a seat, userB hold attemp should fail', async () => {
  await reservationsClient.holdSeat(eventId, userAId, seatNumber)
  const secondHoldSeatPromise = reservationsClient.holdSeat(eventId, userBId, seatNumber)
  await expect(secondHoldSeatPromise).rejects.toThrow()
})
```

This is exactly the race the naive `GET`/`SET` version couldn't prevent.

### Refreshing actually extends the hold

[reservations_client.integration.test.ts#L224-L247](https://github.com/jurgob/reservation-system/blob/main/src/reservations_client.integration.test.ts#L224-L247):

```ts
await reservationsClient.holdSeat(eventId, userAId, seatNumber, /* 1s */ seatHoldExpirationSeconds)
await reservationsClient.refreshHoldSeat(eventId, userAId, seatNumber, /* 3s */ seatRefreshHoldExpirationSeconds)

// userB tries to hold the same seat before the refreshed TTL — must still fail
const userBHoldFail = await reservationsClient.holdSeat(eventId, userBId, seatNumber, seatHoldExpirationSeconds)
  .catch(e => "userBHoldFail")
expect(userBHoldFail).toBe("userBHoldFail")
```

Without `GT`, a refresh could accidentally *shorten* a hold instead of extending it. This test proves the seat is still locked well past the original 1-second expiry, because the refresh bumped it to 3.

### Why `reserveSeat` uses a 100-year TTL instead of `PERSIST`

[reservations_client.integration.test.ts#L269-L291](https://github.com/jurgob/reservation-system/blob/main/src/reservations_client.integration.test.ts#L269-L291):

```ts
await reservationsClient.holdSeat(eventId, userAId, seatNumber, /* 10s */ seatHoldExpirationSeconds)
await reservationsClient.reserveSeat(eventId, userAId, seatNumber)

// userB tries to hold the now-reserved seat with a 1s TTL — fails
const fail = await reservationsClient.holdSeat(eventId, userBId, seatNumber, /* 1s */ seatHoldExpirationUserBSeconds)
  .catch(e => "userbfail")

// wait past userB's *would-be* TTL...
await sleep(seatHoldExpirationUserBSeconds + 1)

// ...the seat is still reserved by userA, not silently released
await expect(reservationsClient.getEventSeat(eventId, seatNumber)).resolves.toBe(userAId)
```

This is the test that justifies the 100-year-TTL trick. `holdSeat`'s `HEXPIRE ... NX` only sets a TTL if the field doesn't already have one. If `reserveSeat` had used `PERSIST` instead, the field would have *no* TTL after reservation — so userB's failed `holdSeat` could still sneak its own 1-second TTL onto that field via the `NX` check succeeding, and the reservation would silently expire a second later. Because the field already carries a 100-year TTL, userB's `NX` check finds one already there and no-ops, and userA's reservation survives.

## Why not just one Lua script?

I could've written `holdSeat`/`reserveSeat`/`refreshHoldSeat` each as a single Lua script — fully atomic, one round trip, no client-side race window at all (`reserveSeat` currently does `HGET` then `HEXPIRE` as two calls, which I accept as an acceptable risk — see the design doc).

I didn't, on purpose: the point of this exercise was to show I understand the *distinct* Redis primitives (`HSETNX`, `HEXPIRE` options, `MULTI`) rather than hide them behind an opaque script.

- **Lua wins on**: true end-to-end atomicity, fewer round trips, no gap to reason about
- **Lua loses on**: harder to unit-test in isolation, logic lives as a string blob instead of typed code, and it's less legible to someone reviewing the decisions I made

Both are valid — pick Lua when the atomicity gap actually matters to your business, pick composable commands when you want the logic visible and testable.

## A note about code coverage

This project is a good example of how test coverage alone is often a useless metric if you're not testing the right things.

<a href="https://app.codecov.io/gh/jurgob/reservation-system" target="_blank" rel="noopener noreferrer">
<img src="https://codecov.io/gh/jurgob/reservation-system/branch/main/graph/badge.svg" alt="codecov" />
</a>

From early on, coverage stayed roughly where it is now — pretty high. But a high percentage doesn't tell you *which* lines are covered — the part that mattered was [`reservations_client.ts`, line 114](https://app.codecov.io/gh/jurgob/reservation-system/blob/main/src%2Freservations_client.ts#L114).

I can tell you, having written this myself: coverage is not an indicator of how many concurrency bugs it actually catches. A line can run green in a test and still race with itself the moment two requests hit it at the same time — the tests above catch that because they were written to provoke the race, not because the lines were "covered." Adding those tests barely moved the coverage number, but it's the difference between useful and useless.

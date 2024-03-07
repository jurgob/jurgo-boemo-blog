---
  slug: "/posts/exhaustive_pattern_matching_in_typeScript/"
  date: 2024-03-07 11:23
  title: "Exploring Utopian Testing Strategies for Node.js REST APIs"
  draft: false
  description: "Exploring Utopian Testing Strategies for Node.js REST APIs using Typescript, Express, MongoDB and the integrated node.js testing suite"
  categories: []
  keywords: ["Typescript", "Testing", "Node.js", "REST API", "MongoDB", "Express"]
---


## TLDR

Writing tests for Node.js REST APIs can be complex due to various challenges:

- End-to-end (E2E) and integration/unit tests often differ despite overlapping.
- E2E tests are slow and prone to flakiness.
- Unit tests sometimes focus on implementation rather than architecture.
- I/O operations, such as database access and spinning up APIs, make E2E tests slow. 

Solutions like using express.listen(0) and in-memory databases can mitigate this issue. Additionally, a subset of these tests can be run periodically against live environments (that's what in Vonage we were calling Smoke Tests).

Check out this [Example Code of a Node.js api integrating this Utopian Testing Strategy](https://github.com/jurgob/nodejs-utopistic-testing-approach)


## Let's talk about testing

Let's discuss some general concepts and problem about testing REST API

### The Testing Problem

The testing landscape for Node.js REST APIs (and REST APIs in general) is fraught with challenges. E2E tests, essential for validating user scenarios, often suffer from slowness and fragility. Conversely, unit tests may not always capture architectural concerns and tend to be implementation-centric. Additionally, the diverse technologies involved in testing further compound the complexity. This is often exacerbated by a culture of siloing developers and SDET, and in general, a lack of consideration of the costs such an approach brings (slowing down refactoring/releases due to extensive test changes can significantly reduce overall quality more than the lack of test coverage).

 
### Understanding The Testing Pyramid

The testing pyramid, with unit tests at the base, followed by integration tests and E2E tests at the apex, is a reflection of testing priorities. However, the pyramid shape also signifies the increasing "cost" associated with tests as we move towards the top. E2E tests, being more user-like, are costly to maintain and slow to execute. Moreover, parallelizing E2E tests can introduce complexities, such as dependencies between test cases. 

Also often Integrated Tests and E2E tests tend to have great overlap but typically teams tend to not take benefit from this, typically because they are mantained by different teams and they are using different technologies (in my previus company we got the unit/integration tests in javascript and the e2e in python as instance).

### Understanding Smoke Tests

Let me introduce the concept of Smoke Test, which is not very well defined across the industry, but in Vonage it had a very specific meaning.
"Smoke tests" refer to periodic E2E tests that validate essential functionalities of the application. These tests are typically run at regular intervals, providing a quick check on the system's health. By prioritizing critical paths, smoke tests offer a balance between efficiency and coverage, complementing the broader testing strategy.
In your tests Testing Pyramid this would be a new level at the apex.


## An Utopian Testing Strategy Proposal. 

It would be great if you could write the tests once and run them both against your real API and on an in-memory version of your API. 
Let's do that: 


### Configuring your app

here is our rest api (and testing) configuration: 
```typescript
import { z } from 'zod'

const envSchema = z.object({
    PORT: z.coerce.number().min(1000).default(3000),
    TEST_API_URL: z.string().url().optional(),//if empty, the test will use an inmemory-mock server
    MONGO_URL: z.string().url().optional(),// if empty, the express server will use an inmemory-mock mongodb version
    MONGO_DB_NAME: z.string().max(50).optional(),
});

const env = envSchema.parse(process.env)

console.log(`NODE_ENV: `,process.env.NODE_ENV);
console.log(`TEST_API_URL: `,env.TEST_API_URL);

export default env

```

I think this is self explenatory


### Giving your api the ability to run with an inmemory MongoDB

I chose MongoDB for simplicity; this can work with every type of DB that has an in-memory version (as far as I know, Postgres and CouchDB have that).
Here is what the dbClient looks like:




### Having a dedicated rest api

Assuming I've implemented a `createApp` function which returns an Express app, I can create a test utility:

```typescript
import {createApp} from '../server';
import { Server } from "http";

import { AddressInfo } from 'node:net';
import env from '../env';
export async function createMockServer() {
    let server:Server|undefined = undefined
    let intUrl = undefined
    if(!env.TEST_API_URL){
        const app = await createApp()
        server = app.listen(0); // this will open the server on a random ephimeral port
        const address = server.address() as AddressInfo;
        server.on('close', () => {
            app.emit('close');
        });
        intUrl = `http://localhost:${address.port}`
    }else {
        intUrl = env.TEST_API_URL
    }
    
    const url: string = intUrl
    return {
        url,
        close: () => {
            if(server)
                server.close()
        }
    }
}
```

Basically, if the `TEST_API_URL` environment variable is not set, it will create a mock server and return the URL. The `close()` function needs to be called at the end of your test. If you are setting `TEST_API_URL`, then this function will just return that, and the `close()` function will not do anything.

Here is how a test looks like:

```typescript
test('endpoint /users', async () => assert.doesNotReject(async () => {
    const {url,close } = await createMockServer();
    const res = await axios({
        baseURL: `${url}`,
        url: '/users',
        method: 'post',
        data: {
            name: 'test',
            email: 'test@email.com',   
        }
    });
    const {_id, ...data} = res.data;

    assert.deepStrictEqual(res.status, 201, 'Unexpected status code from POST /users endpoint');
    assert.deepEqual(data, {
        name: 'test',
        email: 'test@email.com',
    }, 'Unexpected response from POST /users endpoint');
    assert.ok(_id, 'Expected _id to be defined');

    close();
}));
```

### Using an in-memory version of your db

Similarly to the REST API, inside the dbClient, you can check if the `MONGO_URL` is set. If not, you will use the in-memory version (so every "ephemeral API" will have a dedicated in-memory DB):


```typescript
import {MongoClient} from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import env from './env';
type User= {
  name: string;
  email: string;
}
export async function  createDBClient(){
  let mongoServer:MongoMemoryServer|undefined =undefined;
  let mongo_db_name: string| undefined = undefined;
  let mongo_url: string| undefined = undefined;
  if(!env.MONGO_URL){
    mongoServer = await MongoMemoryServer.create()
    mongo_db_name = `db_${Math.random().toString(36).substring(7)}`;
    mongo_url = mongoServer.getUri()+`  /${mongo_db_name}`
  }else {
    if(!env.MONGO_DB_NAME){
      throw new Error('MONGO_DB_NAME is required when using a real mongodb server (aka when MONGO_URL is defined)');
    }
    mongo_url = `${env.MONGO_URL}/${env.MONGO_DB_NAME}`;
    mongo_db_name = env.MONGO_DB_NAME;
  }  
  const db = new MongoClient(mongo_url);
  const collectionUsers = db.db(mongo_db_name).collection<User>('users');
  const disconnect = async () => {
    await db.close();   
    if(mongoServer)
      await mongoServer.stop();
  }
  const createUser = async (user:User) => {
    const {insertedId} = await collectionUsers.insertOne(user);
    const newUser = await collectionUsers.findOne({_id: insertedId});
    return newUser;
    
  }
  return {
    disconnect,
    createUser
  }
}
```

### how to run this

Here is the script section of your `package.json` file:

```json
    {
        // the rest of your package.json file config....
        "script": {
            "dev": "tsx watch --env-file=.env src/index.ts",
            "test": "node --env-file=.env.test  --import tsx --test src/**/*.test.ts",
            "test:smoke:createuser": "node --env-file=.env.test.smokes  --import tsx --test src/test_e2e/createuser.smoke.test.ts",
            "test:w": "node --env-file=.env.test --import tsx --test --watch  src/**/*.test.ts",
        }
    }
```

Here is the content of the `.env` files (this is used to run the REST API, I'm spinning up MongoDB with Docker locally. Check the [example readme](https://github.com/jurgob/nodejs-utopistic-testing-approach)):

```bash
PORT=3000
MONGO_URL=mongodb://root:secret@localhost:27017
MONGO_DB_NAME=admin%
```

here is the content of the `.env.test` files:
```bash
# this is empty!
```

here is the content of the `.env.test.smokes` files ( I just need to set the `TEST_API_URL`):
```bash
TEST_API_URL="http://localhost:3000"
```


## Why I call this "Utopian"

First of all, even if I called this "Utopian", it does not solve all the problems. Testing race conditions is one such issue. (Even though if you attach stats on your smoke tests, it can give you some indication of those.) But if you could write just one type of test, it should be this one. 

What you should keep in mind is that testing is just one factor of quality; others include metrics, alerts, type systems, linters (if you believe in them), and software design.

Anyway, I call this a "Utopia" because it is very difficult to achieve. Typical problems include:
- Not all frameworks of Node.js support listening to ephemeral ports.
- Not all databases provide an in-memory version.
- You may have external dependencies that are very complicated to mock.

## Conclusion

Achieving high-quality software involves a delicate balance between various factors, including code quality, test coverage, duplication of effort, metrics, mean time to recovery (MTTR), and refactoring time. By adopting utopian testing strategies, such as incorporating smoke tests, re-evaluating the testing pyramid, and optimizing test execution, developers can navigate the complexities of testing Node.js REST APIs more effectively. This approach fosters meaningful insights, driving continuous improvement and enhancing overall software quality.
Check out this [Example Code of a Node.js API integrating this Utopian Testing Strategy](https://github.com/jurgob/nodejs-utopistic-testing-approach)
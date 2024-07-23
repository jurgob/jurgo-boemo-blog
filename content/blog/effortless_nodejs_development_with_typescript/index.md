---
  slug: "/posts/effortless_nodejs_development_with_typescript/"
  date: 2024-07-23 16:37
  title: "Effortless Node.js Development with TypeScript: A Zero-Configuration Guide"
  draft: false
  description: "This guide provides a straightforward approach to setting up a Node.js project with TypeScript, without the need for complex configurations. By taking advantage of the latest Node.js features like watch mode, the built-in test runner, and the assert library, this setup minimizes dependencies while ensuring a smooth and efficient development experience. Follow step-by-step instructions to initialize your project, integrate TypeScript, set up Git, and add testing capabilities."
  categories: []
  keywords: []
---

This guide provides a straightforward approach to setting up a Node.js project with TypeScript, without the need for complex configurations. By taking advantage of the latest Node.js features like watch mode, the built-in test runner, and the assert library, this setup minimizes dependencies while ensuring a smooth and efficient development experience. Follow step-by-step instructions to initialize your project, integrate TypeScript, set up Git, and add testing capabilities.


# TLDR

for the more impatients, just here is the [source code](https://github.com/jurgob/boilerplate_node_typescript). Just go there and follow the README.


# Scaffolding a Node.js Project with TypeScript with No Configuration

Creating a Node.js project with TypeScript without the hassle of complex configurations can be streamlined with the following steps. This guide walks you through setting up a boilerplate project that includes TypeScript support, automatic type checking, and testing.

## Prerequisites

Before we start, install `fnm` (Fast Node Manager) and use it to install Node.js version 20:

```bash
fnm install v20.15.1
```

## Initialize the Node.js Project

1. Create a new directory for your project and navigate into it:

    ```bash
    mkdir boilerplate_node_typescript
    cd boilerplate_node_typescript
    ```

2. Initialize a new Node.js project:

    ```bash
    npm init
    ```

3. (Optional) If you are using `fnm` or `nvm`, set the Node.js version for the project:

    ```bash
    node -v > .nvmrc
    ```

    Now, every time you navigate into the project directory, the Node.js version will be set automatically.

## Set Up Git

1. Initialize a new Git repository:

    ```bash
    git init
    ```

2. Create a `.gitignore` file:

    ```bash
    touch .gitignore
    ```

3. Add the following lines to `.gitignore` to exclude the `node_modules` and `dist` directories:

    ```gitignore
    node_modules/*
    dist/*
    ```

## Install TypeScript

1. Install TypeScript and `tsx` (a tool for running TypeScript files directly):

    ```bash
    npm i -D typescript tsx
    ```

2. Create a `src` directory and an entry file:

    ```bash
    mkdir src
    touch src/index.ts
    ```

## Update `package.json`

Add the following scripts to your `package.json` file:

```json
{
  "main": "dist/index.js",
  "scripts": {
    "dev": "node --import=tsx --watch --no-warnings src/index.ts",
    "build": "tsc src/index.ts --outDir dist",
    "typecheck": "tsc src/index.ts --noEmit",
    "typecheck:watch": "tsc src/index.ts --noEmit --watch",
    "start": "node dist/index.js"
  }
}
```

## Add Some Code

1. Create a `sum.ts` file:

    ```bash
    touch src/sum.ts
    ```

2. Add the following code to `src/sum.ts`:

    ```typescript
    export function sum(a: number, b: number): number {
      return a + b;
    }
    ```

3. Update `src/index.ts` to use the `sum` function:

    ```typescript
    import { sum } from './sum';

    console.log(sum(1, 2));
    ```

4. Run the development script to see your code in action:

    ```bash
    npm run dev
    ```

    This script will watch for changes and reload automatically.

5. You can also build and start the project:

    ```bash
    npm run build
    npm start
    ```

## Add Type Checking

While `tsx` is great for development, it doesn't report type errors. Use TypeScript's `tsc` for type checking:

1. Add a typecheck script to `package.json` (already added above):

    ```json
    "scripts": {
      "typecheck": "tsc src/index.ts --noEmit",
      "typecheck:watch": "tsc src/index.ts --noEmit --watch"
    }
    ```

2. Run the type checking script:

    ```bash
    npm run typecheck
    ```

## Add Tests

1. Install `@types/node` for TypeScript support in Node.js:

    ```bash
    npm i -D @types/node
    ```

2. Create a test file:

    ```bash
    touch src/sum.test.ts
    ```

3. Add the following code to `src/sum.test.ts`:

    ```typescript
    import { sum } from './sum';
    import { test } from 'node:test';
    import { strictEqual } from 'node:assert';

    test('sum(1, 2) equals 3', () => {
      strictEqual(sum(1, 2), 3);
    });
    ```

4. Add test scripts to `package.json`:

    ```json
    "scripts": {
      "test": "node --import=tsx --test src/**/*.test.ts",
      "test:watch": "node --import=tsx --test --watch src/**/*.test.ts"
    }
    ```

5. Run the tests:

    ```bash
    npm test
    ```

## Work in a Reactive Environment

For an efficient development workflow, open three terminals and run:

1. Terminal 1: Development mode

    ```bash
    npm run dev
    ```

2. Terminal 2: Type checking

    ```bash
    npm run typecheck:watch
    ```

3. Terminal 3: Testing

    ```bash
    npm run test:watch
    ```

You are done! This setup provides a simple and effective way to scaffold a Node.js project with TypeScript without any complex configuration. Enjoy coding!


## Bonus: adding test coverage.

We can use tools like `nyc` to make our life much easier. 

install nyc: 

```bash
npm i -D nyc
```


then modify the package.json like this: 

package.json
```
scripts: {
    ...
    "test": "nyc --reporter=html --reporter=text node  --import=tsx --test src/**/*.test.ts",
    ...,
    "coverage": "nyc report --reporter=text --reporter=text-summary",
    "coverage:html": "npx http-server coverage"
}

```

add to your .gitignore the following: 

```
...
.nyc_output/*
coverage/*
```

now, if you run `npm test`, you will see some new information after the test run: 

![](/images/01_run_npm_test.png)


*After* you have runned the test, you will be able to print any time you want several report. 

to run a text based report just run: 

```bash
npm run coverage
```

you will see: 

![](/images/02_npm_run_coverage.png)

or you can run the html report with: 

```bash
npm run coverage:html
```

now if you go at `http://localhost:8000/` from your browser you will see in details the coverage file by file: 


![](/images/03_html_coverage_report.png)


you can even click on a sigle file to check which part of your source code is not covered by your tests:

![](/images/04_html_coverage_report_2.png)


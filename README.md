# Elysia with Puppeteer

## 0. Overview

- [x] Bun 1.0.3 &plus; Elysia (TS)
- [x] EdgeDB
- [x] Docker

## 1. [ElaysiaJS](https://elysiajs.com/introduction.html) 로 REST API 만들기

Refined the code from the previously written [bun-puppeteer-tutorial](https://taejoone.jeju.onl/posts/2023-09-23-bun-puppeteer-tutorial/).

- ElaysiaJS: A framework similar to ExpressJS

### `use` 로 파일 분리하기

Separate files by function such as db, html, puppeteer, and integrate them in `index.ts`.

- [src]
  - index.ts
  - server-movies.ts
  - [lib]
    - error.ts

```ts
import { Elysia, t, NotFoundError } from 'elysia';
import { handleError } from '$lib/error';
import { Browser } from 'puppeteer';
import { app as moviesApp } from './server-movies';

const app = new Elysia()
  // .use(puppeteerApp)
  .use(moviesApp)
  .onError((err) => handleError(err))
  .onStart(async () => {
    console.log('💫 Elysia start!');
  })
  .onStop(async () => {
    console.log('💤 Elysia stop!');
  });

app
  .post('/', () => {
    throw new NotFoundError();
  })
  .get('/hello', () => ({ message: 'Hello Elysia' }))
  .get('/err', () => {
    throw new Error('Server is during maintainance');
  });

```

## 2. EdgeDB Cloud
[EdgeDB](https://www.edgedb.com/) is a next-generation object-relational database built on top of PostgreSQL, designed to simplify data interactions with a schema-centric approach and a powerful query language.

Install the CLI for edgedb
```
curl --proto '=https' --tlsv1.2 -sSf https://sh.edgedb.com | sh
````

* [EdgeDB Quickstart](https://docs.edgedb.com/get-started/quickstart)
* [EdgeDB TypeScript/JS Client](https://docs.edgedb.com/libraries/js#edgedb-js-intro)
&nbsp; <br />
&nbsp; <br />

> **End!** &nbsp;

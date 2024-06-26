# Elysia with Turso, Drizzle, Puppeteer

> Turso is a very fast and affordable Edge (distributed) Database as a Service (DBaaS), based on `libSQL`, an open-source fork of SQLite. Study how to use it with Drizzle ORM.

## 0. Overview

- [x] Bun 1.0.3 &plus; Elysia (TS)
- [x] Turso (SQLite) &plus; Drizzle ORM
- [x] Puppeteer (Naver Place Search List)
- [x] Docker

> Screenshot

<img alt="books insert - elysia html" src="/assets/elysia-drizzle-turso-books-w600.png" width="600px" />

## 1. [Turso](https://turso.tech/)

Turso is a database that provides SQLite in the form of an Edge (distributed) service.

- Fastest: Like a CDN, SQLite replicas are provided from nearby clouds.
- Easiest: Takes advantage of SQLite’s light and simple usage.
- Most affordable: Costs are billed per capacity due to its single-file structure.
  - Starter plan (free) includes 500 databases, up to 9GB, and 3 locations

> Reference Documents

- [Turso - Blog](https://blog.turso.tech/)
  - [Build a poll-making website using SvelteKit, Turso, Drizzle, and deploy it to Vercel.](https://blog.turso.tech/build-a-poll-making-website-using-sveltekit-turso-drizzle-and-deploy-it-to-vercel-eceb37018a2a)
    - [깃허브 - turso-extended/app-at-the-polls](https://github.com/turso-extended/app-at-the-polls)
- [Drizzle - Turso(SQLite)](https://orm.drizzle.team/docs/quick-sqlite/turso)
- [깃허브 - NTAK666/try-bun](https://github.com/NTAK666/try-bun)
  - BETH Stack : Bun + Elysia + Turso + HTMX
- [깃허브 - justinfriebel/sveltekit-turso-drizzle](https://github.com/justinfriebel/sveltekit-turso-drizzle)

### [CLI 설치](https://docs.turso.tech/tutorials/get-started-turso-cli/step-01-installation) 및 [로그인](https://docs.turso.tech/tutorials/get-started-turso-cli/step-02-sign-up)

- Once logged in, there is no need to set the API token as an environment variable.
  - 참고 : [Running remotely](https://docs.turso.tech/reference/turso-cli#running-remotely)

```bash
# macOS
brew install tursodatabase/tap/turso
# Linux or WSL
curl -sSfL https://get.tur.so/install.sh | bash

# Web browser login: account creation
turso auth signup

# Query authentication token
turso auth token
# "token..."

export TURSO_API_TOKEN=[YOUR-TOKEN-STRING]
```

### [Database creation and management](https://docs.turso.tech/tutorials/get-started-turso-cli/step-03-create-database)

- [Turso Dashboard](https://turso.tech/app)
- Remember to create and destroy for DB management
- Normally, manage tables and data via the shell.

```bash
# Create db at default location
turso db create my-db

# Turso SQL shell
turso db shell my-db

turso db show my-db
# Name: my-db
# URL: libsql://[DB-NAME]-[ORG-NAME].turso.io
# Locations: sin (currently only one primary)

turso db tokens create my-db
# "token..."

turso db list

turso db destroy my-db
# Are you sure? [y/n]
```

#### Group and location management

- It seems there is no way to change the primary location. (Closest region in CLI)
- You can add essential regions via settings.

```bash
turso db locations
# nrt  Tokyo, Japan
# hkg  Hong Kong, Hong Kong
# sin  Singapore, Singapore  [default]
# ...

turso group locations add default nrt
# Group default replicated to nrt in 6 seconds.

turso group locationslist default
# nrt, sin (primary)

turso db create --location nrt my-db
# One is created in the primary area (sin), and a copy is created in nrt.

# Additional copy creation
# turso db replicate my-db hkg
```

### [Turso 로컬 개발환경 설정](https://github.com/libsql/sqld/blob/main/docs/BUILD-RUN.md)

The daemon program requires sqld.

```console
# macOS installation
$ brew tap libsql/sqld
$ brew install sqld

# Or Docker
$ docker run -p 8080:8080 -d ghcr.io/libsql/sqld:latest

$ turso dev
sqld listening on port 8080.
Use the following URL to configure your libSQL client SDK for local development:

    http://127.0.0.1:8080
```

Or can be created as a local file.

```console
$ turso dev --db-file book.sqlite
```

## 2. [ElaysiaJS](https://elysiajs.com/introduction.html) 로 REST API 만들기

Refined the code from the previously written [bun-puppeteer-tutorial](https://taejoone.jeju.onl/posts/2023-09-23-bun-puppeteer-tutorial/).

- ElaysiaJS: A framework similar to ExpressJS
- Turso(libSQL)
- Drizzle ORM

### `use` 로 파일 분리하기

Separate files by function such as db, html, puppeteer, and integrate them in `index.ts`.

- [src]
  - index.ts
  - server-db.ts
  - server-html.ts
  - server-puppeteer.ts
  - [html]
    - index.html
    - script.js
  - [lib]
    - db.ts
    - error.ts
    - scraper.ts

```ts
import { Elysia, t, NotFoundError } from 'elysia';
import { handleError } from '$lib/error';
import { Browser } from 'puppeteer';
import { app as dbApp } from './server-db';
import { app as htmlApp } from './server-html';
import { app as puppeteerApp } from './server-puppeteer';

const app = new Elysia()
  .use(dbApp)
  .use(htmlApp)
  .use(puppeteerApp)
  .onError((err) => handleError(err))
  .onStart(async ({ browser }) => {
    console.log('💫 Elysia start!');
    if (browser && browser instanceof Browser) {
      console.log('Browser version :', await browser.version());
    }
  })
  .onStop(async ({ browser, db }) => {
    if (browser && browser instanceof Browser) {
      await browser.close();
      console.log('Browser is closed!');
    }
    console.log('💤 Elysia stop!');
  });
```

> 참고: [깃허브 - gaurishhs/bun-web-app](https://github.com/gaurishhs/bun-web-app/blob/main/index.ts)

### typebox 이용한 params, query 타입 검증 및 변환

For numbers, a `transform` stage is necessary, which is supported in elysia with [the utility `t.Numeric`](https://elysiajs.com/concept/numeric.html).

- elysia 의 `t` 는 [typebox](https://github.com/sinclairzx81/typebox)를 다시 export 한 이름(alias)이다.
  - typebox 는 zod 라이브러리와 유사하다. Typescript 를 검증과 변환 등을 수행
- Query parameters are accessed as query, and path parameters as params.

```ts
import { t } from 'elysia';

const app = new Elysia().get(
  '/query',
  ({ query: { id } }) => {
    console.log(`query params: id=${id}`, typeof id);
    return {
      type: 'query',
      params: [id],
    };
  },
  {
    query: t.Object({
      id: t.Numeric(), // parseInt(query.id) 대신에 형변환 처리
    }),
  }
);
```

#### [How to separate complex model definitions](https://elysiajs.com/patterns/reference-models.html)

- Define a body model for the POST method
  - Essential elements such as name and author are required
- response 를 위해 필수 및 생략가능(Optional) 속성으로 구성
  - success 는 꼭 필요
  - operator, data, affectedId 등은 생략 가능 (Nullable 과는 다르다)
- model 은 use 키워드로 적용되고, 타입 검증시 alias 로 접근한다.
  - 입력으로 book 모델 이용
  - 출력으로 result 모델 이용

```ts
const bookModel = new Elysia().model({
  book: t.Object({
    name: t.String(),
    author: t.String(),
  }),
  result: t.Object({
    success: t.Boolean(),
    operator: t.Optional(
      // === operator?: string
      t.Union([t.Literal('create'), t.Literal('update'), t.Literal('delete')])
    ),
    data: t.Optional(t.Object({})),
    affectedId: t.Optional(t.Number()),
  }),
});

export const app = new Elysia()
  .use(bookModel)
  .decorate('db', new BooksDatabase())
  .get('/books', ({ db }) => db.getBooks())
  .post(
    '/books',
    async ({ db, body }) => {
      try {
        const result = await db.addBook(body);
        return { success: true, data: result.shift() };
      } catch (e) {
        console.error('create:', e);
        return { success: false, operator: 'create' };
      }
    },
    {
      body: 'book',
      response: 'result',
    }
  );
```

## 3. Handling turso with drizzle orm

> Reference Documents

- [Drizzle ORM - SQLite column types](https://orm.drizzle.team/docs/column-types/sqlite) : schema 정의시 사용
  - 추가 : [Drizzle 예제 - 깃허브 libSQL(Hono)](https://github.com/drizzle-team/drizzle-orm/blob/main/examples/libsql/src/server.ts)
- [Turso example - GitHub api-mug-store-api](https://github.com/turso-extended/api-mug-store-api)
  - 추가 : [Turso example - E-commerce store (Remix, Drizzle, Turso)](https://docs.turso.tech/tutorials/e-commerce-store-codelab/)

### books table schema

Turso 는 `libSQL` 기반이기 때문에 `sqlite-core` 를 사용하면 된다.

```ts
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// https://orm.drizzle.team/docs/column-types/sqlite
export const books = sqliteTable('books', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  author: text('author').notNull(),
});

/*
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  author TEXT
)
*/
```

### CRUD processing with Drizzle ORM

Books 를 다루기 위한 메소드들을 묶어 `BooksDatabase` 클래스로 정의했다.

```ts
import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { sql, eq } from 'drizzle-orm';
import * as schema from '../../drizzle/schema';

export type NewBook = typeof schema.books.$inferInsert;

export class BooksDatabase {
  private db: LibSQLDatabase;

  constructor() {
    if (process.env.TURSO_DB_URL === undefined) {
      throw new Error('TURSO_DB_URL is not defined');
    }
    if (process.env.TURSO_DB_AUTH_TOKEN === undefined) {
      throw new Error('TURSO_DB_AUTH_TOKEN is not defined');
    }

    const client = createClient({
      url: process.env.TURSO_DB_URL,
      authToken: process.env.TURSO_DB_AUTH_TOKEN,
    });
    this.db = drizzle(client);

    this.init()
      .then(() => console.log('Database initialized'))
      .catch(console.error);
  }

  async init() {
    return this.db.run(sql`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        author TEXT
      )
    `);
  }

  async getBooks() {
    return await this.db.select().from(schema.books);
  }

  async addBook(book: NewBook) {
    return await this.db
      .insert(schema.books)
      .values({
        name: book.name,
        author: book.author,
      })
      .returning();
  }

  async updateBook(id: number, book: NewBook) {
    return await this.db
      .update(schema.books)
      .set({
        name: book.name,
        author: book.author,
      })
      .where(eq(schema.books.id, id))
      .returning({ affectedId: schema.books.id });
  }

  async deleteBook(id: number) {
    return await this.db
      .delete(schema.books)
      .where(eq(schema.books.id, id))
      .returning({ affectedId: schema.books.id });
  }
}
```

#### Insert 를 위한 타입 추정 상용구 : `$inferInsert`

- `id` 컬럼은 생략 가능한 형태로 타입을 생성한다.
  - select 를 위한 타입 추정에는 `$inferSelect` 를 사용 (id 포함)

```ts
export type NewBook = typeof schema.books.$inferInsert;

/*
export interface NewBook {
    id?: number;
    name: string;
    author: string;
}
*/
```

#### insert/update/delete 이후 결과 반환 : `returning`

- Drizzle 에서 postgresql, sqlite 에 대해 지원한다. (mysql 제외)
- returning 의 반환 형태로 컬럼 스키마를 지정할 수 있다.
  - `affectedId` 컬럼으로 `id` 값을 반환하도록 작성
  - 이후 elysia 에서 response 모델로 `affectedId` 속성을 작성

```ts
return await this.db
  .delete(schema.books)
  .where(eq(schema.books.id, id))
  .returning({ affectedId: schema.books.id });
```

## 9. Summary

- There was a `Table is locked` error in the middle, but relogging in resolved it.
  - Frequent interruptions due to errors during development have occurred because they were not properly closed.
- Not sure if Turso is fast. It seems it needs to be provided globally to gain the edge effect.
  - Even with the free version, it is good to freely create databases.
  - Therefore, I have not yet used the local development environment.
- It has been an opportunity to become more familiar with Elysia. It got better as it became easier to handle.
- Let's do the Docker work next time.

&nbsp; <br />
&nbsp; <br />

> **End!** &nbsp;

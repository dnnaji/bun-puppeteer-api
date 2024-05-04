# Elysia with Puppeteer

## 0. Overview

- [x] Bun 1.0.3 &plus; Elysia (TS)
- [x] Puppeteer (Naver Place Search List)
- [x] Docker

## 1. [ElaysiaJS](https://elysiajs.com/introduction.html) 로 REST API 만들기

Refined the code from the previously written [bun-puppeteer-tutorial](https://taejoone.jeju.onl/posts/2023-09-23-bun-puppeteer-tutorial/).

- ElaysiaJS: A framework similar to ExpressJS

### `use` 로 파일 분리하기

Separate files by function such as db, html, puppeteer, and integrate them in `index.ts`.

- [src]
  - index.ts
  - server-puppeteer.ts
  - [lib]
    - error.ts
    - scraper.ts

```ts
import { Elysia, t, NotFoundError } from 'elysia';
import { handleError } from '$lib/error';
import { Browser } from 'puppeteer';
import { app as puppeteerApp } from './server-puppeteer';

const app = new Elysia()
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

## 2. Puppeteer 

Install Headless Chrome browser and puppeteer

```bash
bunx @puppeteer/browsers install chrome@stable
# => download to './chrome/mac_arm-117.0.5938.92/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'

bun add puppeteer
```

&nbsp; <br />
&nbsp; <br />

> **End!** &nbsp;

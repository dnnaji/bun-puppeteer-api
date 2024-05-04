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
  .onStop(async ({ browser }) => {
    if (browser && browser instanceof Browser) {
      await browser.close();
      console.log('Browser is closed!');
    }
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



(() => {
  const port = process.env.PORT || 8000;
  try {
    app.listen(
      {
        port,
        hostname: '0.0.0.0',
      },
      ({ hostname, port }) => {
        console.log(`🦊 Elysia is running at ${hostname}:${port}`);
      }
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  }

  // https://bun.sh/guides/process/os-signals
  process.on('SIGINT', () => {
    console.log('\n\nReceived SIGINT');
    app.stop();
  });
})();

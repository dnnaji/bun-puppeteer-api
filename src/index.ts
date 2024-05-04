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

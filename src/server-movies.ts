import { Elysia, t } from 'elysia';
import * as edgedb from "edgedb";
import e from "../dbschema/edgeql-js";

const client = edgedb.createClient();


export const app = new Elysia().get(
  '/movies',
  async () => {
    const result = await e
    .select(e.Movie, () => ({
      title: true,
      actors: () => ({ name: true }),
      filter_single: { title: "Iron Man 2" },
    }))
    .run(client);
    return result;
  }
);

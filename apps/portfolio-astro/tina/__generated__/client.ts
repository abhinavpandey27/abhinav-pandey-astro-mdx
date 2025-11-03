import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ url: 'http://localhost:4001/graphql', token: '874dd96c8e99a397c7232e25e8fdb932ce7ce8d3', queries,  });
export default client;
  
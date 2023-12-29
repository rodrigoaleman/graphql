import {ApolloServer} from "@apollo/server";
import {expressMiddleware as apolloMiddleware} from "@apollo/server/express4";
import cors from 'cors';
import express from 'express';
import {readFile} from 'node:fs/promises'
import { authMiddleware, handleLogin } from './auth.js';
import {resolvers} from "./resolvers.js";
import {getUser, getUserByEmail} from "./db/users.js";

const PORT = 9000;

const app = express();
app.use(cors(), express.json(), authMiddleware);

app.post('/login', handleLogin);

/**
* This integrates apollo server with express, to send all the request that pass from /graphql to the apollo middleware
* */
const typeDefs = await readFile('./schema.graphql', 'utf8');

async function getContext({req}) {
  if (req.auth){
    const user = await getUser(req.auth.sub);
    return {user};
  }
  return {}
}
const apolloServer = new ApolloServer({typeDefs, resolvers});
await apolloServer.start();
app.use('/graphql', apolloMiddleware(apolloServer, {context: getContext}));

app.listen({ port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GraphQl endpoint: http://localhost:${PORT}/graphql`);
});

import express from "express";
import listEndpoints from "express-list-endpoints";
import blogPostsRouter from "./services/blogPosts/index.js";
import authorsRouter from "./services/authors/index.js";
import {
  badRequestHandler,
  unauthorizedHandler,
  notFoundHandler,
  genericErrorHandler,
} from "./errorHandlers.js";
import createHttpError from "http-errors";

const server = express();

const port = 3001; 

server.use(express.json()); 


server.use("/authors", authorsRouter);
server.use("/blogPosts", blogPostsRouter);

server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);


console.table(listEndpoints(server));

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

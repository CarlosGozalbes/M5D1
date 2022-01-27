import express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";
import { newBlogPostsValidation } from "./validation.js";

//first we define the url to the JSON
const blogPostsJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "blogPosts.json"
);

//and create functions to read and write the JSON

const getBlogPosts = (blogPostsJSONPath) =>
  JSON.parse(fs.readFileSync(blogPostsJSONPath));

const writeBlogPosts = (blogPostsArray) =>
  fs.writeFileSync(blogPostsJSONPath, JSON.stringify(blogPostsArray));

//then we create the CRUD
const blogPostsRouter = express.Router();

blogPostsRouter.post("/", newBlogPostsValidation, (req, res, next) => {
  try {
    const errorsList = validationResult(req);
    if (errorsList.isEmpty()) {
      // 1. Get new book info from req.body & Add additional info
      const newBlogPosts = {
        ...req.body,
        createdAt: new Date(),
        _id: uniqid(),
      };

      // 2. Read books.json file --> buffer --> array
      const blogPostsArray = getBlogPosts(blogPostsJSONPath);

      // 3. Add new book to array
      blogPostsArray.push(newBlogPosts);

      // 4. Write array to file
      writeBlogPosts(blogPostsArray);

      // 5. Send back a proper response
      res.status(201).send({ id: newBlogPosts._id });
    } else {
      next(
        createHttpError(400, "Some errors occured in request body!", {
          errorsList,
        })
      );
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.get("/", (req, res, next) => {
  try {
    const blogPostsArray = getBlogPosts();

    res.send(blogPostsArray);
  } catch (error) {
    next(error); // With the next function I can send the error to the error handler middleware
  }
});

blogPostsRouter.get("/:blogPostId", (req, res, next) => {
  try {
    const blogPostId = req.params.blogPostId;

    const blogPostsArray = getBlogPosts();

    const foundBlogPosts = blogPostsArray.find(
      (blogPosts) => blogPost._id === blogPostId
    );
    if (foundBlogPosts) {
      res.send(foundBlogPosts);
    } else {
      next(
        createHttpError(
          404,
          `Blog Post with id ${req.params.blogPostId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.put("/:blogPostId", (req, res, next) => {
  try {
    const blogPostId = req.params.blogPostsRouter;

    const blogPostsArray = getBlogPosts();

    const index = blogPostsArray.findIndex(
      (blogPost) => blogPost._id === blogPostId
    );

    const oldBlogPost = blogPostsArray[index];

    const updatedBlogPost = {
      ...oldBlogPost,
      ...req.body,
      updatedAt: new Date(),
    };

    blogPostsArray[index] = updatedBlogPost;

    writeBlogPosts(blogPostsArray);

    res.send(updatedBlogPost);
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.delete("/:blogPostId", (req, res, next) => {
  try {
    const blogPostId = req.params.blogPostId;

    const blogPostsArray = getBlogPosts();

    const remaningBlogPosts = blogPostsArray.filter(
      (blogPosts) => blogPosts._id !== blogPostId
    );

    writeBlogPosts(remaningBlogPosts);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default blogPostsRouter;

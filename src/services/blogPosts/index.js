import express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";
import { newBlogPostsValidation } from "./validation.js";
import multer from "multer";
import { saveBlogPostsCovers } from "../../lib/fs-tools.js";
import { getBlogPosts, writeBlogPosts } from "../../lib/fs-tools.js";
import {v2 as cloudinary} from 'cloudinary'
import {CloudinaryStorage} from "multer-storage-cloudinary"
import { getPDFReadableStream } from "../../lib/pdf-tools.js";
import { pipeline } from "stream";
//first we define the url to the JSON
// const blogPostsJSONPath = join(
//   dirname(fileURLToPath(import.meta.url)),
//   "blogPosts.json"
// );

// //and create functions to read and write the JSON

// const getBlogPosts = (blogPostsJSONPath) =>
//   JSON.parse(fs.readFileSync(blogPostsJSONPath));

// const writeBlogPosts = (blogPostsArray) =>
//   fs.writeFileSync(blogPostsJSONPath, JSON.stringify(blogPostsArray));

//then we create the CRUD
const blogPostsRouter = express.Router();

blogPostsRouter.post("/", newBlogPostsValidation, async (req, res, next) => {
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
      const blogPostsArray =  await getBlogPosts();

      // 3. Add new book to array
      blogPostsArray.push(newBlogPosts);

      // 4. Write array to file
      await writeBlogPosts(blogPostsArray);

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

blogPostsRouter.get("/", async (req, res, next) => {
  try {
    const blogPostsArray = await getBlogPosts();

    res.send(blogPostsArray);
  } catch (error) {
    next(error); // With the next function I can send the error to the error handler middleware
  }
});

blogPostsRouter.get("/:blogPostId", async (req, res, next) => {
  try {
    const blogPostId = req.params.blogPostId;

    const blogPostsArray = await getBlogPosts();

    const foundBlogPosts = blogPostsArray.find((blogPost) => blogPost._id === blogPostId );
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

blogPostsRouter.put("/:blogPostId", async (req, res, next) => {
  try {
    const blogPostId = req.params.blogPostsRouter;

    const blogPostsArray = await getBlogPosts();

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

    await writeBlogPosts(blogPostsArray);

    res.send(updatedBlogPost);
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.delete("/:blogPostId", async (req, res, next) => {
  try {
    const blogPostId = req.params.blogPostId;

    const blogPostsArray = await getBlogPosts();

    const remaningBlogPosts = blogPostsArray.filter(
      (blogPosts) => blogPosts._id !== blogPostId
    );

    await writeBlogPosts(remaningBlogPosts);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.post(
  "/:blogPostId/uploadCover",
  multer({storage: new CloudinaryStorage({cloudinary, params: {folder:"oct21",},})}).single("cover"),
  async (req, res, next) => {
    // "cover" does need to match exactly to the name used in FormData field in the frontend, otherwise Multer is not going to be able to find the file in the req.body
    try {
      // console.log("FILE: ", req.file);
      // await saveBlogPostsCovers(req.file.originalname, req.file.buffer);
      const blogPostId = req.params.blogPostId;

      const blogPostsArray = await getBlogPosts();

      const index = blogPostsArray.findIndex(
        (blogPost) => blogPost._id === blogPostId
      );

      const oldBlogPost = blogPostsArray[index];
      
      const updatedBlogPost = {
        ...oldBlogPost,
        cover: req.file.path,
        updatedAt: new Date(),
      };

      blogPostsArray[index] = updatedBlogPost;

      await writeBlogPosts(blogPostsArray);
      
      
      res.send(req.file.path);
    } catch (error) {
      next(error);
    }
  }
);


// GET /blogPosts/:id/comments, get all the comments for a specific post

blogPostsRouter.get("/:blogPostId/comments", async (req, res, next) => {
  try {
    const blogPostId = req.params.blogPostId;

    const blogPostsArray = await getBlogPosts();

    const foundBlogPosts = blogPostsArray.find(
      (blogPost) => blogPost._id === blogPostId
    );
    if (!foundBlogPosts) {
      res.status(404)
      .send({ message: `blog with ${req.params.id} is not found!`});
    } 
      
    foundBlogPosts.comments = foundBlogPosts.comments || [];
    res.send(foundBlogPosts.comments)
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.post(
  "/:blogPostId/comment",
  async (req, res, next) => {
    try {
      const { text, userName } = req.body;
      const comment = { id: uniqid(), text, userName, createdAt: new Date() };

      const blogPostsArray = await getBlogPosts();

      const index = blogPostsArray.findIndex(
        (blogPost) => blogPost._id === req.params.blogPostId
      );
      if (!index == -1) {
        res.status(404).send({
          message: `blog with ${req.params.blogPostId} is not found!`,
        });
      }
      const oldBlogPost = blogPostsArray[index];
      oldBlogPost.comments = oldBlogPost.comments || [];
      const updatedBlogPost = {
        ...oldBlogPost,
        ...req.body,
        comments: [...oldBlogPost.comments, comment],
        updatedAt: new Date(),
        id: req.params.id,
      };
      blogPostsArray[index] = updatedBlogPost;

      await writeBlogPosts(blogPostsArray);
      res.send("ok");
    } catch (error) {
      next(error);
    }
  }
);

blogPostsRouter.get("/:blogPostId/downloadPDF", async (req, res, next) => {
  try {
    
    const blogPostId = req.params.blogPostId;

    const blogPostsArray = await getBlogPosts();

    const foundBlogPost = blogPostsArray.find(
      (blogPost) => blogPost._id === blogPostId)
    console.log(foundBlogPost)
    res.setHeader("Content-Disposition", `attachment; filename=${foundBlogPost.title}.pdf`);

    const source = getPDFReadableStream(foundBlogPost);
    const destination = res;
    pipeline(source, destination, (err) => {
      if (err) next(err);
    });
  } catch (error) {
    next(error);
  }
});




export default blogPostsRouter;

// blogpostRouter.put("/:id/comments", async (req, res, next) => {
//   try {
//     const { text, userName } = req.body;
//     const comment = { id: uniqid(), text, userName, createdAt: new Date() };
//     const blogPostJson = await readBlogPostJson(); //reading  blogPostJson is (array of object) =--> [{--},{--},{--},{--},{--}]
//     const index = blogPostJson.findIndex((blog) => blog.id == req.params.id);
//     // console.log("this is index", index)

//     const blogToModify = blogPostJson[index];
//     // console.log("this is index 2", bookToModify)
//     blogToModify.comments = blogToModify.comments || [];
//     // const UpdatedReqBody = req.body // incoming change inputted by user from FE
//     // console.log("this is req.body", UpdatedReqBody)

//     const updatedBlog = {
//       ...blogToModify,
//       comments: [...blogToModify.comments, comment],
//       updatedAt: new Date(),
//       id: req.params.id,
//     }; // union of two bodies
//     // console.log("this is updateBook", updatedBlog)

//     blogPostJson[index] = updatedBlog;
//     await writeBlogPostJson(blogPostJson);

//     res.send(updatedBlog);
//   } catch (error) {
//     next(error);
//   }
// });
// blogpostRouter.get("/:id/comments", async (req, res, next) => {
//   try {
//     const blogPostJson = await readBlogPostJson(); //reading  blogPostJson is (array of object) =--> [{--},{--},{--},{--},{--}]

//     const singleBlog = blogPostJson.find((b) => b.id == req.params.id); //findindg the exact data needed
//     console.log(singleBlog);

//     singleBlog.comments = singleBlog.comments || [];
//     res.send(singleBlog.comments);
//   } catch (error) {
//     next(error);
//   }
// });

import { body } from "express-validator";

export const newBlogPostsValidation = [
  body("title").exists().withMessage("Title is a mandatory field!"),
  body("category").exists().withMessage("Category is a mandatory field!"),
  body("email").exists().withMessage("Email is a mandatory field!"),
//   body("readtime").exists().withMessage("Readtime is a mandatory field!"),
//   body("author").exists().withMessage("Author is a mandatory field!"),
  body("content").exists().withMessage("Content is a mandatory field!"),
];

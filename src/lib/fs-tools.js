import fs from "fs-extra"; // 3rd party module
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import { createReadStream } from "fs";

const { readJSON, writeJSON, writeFile } = fs;

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data");
const authorsPublicFolderPath = join(process.cwd(), "./public/img/authors");
const blogPostsPublicFolderPath = join(process.cwd(), "./public/img/blogPosts");

const authorsJSONPath = join(dataFolderPath, "authors.json");
const blogPostsJSONPath = join(dataFolderPath, "blogPosts.json");

export const getAuthors = () => readJSON(authorsJSONPath);
export const writeAuthors = (content) => writeJSON(authorsJSONPath, content);
export const getBlogPosts = () => readJSON(blogPostsJSONPath);
export const writeBlogPosts = (content) => writeJSON(blogPostsJSONPath, content);

export const saveAuthorsAvatars = (filename, contentAsABuffer) =>
  writeFile(join(authorsPublicFolderPath, filename), contentAsABuffer);


export const saveBlogPostsCovers = (filename, contentAsABuffer) =>
  writeFile(join(blogPostsPublicFolderPath, filename), contentAsABuffer);

  console.log(blogPostsPublicFolderPath);

export const getAuthorsReadableStream = () => createReadStream(authorsJSONPath)
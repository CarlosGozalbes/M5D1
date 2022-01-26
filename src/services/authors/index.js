import express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";


const authorsRouter = express.Router();

const currentFilePath = fileURLToPath(import.meta.url);

const parentFolderPath = dirname(currentFilePath);

const authorsJSONPath = join(parentFolderPath, "authors.json");

//const authorsJSONPath = join(dirname(fileURLtoPath(import.meta.url)), "books.json")
//const getAuthors = (authorsJSONPath) => JSON.parse(fs.readFileSync(authorsJSONPath));
//const writeAuthors = (authorsArray) => fs.writeFileSync(authorsJSONPath, JSON.stringify(authorsArray));

authorsRouter.post("/", (req, res) => {
  console.log("REQUEST BODY: ", req.body);

  const newAuthor = { ...req.body, ID: uniqid() };
  console.log(newAuthor);

  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath));

  if (authorsArray.some((author) => author.email === req.body.email)) {
    //object.value()
    // if (Object.values(JSON.stringify(authorsArray)).indexOf(author.email) > -1) {
    //   console.log("has test1");
    //}

    console.log("email already exist");
    res.status(400).send({ message: "Email already exists" });
  } else {
    authorsArray.push(newAuthor);
    fs.writeFileSync(authorsJSONPath, JSON.stringify(authorsArray));
    res.status(201).send({ id: newAuthor.ID });
  }
});

authorsRouter.get("/", (req, res) => {
  const fileContent = fs.readFileSync(authorsJSONPath);

  console.log("FILE CONTENT: ", JSON.parse(fileContent));

  const authorsArray = JSON.parse(fileContent);

  res.send(authorsArray);
});

authorsRouter.get("/:authorID", (req, res) => {
  console.log("ID:", req.params.authorID);

  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath));

  const foundAuthor = authorsArray.find(
    (author) => author.ID === req.params.authorID
  );

  res.send(foundAuthor);
});

authorsRouter.put("/:authorID", (req, res) => {
  const authorsArray = JSON.parse(fs.readFileSync(usersJSONPath));
  const index = authorsArray.findIndex(
    (author) => author.ID === req.params.authorID
  );
  const oldAuthor = authorsArray[index];
  const updatedAuthor = { ...oldAuthor, ...req.body };
  authorsArray[index] = updatedAuthor;
  fs.writeFileSync(authorsJSONPath, JSON.stringify(authorsArray));
  res.send(updatedAuthor);
});

authorsRouter.delete("/:authorID", (req, res) => {
  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath));

  const remainingAuthors = authorsArray.filter(
    (author) => author.ID !== req.params.authorID
  );

  fs.writeFileSync(authorsJSONPath, JSON.stringify(remainingAuthors));

  res.status(204).send();
});

export default authorsRouter;

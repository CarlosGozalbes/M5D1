import express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";
import { getAuthors, writeAuthors } from "../../lib/fs-tools.js"
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

const authorsRouter = express.Router();

// const currentFilePath = fileURLToPath(import.meta.url);

// const parentFolderPath = dirname(currentFilePath);

// const authorsJSONPath = join(parentFolderPath, "authors.json");

//const authorsJSONPath = join(dirname(fileURLtoPath(import.meta.url)), "books.json")
//const getAuthors = (authorsJSONPath) => JSON.parse(fs.readFileSync(authorsJSONPath));
//const writeAuthors = (authorsArray) => fs.writeFileSync(authorsJSONPath, JSON.stringify(authorsArray));

authorsRouter.post("/", async (req, res, next) => {
  try {
    const errorList = validationResult(req)
   if (errorList.isEmpty()) {
    const newAuthor = { ...req.body, ID: uniqid() };
    
    const authorsArray = await getAuthors()

    authorsArray.push(newAuthor)

    await writeAuthors(authorsArray)

    res.status(201).send({ id: newAuthor.ID})
  } else {
    next(createHttpError(400,"Bad request", {errorList}))
  }
} catch (error) {
  next(error)
}    
})
  
  // console.log("REQUEST BODY: ", req.body);

  // const newAuthor = { ...req.body, ID: uniqid() };
  // console.log(newAuthor);

  // const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath));

  // if (authorsArray.some((author) => author.email === req.body.email)) {
  //   //object.value()
  //   // if (Object.values(JSON.stringify(authorsArray)).indexOf(author.email) > -1) {
  //   //   console.log("has test1");
  //   //}

  //   console.log("email already exist");
  //   res.status(400).send({ message: "Email already exists" });
  // } else {
  //   authorsArray.push(newAuthor);
  //   fs.writeFileSync(authorsJSONPath, JSON.stringify(authorsArray));
  //   res.status(201).send({ id: newAuthor.ID });
  // }


authorsRouter.get("/", async (req, res, next) => {
  try{
    const authorsArray = await getAuthors()
    res.send(authorsArray)
  
  } catch (error) {
    next(error)
  }
   
  
  // const fileContent = fs.readFileSync(authorsJSONPath);

  // console.log("FILE CONTENT: ", JSON.parse(fileContent));

  // const authorsArray = JSON.parse(fileContent);

  // res.send(authorsArray);
});

authorsRouter.get("/:authorID", async(req, res, next) => {
  try{
    const authorID = req.params.authorID
    const authorArray = await getAuthors()

    const foundAuthor = authorArray.find(author => author.ID === authorID)
    if (foundAuthor) {
      res.send(foundAuthor)
    } else {
      next(createHttpError(404, `Author with id ${req.params.authorID} not found`))
    }
  } catch (error) {
    next(error)
  }
})

//   console.log("ID:", req.params.authorID);

//   const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath));

//   const foundAuthor = authorsArray.find(
//     (author) => author.ID === req.params.authorID
//   );

//   res.send(foundAuthor);
// });

authorsRouter.put("/:authorID", async (req, res, next) => {
  try{
    const authorID = req.params.authorID
    const authorArray = await getAuthors()
    const index = authorArray.findIndex(author => author.ID === authorID)
    const oldAuthor=authorArray[index]
    const updatedAuthor = { ...oldAuthor,...req.body, updatedAt: new Date()}
    authorArray[index] = updatedAuthor
    await writeAuthors(authorArray)
    res.send(updatedAuthor)
  } catch (error) {
    next(error)
  }
})


//   const authorsArray = JSON.parse(fs.readFileSync(usersJSONPath));
//   const index = authorsArray.findIndex(
//     (author) => author.ID === req.params.authorID
//   );
//   const oldAuthor = authorsArray[index];
//   const updatedAuthor = { ...oldAuthor, ...req.body };
//   authorsArray[index] = updatedAuthor;
//   fs.writeFileSync(authorsJSONPath, JSON.stringify(authorsArray));
//   res.send(updatedAuthor);
// });

authorsRouter.delete("/:authorID", async (req, res, next) => {
 try {
   const authorID =req.params.authorID
   const authorArray = await getAuthors()
   const remainingAuthors = authorArray.filter(author => author.ID !== authorID)
   await writeAuthors(remainingAuthors)
   res.status(204).send()
 } catch (error) {
   next(error)
 }
})

  //   const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath));

//   const remainingAuthors = authorsArray.filter(
//     (author) => author.ID !== req.params.authorID
//   );

//   fs.writeFileSync(authorsJSONPath, JSON.stringify(remainingAuthors));

//   res.status(204).send();
// });

export default authorsRouter;

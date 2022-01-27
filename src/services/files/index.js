import express from "express"
import multer from "multer"
import { saveAuthorsAvatars, saveBlogPostsCovers } from "../../lib/fs-tools.js"

const filesRouter = express.Router()

filesRouter.post("/uploadAvatar", multer().single("avatar"), async (req, res, next) => {
  // "avatar" does need to match exactly to the name used in FormData field in the frontend, otherwise Multer is not going to be able to find the file in the req.body
  try {
    console.log("FILE: ", req.file)
    await saveAuthorsAvatars(req.file.originalname, req.file.buffer)
    res.send("Ok")
  } catch (error) {
    next(error)
  }
})

filesRouter.post("/uploadCover", multer().single("cover"), async (req, res, next) => { //array instead of single
  try {
    console.log("FILE: ", req.file)
    await saveBlogPostsCovers(req.file.originalname, req.file.buffer)
    res.send("Ok")
  } catch (error) {
    next(error)
  }
  
//     try {
//     console.log("FILES: ", req.files)

//     const arrayOfPromises = req.files.map(file => saveUsersAvatars(file.originalname, file.buffer))
//     await Promise.all(arrayOfPromises)
//     res.send("Ok")
//   } catch (error) {
//     next(error)
//   }
})

export default filesRouter

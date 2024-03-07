const express = require('express');

const userRouter = require("./user.js");
const postRouter = require("./posts.js");

const router = express.Router();

router.use("/user" , userRouter);
router.use("/post", postRouter);

module.exports = router;

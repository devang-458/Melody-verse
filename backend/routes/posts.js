const express = require("express");
const { Posts } = require("../db");

const router = express.Router();


router.post("/post", async (req,res)=>{
    try{
        const {userId, title, content} = req.body;
        const newPost = await Posts.create({userId, title, content});
        res.status(201).json(newPost)
    }catch(err){
        console.error(err)
        res.status(500).json({
            error: "Internal Server Error"
        })
    }
})

router.get("/post/:id", async (req,res)=>{
    try{
        const postId = req.params.id;
        const post = await Posts.findById(postId)
        if(!post){
            return res.status(404).json({
                error: "Post not Found"
            })
        }
        res.status(200).json(post);
    }catch(error){
        console.error(error);
        res.status(500).json({
            error: "internal Server Error"
        })
    }
})

router.get("/post",async (req,res)=>{
    try{
        const page = req.query.page || 1;
        const perPage = req.query.perPage || 10;

        const posts = await Posts.find()
            .skip((page - 1)* perPage)
            .limit(perPage)
            .sort({createdAt: -1});
        res.json(posts)

    }catch(error){
        console.error(error)
        res.status(500).json({
            error: 'Internal Server Error'
        })
    }
})

module.exports = router;
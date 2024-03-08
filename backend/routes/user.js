const express = require('express');
const zod = require("zod");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require("dotenv").config();
const crypto = require('crypto');
const { User } = require('../db');
const { authMiddleware } = require('./middleware');

const router = express.Router();
const {JWT_SECRET, EMAIL_HOST,EMAIL_PASS, EMAIL_PORT, EMAIL_USER } = process.env

const signupBody = zod.object({
    username: zod.string().email(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string()
});

router.post("/signup", async (req,res)=>{
    const {success} = signupBody.safeParse(req.body);
    if(!success){
        res.status(411).json({ 
            msg: "Incorrect inputs"
        })
    }
    //checking existing user
    const existingUser = await User.findOne({
        username: req.body.username
    })

    if(existingUser){
        return res.status().json({
            msg:"Email is already taken"
        })
    }

    //create User 
    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    })

    const userId  = user._id;

    //sending email
    const transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });

    try{
        const info = await transporter.sendMail({
            from: '"MelodyVerse👻" <MelodyVerse@gmail.com>', // sender address
            to: `${req.body.username}`, // list of receivers
            subject: "Hello ✔", // Subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world?</b>", // html body
        });
        console.log("Email sent: ", info)
    }
    catch(err){
        console.error("Error sending email", err)
        res.status(500).json({
            msg: "Error sending email"
        });
        return
    }

    //creating token
    const token = jwt.sign({
        userId
    }, JWT_SECRET,{expiresIn: "1h"})
    
    res.status(200).json({
        token,
        meg:"User created successfully"
    })

})

const signinBody = zod.object({
    username: zod.string(),
    password: zod.string()
})

router.use('/signin', async (req,res) => {
    const {success}  = signinBody.safeParse(req.body);
    if(!success){
        res.status(411).json({
            msg: "Wrong Inputs"
        })
        return;
    }

    const {username, password} = req.body;
    //finding user
    try{
        const user = await User.findOne({ username });

        if(user){
            const isPasswordValid = await user.validatePassword(password)
            
            if(isPasswordValid){
                const token = jwt.sign({
                    userId: user._id
                }, JWT_SECRET,{expiresIn: "1h"})
    
                res.json({
                    token: token
                })
                return;
            }
        }
        res.status(411).json({
            msg: "Error while logging in"
        })
    }
    catch{
        console.error("Error while logging in", error)
        res.status(500).json({
            msg: "Internal Server Error"
        })
    }
})

const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
})

router.put("/update",authMiddleware,async (req,res)=>{
    
    const {success} = updateBody.safeParse(req.body);

    console.log(req.userId)
    
    if(!success){
        res.status(411).json({
            msg: "Error while updating information"
        })
    };

    const userId = req.userId

    try{
        const updateUser = await User.findByIdAndUpdate(userId, req.body, {new: true})
        if(!updateUser){
            return res.status(404).json({
                msg : "User not found"
            })
        }

        res.json({
            msg: "Update successful",
            user: updateUser
        })
    }
    catch{
        console.error("Error updating user Information", error)
        res.status(500).json({
            msg: "Internal Server Error"
        });
    }
})

router.post("/forget-password", authMiddleware ,async (req,res)=>{
    const {username} = req.body;
    try{
        const user = await User.findOne({username});

        if(!user){
            return res.status(404).json({msg: "User not found"})
        }
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiration = Date.now() + 3600000;

        await user.save()
        res.status(200).json({
            msg: "Reset token generated successfully",
            resetToken: resetToken
        })
    }catch(error){
        console.error(error)
        res.status(500).json({ msg: "Internal Server Error" })
    }
})

router.post('/reset-password', authMiddleware,async (req,res)=>{
    const {resetToken, newPassword} = req.body;

    try{
        const user = await User.findOne({
            resetToken,
            resetTokenExpiration: {$gt: Date.now()}
        });
        if(!user){
            res.status(400).json({ msg: "Invaild or Expired reset token" })
        }
        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined

        await user.save();

        res.status(200).json({ msg: "Password reset successful" })
    }
    catch(error){
        console.log(error)
        res.status(500).json({
            msg: "Internal Server Error"
        })
    }
})

module.exports = router;



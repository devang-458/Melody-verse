const bcrypt = require("bcrypt");
require("dotenv").config()
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL)

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 50
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    firstName:{
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetToken: String,
    resetTokenExpiration: Date

},{timestamps: true})

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title:{
        type: String,
        required: true
    },
    content:{
        type: String,
        required: true
    }
},{timestamps: true})


//hashing password

userSchema.methods.createHash = async function(plainTextPassword){
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    return await bcrypt.hash(plainTextPassword, salt);
};

userSchema.pre("save", async function(next){
    if(this.isModified('password')){
        this.password = await this.createHash(this.password)
    }
    next();
})

userSchema.methods.validatePassword = async function (candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password)
}
const Posts = mongoose.model("Post", postSchema);
const User = mongoose.model("User",userSchema);

module.exports = {
    User,
    Posts
}
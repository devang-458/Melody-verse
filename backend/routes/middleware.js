const jwt = require("jsonwebtoken");

const {JWT_SECRET} = process.env;

const authMiddleware = async (req,res,next)=>{
    const authHeader = req.headers.authorization;
    
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(403).json({
            msg: "Authorization header is missing or malformed"
        })
    }

    const token = authHeader.split(" ")[1];

    try{
        const decode = jwt.verify(token, JWT_SECRET);
        req.userId = decode.userId
        next()
    }catch(err){
        console.error("Error verifying token:", err)
        return res.status(403).json({
            msg: "Invalid or expired token"
        })
    }
};


module.exports = {
    authMiddleware
}
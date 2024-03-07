const express = require("express");

const app = express();

const helmet = require('helmet');

const rootRouter = require('./routes/index.js');

app.use(cors())

app.use(helmet())

app.use(express.json())

app.use("/api/v1/", rootRouter)

app.use((err,req,res,next)=>{
    console.error(err.stack);
    res.status(500).json({
        msg:"Internal Server Error"
    });
})


app.listen(3000,()=>{
    console.log("server is online")
})
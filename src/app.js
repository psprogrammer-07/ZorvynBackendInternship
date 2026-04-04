const express = require('express');
const rateLimit=require('express-rate-limit');
const app = express();
app.use(express.json());
const db = require('./config/db'); 

const PORT = process.env.PORT || 3000;

const globalRateLimiter=rateLimit(
    {
        windowMs:5*60*1000,
        max:100,
        message:{
            message:"Too many requests from this IP, please try again after 5 minutes."
        },
        standardHeaders:true,
        legacyHeaders:false
    }
)

app.use(globalRateLimiter);

const userRouter= require("./routes/user.routes");
const authRouter= require("./routes/auth.routes");
const recordRouter=require("./routes/record.routes")
const dashboardRouter=require("./routes/dashboard.routes");
const {authenticateToken}=require("./middleware/auth.middleware")

app.use("/auth",authRouter);
app.use("/users",userRouter);
app.use("/record",recordRouter);
app.use("/dashboard",dashboardRouter);



app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
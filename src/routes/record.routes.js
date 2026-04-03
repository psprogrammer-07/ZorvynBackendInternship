const express = require("express");
const bcrypt= require("bcrypt");
const db= require("../config/db");
const router= express.Router();

const {authenticateToken,authorizeRole}= require("../middleware/auth.middleware");

router.post("",authenticateToken,authorizeRole(["ADMIN"]),(req,res)=>{

    try{

        

    }
    catch(e){
        return res.status(500).json({message:"An Internal server error"});
    }

})



module.exports=router;


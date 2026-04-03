const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const router = express.Router();

const JWT_SECRET= process.env.JWT_SECRET|| "my_super_secret_key";

router.post("/login",(req,res)=>{

     try{

        const {email, password}= req.body;

        if(!email || !password){
            return res.status(400).json({message:"Email and Password is required"});
        }

        const sql =`select * from users where email= ?`;

        db.get(sql,[email],async function(err,user){

            if(err) return res.status(400).json({message:err.message});

            if(!user) return res.status(401).json({message:"Invalid email or password"});

            const isMatch= await bcrypt.compare(password,user.password);

            if (!isMatch) {
                return res.status(401).json({ message: "Invalid email or password" });
            }


            const payload={
                id:user.id,
                role:user.role
            }

            const token= jwt.sign(payload, JWT_SECRET,{expiresIn:"240h"});


            return res.status(200).json(
                {
                    message:"Login successfully",
                    token:token,
                    user:{
                        id:user.id,
                        name:user.name,
                        email:user.email,
                        role:user.role,
                    
                    }
                }
            )


        })

     }
     catch(e){
        return res.status(500).json({
            message:"An internal server error occured",
        })
     }
    
})





module.exports=router;
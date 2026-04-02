const express = require("express");
const bcrypt= require("bcrypt");
const db= require("../config/db");
const router= express.Router();


router.post("/",async(req,res)=>{

    try{
    const {name,email,password,role}= req.body;

    if(!name || !email,!password){
        return res.status(400).json(
            {
                message:"Name, email, and password are required fields.",
            }
        )
    }


    if(password.length<8){
        return res.status(400).json(
            {
            message : "The password required at least 8 characters",
            }
        )

    }

    const hashround=10;
    const hashedPassword= await bcrypt.hash(password,hashround);


    const sql=`INSERT INTO users (name,email,password,role) values (?,?,?,?)`;

    const values=[name,email,hashedPassword,role||"VIEWER"];

    db.run(sql,values, function(err) {

        

        if(err){
            if (err.message.includes("UNIQUE constraint failed: users.email")) {
                    return res.status(409).json({ 
                        message: "A user with this email already exists." 
                    });
                }
           return res.status(400).json({
                message: err.message,
            })
        }

        res.status(201).json(
            {
                message:"User created successfully",
                data: {
                id: this.lastID,
                name: name,
                email: email,
                role: role || 'VIEWER',
                password:hashedPassword,
            }
            }
        )

    })

} catch(e){
    res.status(500).json(
        {
            message:"An internal server error occurred."
        }
    )
}


});


module.exports= router;
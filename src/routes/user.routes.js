const express = require("express");
const bcrypt= require("bcrypt");
const db= require("../config/db");
const router= express.Router();

const {authenticateToken,authorizeStatus,authorizeRole}= require("../middleware/auth.middleware")


router.post("/",authenticateToken,authorizeStatus,authorizeRole(['ADMIN']),async(req,res)=>{

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
                status:"ACTIVE",
                
                
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

router.get("/",authenticateToken,authorizeStatus,authorizeRole(['ADMIN']),(req,res)=>{

    try{

        const page= parseInt(req.query.page)||1;
        const limit= parseInt(req.query.limit)||10;

        console.log(page);
        console.log(limit);

        const offset=(page -1)* limit;

        const countSql=`select COUNT(*) as total from users`;
        const userSql=`select id, name, email, role, status, created_at from users LIMIT ? OFFSET ?`;



        db.get(countSql,[], function(err,row){
            if (err) return res.status(500).json({message:err.message});

            const totalRecords=row.total;
            const totalPages=Math.ceil(totalRecords/limit);

            db.all(userSql,[limit,offset], function(err,rows){

                if(err) return err.status(500).json({message:err.message});



                return res.status(200).json(
                    {
                        message:"User data successfully retrived",
                        pagination:{
                            total_records: totalRecords,
                            total_pages: totalPages,
                            current_page: page,
                            limit: limit
                        },
                        data:rows
                    }
                )



            })


        })


    }
    catch(e){
        return res.status(500).json(
            {
                "message":"An internal server error occurred."
            }
        )
    }
});

router.get("/me", authenticateToken, authorizeStatus, authorizeRole(['ADMIN', 'VIEWER', 'ANALYST']), (req, res) => {
    try {
       
        const userId = req.user.id;

        
        const getProfileSql = `SELECT id, name, email, role, status, created_at FROM users WHERE id = ?`;

        
        db.get(getProfileSql, [userId], (err, row) => {
            if (err) {
                return res.status(500).json({ message: "Database error while fetching user profile." });
            }

        
            if (!row) {
                return res.status(404).json({ message: "User profile not found." });
            }

            
            return res.status(200).json({
                message: "Profile successfully retrieved",
                data: row
            });
        });

    } catch (e) {
        return res.status(500).json({ message: "An internal server error occurred." });
    }
});

router.get("/:id", authenticateToken, authorizeStatus, authorizeRole(['ADMIN']), (req, res) => {
    try {
        const targetUserId = parseInt(req.params.id);

        if (!targetUserId || isNaN(targetUserId)) {
            return res.status(400).json({ message: "A valid numeric User ID is required." });
        }

        
        const getUserSql = `SELECT id, name, email, role, status, created_at FROM users WHERE id = ?`;

      
        db.get(getUserSql, [targetUserId], (err, row) => {
            if (err) {
                console.error("[DB Error]:", err.message);
                return res.status(500).json({ message: "Database error while fetching user data." });
            }

            
            if (!row) {
                return res.status(404).json({ message: "User not found." });
            }

            
            return res.status(200).json({
                message: "User successfully retrieved",
                data: row
            });
        });

    } catch (e) {
        return res.status(500).json({ message: "An internal server error occurred." });
    }
});

router.patch("/:id/status",authenticateToken,authorizeStatus,authorizeRole(['ADMIN']),(req,res)=>{

     try{

        const userId=parseInt(req.params.id);
        const {status}=req.body;

        const updateStatusSql=`UPDATE users set status=? where id= ?`;

        const possibleStatus=["ACTIVE","INACTIVE"];

        if(!possibleStatus.includes(status)){
            return res.status(400).json({message:"Invalid user status"})
        }

        db.run(updateStatusSql,[status,userId],(err)=>{
            if(err) return res.status(500).json({message:err.message});
            
            return res.status(200).json({ message: "Status updated to " + status });

        })

     }
     catch(e){
        return res.status(500).json({message:"An Internal server error"});
     }

})



module.exports= router;
const db= require("../config/db");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken=async(req,res,next)=>{

    const authHeader= req.headers["authorization"];
    const token= authHeader;
    console.log(token);

    if(!token){
        return res.status(401).json({message:"Access denied. No token provided."});
    }


    jwt.verify(token,JWT_SECRET,(err,decordedUser)=>{

        if(err){

            return res.status(403).json({message:"invalid token or token expired"});  
        }

         req.user=decordedUser;

            next();
    });
}


const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
       
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: "Forbidden: You do not have permission to perform this action." 
            });
        }
        next();
    };
};

const authorizeStatus= async(req,res,next)=>{

    const userId=req.user.id;
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Authentication required." });
    }

    db.get(`SELECT status FROM users WHERE id=?`,[userId],(err,data)=>{
        if(err) res.status(500).json({message:"An Internal server error occured!"})

        if(!req.user || !data || data.status!="ACTIVE"){
            return res.status(403).json({
                message:"Access denied. Your Account is InActive"
            })
        }
        
        next();
    })

}

module.exports ={authenticateToken,authorizeStatus,authorizeRole};
const express = require("express");
const db= require("../config/db");
const router= express.Router();

const {authenticateToken,authorizeStatus,authorizeRole}= require("../middleware/auth.middleware"); 

router.post("", authenticateToken,authorizeStatus, authorizeRole(["ADMIN"]), (req, res) => {
    try {
        const { record } = req.body;

        if (!record) {
            return res.status(400).json({ message: "The record data was empty" });
        }

        const { amount, type, category, date, notes } = record;

        if (!amount || isNaN(amount)) {
            return res.status(400).json({ message: "A valid numeric amount is required." });
        }
        if (!type || !["INCOME", "EXPENSE"].includes(type.toUpperCase())) {
            return res.status(400).json({ message: "Type must be either 'INCOME' or 'EXPENSE'." });
        }
        if (!category || !date) {
            return res.status(400).json({ message: "Category and date are required fields." });
        }

        const postRecordSql = `INSERT INTO transactionRecord (amount, type, category, date, notes, created_by) VALUES (?, ?, ?, ?, ?, ?)`;
        const values = [amount, type.toUpperCase(), category.toUpperCase(), date, notes || "", req.user.id];
        

        db.run(postRecordSql, values, function(err) {
            if (err) {
                
                return res.status(500).json({ message: "Database error while saving the new  record." });
            }

            return res.status(201).json({
                message: "Record successfully created",
                data: {
                    id: this.lastID, 
                    amount,
                    type: type.toUpperCase(),
                    category,
                    date,
                    notes,
                    created_by: req.user.id
                }
            });
        });

    } catch (e) {
        return res.status(500).json({ message: "An internal server error occurred." });
    }
});

router.get("/", authenticateToken, authorizeStatus, authorizeRole(['ADMIN', 'ANALYST', 'VIEWER']), (req, res) => {
    try {
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

       
        const { type, category, date } = req.query;

        
        let getRecordSql = `SELECT * FROM transactionRecord`;
        const conditions = [];
        const values = [];

        
        if (type) {
            conditions.push(`type = ?`);
            values.push(type.toUpperCase());
        }

        if (category) {
            conditions.push(`category = ?`);
            values.push(category.toUpperCase());
        }

        if (date) {
            conditions.push(`date = ?`);
            values.push(date); 
        }

        
        if (conditions.length > 0) {
            
            getRecordSql += ` WHERE ` + conditions.join(` AND `);
        }

        
        getRecordSql += ` ORDER BY date DESC LIMIT ? OFFSET ?`;
        values.push(limit, offset);

        db.all(getRecordSql, values, (err, rows) => {
            if (err) {
                console.error("[DB Error]:", err.message);
                return res.status(500).json({ message: "Database error while fetching data" });
            }

            return res.status(200).json({
                message: "Records successfully retrieved",
                meta: {
                    page,
                    limit,
                    filters_applied: {
                        type: type || null,
                        category: category || null,
                        date: date || null
                    }
                },
                data: rows
            });
        });

    } catch (e) {
        
        return res.status(500).json({ message: "An internal server error occurred" });
    }
});
router.put("/:id",authenticateToken,authorizeStatus,authorizeRole(['ADMIN']),(req,res)=>{
    try{

        const recordId=parseInt(req.params.id);
        const {updatedRecord}= req.body;
        if (!recordId || isNaN(recordId)) {
            return res.status(400).json({ message: "A valid record ID is required." });
        }
        if(!updatedRecord){
            return res.status(400).json({message:"Updated record details is empty"});
        }
        const { amount, type, category, date, notes } = updatedRecord;

        if (!amount || isNaN(amount)) {
            return res.status(400).json({ message: "A valid numeric amount is required." });
        }
        if (!type || !["INCOME", "EXPENSE"].includes(type.toUpperCase())) {
            return res.status(400).json({ message: "Type must be either 'INCOME' or 'EXPENSE'." });
        }
        if (!category || !date) {
            return res.status(400).json({ message: "Category and date are required fields." });
        }

        

        const updateRecordSql=`update transactionRecord set amount =? ,type=?,category=?,date=?,notes=? where id=?`;
        const values=[ amount, type.toUpperCase(), category.toUpperCase(), date, notes,recordId];

        db.run(updateRecordSql,values,function(err){
            if(err) return res.status(500).json({message:"Error while update the data in database"});

            if (this.changes === 0) {
                return res.status(404).json({ message: "Transaction record not found." });
            }

           return res.status(200).json({ 
                message: "The transaction record was successfully updated.",
                data: {
                    id: recordId,
                    amount,
                    type: type.toUpperCase(),
                    category: category.toUpperCase(),
                    date,
                    notes
                }
            });

        })

    }
    catch(e){
        return res.status(500).json({message:"An internal server error"});
    }
})

router.delete("/:id",authenticateToken,authorizeStatus,authorizeRole(['ADMIN']),(req,res)=>{
    try{

        const recordId=parseInt(req.params.id);
       
        if (!recordId || isNaN(recordId)) {
            return res.status(400).json({ message: "A valid record ID is required." });
        }
       
        

        const deleteRecordSql=`delete from  transactionRecord where id=?`;
        

        db.run(deleteRecordSql,[recordId],function(err){
            if(err) return res.status(500).json({message:"Error while delete the data in database"});

            if (this.changes === 0) {
                return res.status(404).json({ message: "Transaction record not found." });
            }

           return res.status(200).json({ 
                message: "The transaction record was successfully deleted.",
                
            });

        })

    }
    catch(e){
        return res.status(500).json({message:"An internal server error"});
    }
})



module.exports=router;


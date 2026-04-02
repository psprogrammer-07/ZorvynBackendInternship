const express = require('express');
const app = express();
app.use(express.json());
const db = require('./config/db'); 
const path=require("path");
const PORT = process.env.PORT || 3000;


const userRouter= require("./routes/user.routes");
app.use("/users",userRouter);

app.get("",(req,res)=>{
    res.send({
        name:"hello",
        age:20
    })
})

// app.get('/users', (req, res) => {
//     db.all('SELECT id, name, email, role, status FROM users', [], (err, rows) => {
//         if (err) {
//             return res.status(500).json({ error: err.message });
//         }
//         res.json({ data: rows });
//     });
// });

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
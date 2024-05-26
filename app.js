const express = require('express');
require('dotenv').config();
const Dbconnection = require('./DBConnection/Dbconnection')
const router = require('./Routes/Routes')

const app = express();
app.use(express.json())


app.get('/' , (req,res)=>{
   res.send("home page")
})

app.use('/users',router)

app.listen(process.env.PORT , (err)=>{
    if(err){
        console.log(err);
    }
    console.log("listening to the port " + process.env.PORT)
    Dbconnection()
}) 

module.exports = app;
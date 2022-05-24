const express = require('express')
const route =  require('./routes/route')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app =express()

const multer= require("multer");
app.use( multer().any())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb+srv://SatyamRandawa:Loveyam@cluster0.b5j1p.mongodb.net/?retryWrites=true&w=majority" ,
 { useNewUrlParser: true})
 
.then(() => {
    console.log("MongoDb connected")
}).catch((err) => {
    console.log(err.message)
});

app.use('/' , route);

app.listen( process.env.Port || 3000 ,function(){
    console.log('App running on port ' + (process.env.PORT || 3000))
});

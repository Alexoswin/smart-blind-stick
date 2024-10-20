const mongoose = require("mongoose");

mongoose.connect('mongodb+srv://oswin:oswinalex@cluster0.7mnzpn3.mongodb.net/?retryWrites=true&w=majority&dbname=newtest')
.then(()=>{
    console.log("mongodb collection  connected")

})
.catch(()=>{
    
    console.log('failed to connect mongo collection ')
})

const mapdata = new mongoose.Schema({

     lat:{

        type:Number,
        required: true

     },
     long:{

        type: Number,
        required : true
     },

     id:{
        type: Number,
        required : true,
         unique : false
     }
})

const locations = mongoose.model("locations", mapdata);
module.exports= locations;


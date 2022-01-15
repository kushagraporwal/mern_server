const mongoose= require('mongoose');
const userschema= new mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    mobile:{
        type: Number,
        max:9999999999,
        min:1000000000,
        required: true
    },
    email:{
        type: String,
        required: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    address:{
        type: String,
        required: true
    }
})

const User= mongoose.model('User', userschema);
module.exports=User;


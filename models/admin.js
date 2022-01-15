const mongoose= require('mongoose');
const jwt= require('jsonwebtoken');
const SECRET_KEY= 'MYNAMEISKUSHAGRAPORWALIIITPUNESTUDENT';

const adminschema= new mongoose.Schema({
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    tokens:[
        {
            token:{
                type: String,
                required: true
            }
        }
    ]
})

adminschema.methods.generateAuthToken= async function(){
    try{
        let token= jwt.sign({_id: this._id}, SECRET_KEY);
        this.tokens= this.tokens.concat({token: token});
        await this.save();
        return token;
    }
    catch(err){
        console.log(err);
    }
}
const Admin= mongoose.model('Admin', adminschema);
module.exports=Admin;
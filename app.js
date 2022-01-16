const express =require('express');
const mongoose= require('mongoose');
const dotenv= require('dotenv');
const app= express();
const User= require('./models/user');
const Admin= require('./models/admin');
const jwt= require('jsonwebtoken');
const bodyParser = require("body-parser");
const methodoverride = require('method-override');
const cookieParser = require('cookie-parser');
const cors= require('cors');

dotenv.config({path: './config.env'});

const DB= 'mongodb+srv://kushagra:kushagra@cluster0.y7dmu.mongodb.net/nemesis?retryWrites=true&w=majority';
const PORT= process.env.PORT || 8000;
mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()=>{
    console.log('connection successfull');
}).catch((err)=> console.log(err));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.urlencoded({extended: true}));
app.use(methodoverride('_method'));
app.use(cookieParser());

app.use(cors({credentials: true, origin: 'https://affectionate-mcnulty-067fb0.netlify.app'}));

const authenticate= async(req, res, next)=>{
    try{
        const token= req.cookies.jwtoken;
        console.log("token is "+token);
        const verifytoken= jwt.verify(token, process.env.SECRET_KEY);
        const rootuser= await Admin.findOne({_id: verifytoken._id, "tokens.token": token});
        if(!rootuser){
            throw new Error('User not found')
        }
        req.token=token;
        req.rootuser=rootuser;
        req.userID=rootuser._id;
        next();
    }
    catch(err){
        res.status(401).send('-2');
        console.log(err);
    }
}

app.get('/',(req,res)=>{
    res.send('Hello get');
})

app.get('/home1', authenticate, async(req,res)=>{
    try{
        const users= await User.find();
        res.send(users);
    }
    catch(err){
        console.log(err);
    }
    
})

app.post('/login1', async(req,res)=>{
    try{
        let token;
        console.log("req is "+req.body);
    const {email, password}  = req.body;
    console.log("email "+email);
    console.log("password "+password);
    if(!email || !password){
        return res.status(400).json({error:"Please fill the data"});
    }

    const resp= await Admin.findOne({email: email});
    if(!resp){
        res.status(400).json({error: "Invalid Credentials"});
        console.log("one");
    }
    else{
        token= await resp.generateAuthToken();
        console.log("token "+token);

        res.cookie("jwtoken", token,{
            expires: new Date(Date.now()+ 300000),
            sameSite :'none',
            secure:true
        });

        console.log("token cookie is "+res.cookie);
        if(password==resp.password){
            res.json({message: "User login successfully"});
        }
        else{
            res.status(400).json({error: "Invalid Credentials"});
            console.log("two");
        }
    }
}
catch(err){
    console.log(err);
}
})

app.post('/register', async(req,res)=>{
    const {username, email, mobile, address}  = req.body;
    if(!username || !email || !mobile || !address){
        return res.status(422).json({error:"Please fill the field properly"});
    }
    try{
    const resp= await User.findOne({username: username})
    if(resp){
        return res.status(422).json({error:"Username already exist"});
    }
    const user= new User({username, email, mobile, address});
    const userregister= await user.save();
    if(userregister){
        res.status(201).json({message:"User register successfully"});
    }
    else{
        res.status(500).json({error:"Fail to register"});
    }
}
catch(err){
    res.send("-2");
    //console.log(err)
}
});

app.delete('/decline1/:id',async(req,res)=>{
    try{
        const id=req.params.id;
        const users= await User.deleteOne({_id: id});
        console.log("deleted is "+users);
        res.send(users);
    }
    catch(err){
        console.log(err);
    }
    
})

app.listen(PORT, ()=>{
    console.log(`Server running at port ${PORT}`);
})
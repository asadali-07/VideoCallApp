const User=require('../models/userSchema');
const bcrypt=require("bcrypt")
const crypto=require("crypto");
module.exports.register = async(req,res)=>{
    let {name,username,password}=req.body;
    try{
     password= await bcrypt.hash(password,12)
    if(!name ||!username ||!password){
        return res.status(400).json({message: "All fields are required"});
    }
    const user= await User.findOne({username:username});
    console.log(user);
    if(user){
        return res.status(400).json({message: "Username already exists"});
    }
    const newUser=new User({name,username,password});
    await newUser.save();
    res.status(201).json({message: "User registered successfully"});
    }catch(err ){
        console.error(err);
        res.status(500).json({message: "Server error"});
    }
}

module.exports.login = async(req,res)=>{
    let {username,password}=req.body;
    try{
        if(!username || !password){
            return res.status(400).json({message: "All fields are required"});
        }
        const user=await User.findOne({username:username});
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(401).json({message: "Incorrect password"});
        }
        const token=await crypto.randomBytes(20).toString("hex");
        user.token=token;
        await user.save();
        res.json({message: "User logged in successfully",token});
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Server error"});
    }
}
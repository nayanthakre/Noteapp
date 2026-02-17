import { verifyMail } from "../emailVerify/verifyMail.js";
import { User } from "../models/userModel.js";
import { Session } from "../models/sessionModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser=async(req,res)=>{
    try{
        const {username,email,password}=req.body;
        if(!username || !email || !password){
            return res.status(400).json({message:'All fields are required',success:false})
        }
        const exisitngUser=await User.findOne({email});
        if(exisitngUser){
            return res.status(400).json({message:'User already exists',success:false})
        }
        const hashedPassword=await bcrypt.hash(password,10); // You should hash the password before saving it to the database

        const newUser=await User.create({username,email,password:hashedPassword});

        const TokenExpiredError=await jwt.sign({id:newUser._id},process.env.JWT_SECRET_KEY,{expiresIn:'10m'});
        verifyMail(TokenExpiredError,email)
        newUser.token=TokenExpiredError;
        await newUser.save();
        return res.status(201).json({message:'User registered successfully',success:true,user:newUser})
    }catch(error){
        return res.stastus(500).json({message:'Internal Server Error',sucess:false  })
    }
}

export const verifyUser=async(req,res)=>{
    try {
        const  authHeader=req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({message:'Authorization token is missing or invalid',success:false})
        }
        const token=authHeader.split(' ')[1];
        let decoded;
        try{
            decoded=jwt.verify(token,process.env.JWT_SECRET_KEY);
        }catch(e){
             if(e.name === 'TokenExpiredError'){
            return res.status(400).json({message:'Token has expired',success:false})
        }
        return res.status(400).json({message:'token verfication failed',success:false})    
        }
        const user=await User.findById(decoded.id);
        if(!user){
            return res.status(404).json({message:'User not found',success:false})
        }
        user.token=null;
        user.isvarified=true;
        await user.save();
        return res.status(200).json({message:'Email verified successfully',success:true})
    }catch (error) {
       return res.status(500).json({message:'Internal Server Error',success:false})

    }
}


export const loginUser=async(req,res)=>{
    try{
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(400).json({message:'All fields are required',success:false})
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'unothorized access', success: false });
        }
        const passwrodCheck=await bcrypt.compare(password,user.password);
        if(!passwrodCheck){
            return res.status(402).json({message:'Incorrect password',success:false})
        }
        //check if user is verified
        if (!user.isvarified) {
            return res.status(403).json({message:'Please verify your email before logging in',success:false})
        }
        //check for exisiting session and delet it 
        const existingSession=await Session.findOne({userId:user._id});
        if(existingSession){
            await Session.deleteOne({userId:user._id});
        }

        //create new session
        await Session.create({userId:user._id});

        //generate JWT token
        const acessToken=jwt.sign({id:user._id},process.env.JWT_SECRET_KEY,{expiresIn:'10d'});  
        const refreshToken=jwt.sign({id:user._id},process.env.JWT_SECRET_KEY,{expiresIn:'30d'});

        user.isLoggedIn=true;
        await user.save();
        return res.status(200).json({message:`welcome back ${user.username}`,success:true,acessToken,refreshToken})
    }catch(error){
        return res.status(500).json({message:'Internal Server Error',success:false}) 
    }
}
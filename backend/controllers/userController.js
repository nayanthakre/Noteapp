import { verifyMail } from "../emailVerify/verifyMail.js";
import { User } from "../models/userModel.js";
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
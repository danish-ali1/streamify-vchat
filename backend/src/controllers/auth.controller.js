import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { upsertStreamUser } from '../lib/stream.js';

export const signup=async(req,res)=>{
    const {email,password,fullName}=req.body;
    try {
        if(!email || !password || !fullName){
            return res.status(400).json({message:"All fields are required"});
        }
         const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"Email already exists"});
        }
        if(password.length<6){
            return res.status(400).json({message:"Password must be at least 6 characters"});
        }
        const idx= Math.floor(Math.random()*100)+1;
        const randomAvatar=`https://avatar.iran.liara.run/public/${idx}.png`;
        const newUser= await User.create({
            email,
            password,
            fullName,
            profilePic:randomAvatar
        });

        try {
            await upsertStreamUser({
                id:newUser._id.toString(),
                name:newUser.fullName,
                image:newUser.profilePic
            });
            console.log(`Stream user created for ${newUser.fullName}`);
        } catch (error) {
            console.error("Error upserting Stream user:", error);
        }
        const token=jwt.sign({id:newUser._id},process.env.JWT_SECRET,{expiresIn:'7d'});
        res.cookie('token',token,{
            maxAge:7*24*60*60*1000,
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
        });
        res.status(201).json({
            message:"User created successfully",
            user:newUser,
            token
        });
    } catch (error) {
        res.status(500).json({message:"Internal server error"});
    }
    
}

export const login=async(req,res)=>{
    try {
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(400).json({message:"All fields are required"});
        }
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid emaiul or password"});
        }
        const isPasswordValid=await user.comparePassword(password);
        if(!isPasswordValid){
            return res.status(400).json({message:"Invalid email or password"});
        }
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
        res.cookie('token',token,{
            maxAge:7*24*60*60*1000,
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
        });
        res.status(200).json({
            message:"Login successful",
            user,
            token
        });
    } catch (error) {
        res.status(500).json({message:"Internal server error"});
    }
}

export const logout=(req,res)=>{
    res.clearCookie('token');
    res.status(200).json({success:true,message:"Logout successful"});
}

export const onboard=async(req,res)=>{
    try {
        const userId=req.user._id;
        const {fullName,bio,nativeLanguage,learningLanguage,location}=req.body;
        if(!fullName || !bio || !nativeLanguage || !learningLanguage || !location){
            return res.status(400).json({message:"All fields are required"});
        }
        const updatedUser=await User.findByIdAndUpdate(userId,{
            ...req.body,
            isOnboarded:true
        },{new:true});
        if(!updatedUser){
            return res.status(404).json({message:"User not found"});
        }
        try{
            await upsertStreamUser({
                id:updatedUser._id.toString(),
                name:updatedUser.fullName,
                image:updatedUser.profilePic
            });
        } catch (error) {
            console.error("Error upserting Stream user during onboarding:", error);
        }
        res.status(200).json({message:"User onboarded successfully", user:updatedUser}); 
    } catch (error) {
        res.status(500).json({message:"Internal server error"});
    }
}
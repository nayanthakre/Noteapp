import mongoose from 'mongoose';



const conneectDB=async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/note-app`)
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.log('mangoDB connection error',error);
    }
}

export default conneectDB;
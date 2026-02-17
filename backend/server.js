import express from 'express';
import 'dotenv/config';
import conneectDB from './database/db.js';
import userRoute from './router/userRoute.js';

const app = express();

const PORT =process.env.PORT || 3000;

//middleware
app.use(express.json());

app.use('/user',userRoute);


app.listen(PORT,()=>{
    conneectDB();
    console.log(`Server is running on port ${PORT}`);
})
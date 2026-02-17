import nodemailer from "nodemailer";
import 'dotenv/config.js';
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import handlebars from "handlebars";


const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);

export const verifyMail=async(token,email)=>{


const verifyUrl = `http://localhost:3000/user/verify/${token}`;

const templatePath = path.join(__dirname, "template.hbs");
const templateSource = fs.readFileSync(templatePath, "utf8");
const template = handlebars.compile(templateSource);
const html = template({ verifyUrl });


const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.MAIL_USER,
        pass:process.env.MAIL_PASS
    }
})
const mailConfig={
    from:process.env.MAIL_USER,
    to:email,  
subject:'Email Verification',
html


}
const info = await transporter.sendMail(mailConfig);
console.log('Email sent sucesfully ' + info.response);
}
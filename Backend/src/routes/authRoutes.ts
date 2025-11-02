import { Router } from "express";
import { signinSchema, userSchema } from "../types";
import { success } from "zod";
import jwt from "jsonwebtoken";
import { TOTP } from "totp-generator"
import base32 from "hi-base32";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const router = Router();

router.post("/initiate_signin", async (req, res) => {
    try {
        const {success, data} = userSchema.safeParse(req.body);
        if(!success) {
            res.status(411).json({
                message: "Internal server error"
            })
            return;
        }
        const email = data?.email;

        console.log(email);

        const { otp, expires } = await TOTP.generate(base32.encode(email + process.env.JWT_SECRET!), { period: 300 });

        // We will then send the otp via mail for now lets console log it
        console.log(`The otp to login is : ${otp}`);
        try {
            const existingUser = await prisma.user.findUnique({
                where: {
                    email: data.email
                }
            });
            if(existingUser) {
                console.log("User already exists");
                res.json({
                    otp,
                    message: `The otp to login is : ${otp}`,
                    success: true
                })
                return;
            }
            await prisma.user.create({
                data: {
                    email: data.email
                }
            })
            console.log("User created");
        } catch (error) {
            res.status(500).send("Internal db error");
        }
        res.json({
            otp,
            message: `The otp to login is : ${otp}`,
            success: true
        })

        
    } catch (error) {
        res.json({
            message: "Internal server error",
            success: false
        })
    }
});

router.post("/signin", async (req, res) => {
    const {success, data} = signinSchema.safeParse(req.body);
    if(!success) {
        res.status(411).send("Invalid user response");
        return;
    }
    const userOtp = data.otp;
    const email = data.email;
    const user = await prisma.user.findUnique({
        where: {
            email: data.email
        }
    });

    if(!user) {
        res.json({
            message: "The user is not found in the database",
            success: false
        })
        return;
    }

    const {otp, expires} = await TOTP.generate(base32.encode(email + process.env.JWT_SECRET), {period: 300});
    if(otp != userOtp) {
        res.json({
            message: "Invalid otp",
            success: false
        })
        return;
    }

    const token = jwt.sign({
        userId: user.id,
        email
    }, process.env.JWT_SECRET!);

    res.json({
        token,
        success: true
    })
});

router.post("/login", (req, res) => {
    
});
export default router;
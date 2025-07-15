import express, { Request, Response, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { User } from "../database";
import {encryptPassword, isPasswordMatch } from "../utils";
import config from "../config/config";
import { IUser } from "../database";

const jwtSecret = config.JWT_SECRET as string;
const COOKIE_EXPIRATION_DAYS = 90; // cookie expiration in days
const expirationDate = new Date(
    Date.now() + COOKIE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000
);
const cookieOptions = {
    expires: expirationDate,
    secure: false,
    httpOnly: true,
};

const register: RequestHandler = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400).json({
            status: 400,
            message:"User already exists!"
        });
            return;
        }

        const user = await User.create({
            name,
            email,
            password: await encryptPassword(password),
        });

        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
        };

        res.json({
            status: 200,
            message: "User registered successfully!",
            data: userData,
        });
    } catch (error: any) {
        res.json({
            status: 500,
            message: error.message,
        });
    }
};

const createSendToken = async (user: IUser, res: Response) => {
    const { name, email, id } = user;
    const token = jwt.sign({ name, email, id }, jwtSecret, {
        expiresIn: "1d",
    });
    if (config.env === "production") cookieOptions.secure = true;
    res.cookie("jwt", token, cookieOptions);

    return token;
};

const login: RequestHandler = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+password");
        if ( !user || !(await isPasswordMatch(password, user.password as string))) 
        {
            res.status(400).json({
                status: 400,
                message:"Incorrect email or password"
            });

            return;
        }

        const token = await createSendToken(user!, res);

        res.json({
            status: 200,
            message: "User logged in successfully!",
            token,
        });
    } catch (error: any) {
        res.json({
            status: 500,
            message: error.message,
        });
    }
};

export default { register, login };
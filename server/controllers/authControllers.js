import prisma from '../lib/prisma.js'
import { generateToken } from '../middleware/generateToken.js';
import bcrypt from 'bcryptjs'

/* ----- Login User ----- */
export const loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // 1. Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // 2. Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // 3. Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // 4. Create JWT token
        const token = generateToken(user, res)

        // 5. Remove sensitive data
        const { password: _, ...safeUser } = user;

        // 6. Send response
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: safeUser,
        });

    } catch (err) {
        next(err);
    }
};

/* ----- Logout User ----- */
export const logoutUser = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    return res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
};

/* ----- Profile ----- */
export const getProfile = async (req, res, next) => {
    const userId = req.userId;

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                employeeId: true,
                branchId: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: user,
        });

    } catch (error) {
        next(error);
    }
};



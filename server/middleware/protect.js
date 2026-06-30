import jwt from "jsonwebtoken";

/* ----- Protect Routes Middleware ----- */
export const protect = (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, no token",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = decoded.id;
        req.userRole = decoded.role; // optional if you include role in JWT

        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, token failed",
        });
    }
};
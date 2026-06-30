import prisma from '../lib/prisma.js'

/* ----- Create Branch ----- */
export const createBranchController = async (req, res, next) => {
    const { name, code } = req.body;

    try {
        // Validate input
        if (!name || !code) {
            return res.status(400).json({
                success: false,
                message: "Branch name and code are required.",
            });
        }

        // Check if branch already exists
        const existingBranch = await prisma.branch.findFirst({
            where: {
                OR: [
                    { name },
                    { code },
                ],
            },
        });

        if (existingBranch) {
            return res.status(409).json({
                success: false,
                message: "A branch with this code or email already exists.",
            });
        }

        // Create branch
        const branch = await prisma.branch.create({
            data: {
                name,
                code,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Branch created successfully.",
            data: branch,
        });
    } catch (error) {
        next(error);
    }
};

/* -----  ----- */
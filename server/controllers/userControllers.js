import prisma from '../lib/prisma.js'
import { generateToken } from '../middleware/generateToken.js';
import bcrypt from 'bcryptjs'



/* ----- Create Branch ----- */
export const createBranch = async (req, res, next) => {
  const { name, code } = req.body;
  const userId = req.userId;

  try {
    // Basic validation
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Branch name and code are required.",
      });
    }

    // Check current user
    const currentUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only Super Admins can create branches.",
      });
    }

    // Check duplicate branch code
    const existingBranch = await prisma.branch.findUnique({
      where: {
        code,
      },
      select: {
        id: true,
      },
    });

    if (existingBranch) {
      return res.status(409).json({
        success: false,
        message: "A branch with this code already exists.",
      });
    }

    // Create branch
    const branch = await prisma.branch.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Branch created successfully.",
      data: branch,
    });
  } catch (err) {
    next(err);
  }
};

/* ----- Create Admin ----- */
export const createAdmin = async (req, res, next) => {
  const { name, email, password, branchId } = req.body;
  const userId = req.userId;

  try {
    // Basic validation
    if (!name || !email || !password || !branchId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Check current user
    const currentUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only Super Admins can create admins.",
      });
    }

    // Check duplicate email
    const existingAdmin = await prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
      },
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "An admin with this email already exists.",
      });
    }

    // Create admin
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: "ADMIN",
        branchId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Admin created successfully.",
      data: admin,
    });
  } catch (err) {
    next(err);
  }
};

/* ----- Create Consultant ----- */
export const createConsultant = async (req, res, next) => {
    const { name, email, employeeId, password } = req.body
    const  userId  = req.userId

    try{
        const admin = await prisma.user.findUnique({
            where : {
                id : userId
            }
        })

        if (!admin || admin.role !== 'ADMIN') {
            return res.status(403).json({ 
                error: 'Access denied. Only admins can create consultants.' 
            })
        }

        const existingConsultant = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (existingConsultant) {
            return res.status(400).json({ 
                error: 'A consultant with this email already exists.' 
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const consultant = await prisma.user.create({
            data: {
                name,
                email,
                employeeId,
                password: hashedPassword,
                role: "CONSULTANT",
                branchId: admin.branchId
            }
        })

        res.status(201).json({
            success: true,
            message: "Consultant created successfully",
            data: consultant
        });
    }catch(err){
        next(err)
    }
};

/* ----- Get All Consultants ----- */
export const getAllConsultants = async (req, res, next) => {
    const userId = req.userId
    try {
        const admin = await prisma.user.findUnique({
            where : {
                id : userId,
            }
        })

        if (!admin || admin.role !== 'ADMIN') {
            return res.status(403).json({ 
                error: 'Access denied. Only admins can view consultants.' 
            })
        }   

        const consultants = await prisma.user.findMany({
            where: {
                role: 'CONSULTANT',
                branchId: admin.branchId
            }
        })  

        res.status(200).json({
            success: true,
            message: "Consultants retrieved successfully",
            data: consultants
        });
    }catch(err){
        next(err)
    }
}

/* ----- Get All Admins ----- */
export const getAllAdmins = async (req, res, next) => {
    const userId = req.userId
    try {
        const superAdmin = await prisma.user.findUnique({
            where : {
                id : userId,
            }
        })  

        if (!superAdmin || superAdmin.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ 
                error: 'Access denied. Only super admins can view other admins.' 
            })
        }

        const admins = await prisma.user.findMany({
            where: {
                role: 'ADMIN'
            }
        })

        res.status(200).json({
            success: true,
            message: "Admins retrieved successfully",
            data: admins
        });
    }catch(err){
        next(err)
    }   
}

/* ----- Get All Branches ----- */
export const getAllBranches = async (req, res, next) => {
    try {
        const branches = await prisma.branch.findMany()
        res.status(200).json({
            success: true,
            message: "Branches retrieved successfully",
            data: branches
        });
    }catch(err){
        next(err)
    }
}

/* ----- Get Branch By ID ----- */
export const getBranchById = async (req, res, next) => {
    const { branchId } = req.params;

    try {
        const branch = await prisma.branch.findUnique({
            where: {
                id: branchId,
            },
        });

        if (!branch) {
            return res.status(404).json({
                success: false,
                message: "Branch not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: branch,
        });
    } catch (err) {
        next(err);
    }
};

/* ----- Search / Get All Branches ----- */
export const getBranches = async (req, res, next) => {
    const { search } = req.query;

    try {
        const branches = await prisma.branch.findMany({
            where: search
                ? {
                      OR: [
                          {
                              name: {
                                  contains: search,
                                  mode: "insensitive",
                              },
                          },
                          {
                              code: {
                                  contains: search,
                                  mode: "insensitive",
                              },
                          },
                      ],
                  }
                : undefined,
        });

        return res.status(200).json({
            success: true,
            data: branches,
        });
    } catch (err) {
        next(err);
    }
};
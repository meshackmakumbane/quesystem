import { broadcast } from '../websocket/websocket.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/* ----- Create Ticket ----- */
const QUERY_PREFIX = {
  Transact: "T",
  Loan: "L",
  Insurance: "I",
  Business: "B",
  Life: "O",
};

export const createTicket = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        message: "Query is required",
      });
    }

    const count = await prisma.ticket.count();
    const number = count + 1;

    const prefix = QUERY_PREFIX[query] || "G";

    const ticket = await prisma.ticket.create({
      data: {
        query,
        ticketNumber: `${prefix}${number.toString().padStart(3, "0")}`,
        status: "QUEUED",
      },
    });

    broadcast({
      type: "ticket_created",
      payload: ticket,
    });

    return res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticket,
    });
  } catch (err) {
    next(err);
  }
};

/* ----- Get All Tickets ----- */
export const getAlltickets = async (req, res, next) => {
    const { userId } = req.userId
    try {
        const admin = await prisma.user.findUnique({
            where : {
                id : userId,
                role: 'admin'
            }
        })

        if(!admin){
            return res.json({
                success: false,
                message: "Unathorised Access"
            })
        }

        const tickets = await prisma.ticket.findMany()

        res.json({
            success:true,
            tickets
        })
    } catch (error) {
        next(error)
    }
}

/* ----- Get Next Ticket ----- */
export const nextTicketController = async (req, res, next) => {
    const { station } = req.user.station
    try {
        const ticket = await prisma.ticket.findFirst({
            where:{
                status: 'QUEUED'
            },
            include:{
                query
            }
        })

        if(station === 'ticket.query'){
            
        }
    } catch (error) {
        next(error)
    }
}
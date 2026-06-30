import express from 'express'
const router = express.Router()
//getTickets, getTicketById, updateTicket, deleteTicket

import { createTicket,  } from '../controllers/ticketControllers.js'

router.post('/ticket', createTicket )

export default router
import express from 'express';
import { createOrder, getOrders, getQuote, updateOrder } from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.post("/",createOrder)
orderRouter.get("/",getOrders)
orderRouter.post("/quote",getQuote)
orderRouter.post("/:orderId",updateOrder)

export default orderRouter;
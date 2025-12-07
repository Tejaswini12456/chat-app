import express from 'express';
import { protect } from '../middleware/auth.js';
import { getAllMessages, getUserForSidebar, markMessagesAsSeen, sendMessage } from '../controllers/messagecontroller.js';
const messagerouter=express.Router();
messagerouter.get("/users",protect,getUserForSidebar);
messagerouter.get("/:id",protect,getAllMessages);
messagerouter.put("/mark/:id",protect,markMessagesAsSeen);
messagerouter.post("/send/:id",protect,sendMessage);
export default messagerouter;



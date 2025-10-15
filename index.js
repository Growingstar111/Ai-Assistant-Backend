require("dotenv").config();
const express = require('express')
const app = express()
const PORT = process.env.PORT
const cors = require('cors')
const {connectDb} =require('./commonFunction/dbConnection')

app.use(cors());
app.use(express.urlencoded({extended:false}))
app.use(express.json())

// Add compression for better performance
const compression = require('compression');
app.use(compression());

const userRouter = require('./routes/user')
const conversationRouter = require('./routes/conversation')
const assistantRouter = require('./routes/assistant')

app.use('/api/user', userRouter);
app.use('/api/chat', conversationRouter);
app.use('/api/assistant' , assistantRouter);


connectDb(process.env.MONGODB_URL);

app.listen( PORT, ()=>{
    console.log(`Server is running on port ${PORT}`); 
})
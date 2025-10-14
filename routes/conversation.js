const express = require('express')
const auth = require('../middleware/auth')
const { chatWithAi, getAllChats, deleteHistory } = require('../controller/conversation')



const  router = express.Router()

router.post('/ai', auth,   chatWithAi )

router.get('/history' ,auth,  getAllChats )

router.delete('/delete/history' ,auth,  deleteHistory )

module.exports = router
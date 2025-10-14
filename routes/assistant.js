const express = require('express')
const auth = require('../middleware/auth')

const { setUpAssistant, askToAssistant } = require('../controller/assistant')

const  router = express.Router()

router.post('/setup/assistant', auth,  setUpAssistant  )

router.post('/talk/assistant' ,auth, askToAssistant  )

module.exports = router
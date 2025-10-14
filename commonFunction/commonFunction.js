
const otpGenrator  = require('otp-generator')

const generatedotp  = ()=>
   otpGenrator.generate(4,{
     upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
})

module.exports = {generatedotp}
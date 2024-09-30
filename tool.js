const fs = require("fs")
const { executeLuckyMoney } = require("./executeLuckMoney.js")
const { executelottering } = require("./executeLottering.js")

//readflie input
let usernames = fs.readFileSync("./username.txt", 'utf-8').split("\r\n")
let passWords = fs.readFileSync("./password.txt", "utf-8").split("\n\n")

//read file lixi
let data = fs.readFileSync("./lixi.txt", "utf-8").split("\n")


//run luckymoney
let quantityOfThreadLuckyMoney = 5

// executeLuckyMoney(usernames, passWords, quantityOfThreadLuckyMoney)
executelottering
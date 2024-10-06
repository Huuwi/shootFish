const fs = require("fs")
const { executeLuckyMoney } = require("./executeLuckMoney.js")
const { executeLottering } = require("./executeLottering.js")
const Services = require("./services.js")

//readflie input
let usernames = fs.readFileSync("./username.txt", 'utf-8').split("\r\n")
let passWords = fs.readFileSync("./password.txt", "utf-8").split("\r\n")



//read file lixi
let data = fs.readFileSync("./lixi.txt", "utf-8").split("\n")


//run luckymoney
let quantityOfThreadLuckyMoney = 15
let quantityOfThreadLottering = 5
// executeLuckyMoney(usernames, passWords, quantityOfThreadLuckyMoney)
// executeLottering(v = "04e82044a8db56038eabca9b6a42f776", data, quantityOfThreadLottering)
// let services = new Services()
// services.getInforToPayment("tuyenbuooii")
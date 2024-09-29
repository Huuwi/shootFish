const axios = require("axios")
const fs = require("fs")
const Services = require("./services.js")



let usernames = fs.readFileSync("./username.txt", 'utf-8').split("\r\n")


const main1 = async () => {
    let services1 = new Services()
    for (let i = 0; i < Math.floor(usernames.length / 3); i++) {
        await services1.getLuckyMoneys(usernames[i]);
    }

}


const main2 = async () => {
    let services2 = new Services()
    for (let i = Math.floor(usernames.length / 3); i < Math.floor(usernames.length / 3 * 2); i++) {
        await services2.getLuckyMoneys(usernames[i]);
    }

}

const main3 = async () => {
    let services3 = new Services()
    for (let i = Math.floor(usernames.length / 3 * 2); i < usernames.length; i++) {
        await services3.getLuckyMoneys(usernames[i]);
    }
}

main1()
main2()
main3()

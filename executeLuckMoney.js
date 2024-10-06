const Services = require("./services.js")
const chalk = require("chalk")




class RunLuckyMoney {
    constructor({ start, end }) {
        this.services = new Services()
        this.start = start;
        this.end = end;
    }
    async RunLuckyMoney(usernames, passWords) {
        for (let j = this.start; j < this.end; j++) {
            await this.services.getLuckyMoneys(usernames[j], passWords[j] || "123456hg");
        }
    }

}

const executeLuckyMoney = async (usernames, passWords, quantityOfThreadLuckyMoney) => {
    console.log(chalk.blue("starting lucky money...."));

    let subSize = Math.floor(usernames.length / quantityOfThreadLuckyMoney)

    let i = 0
    let sliceArr = []
    while (true) {
        if (i >= usernames.length - subSize || sliceArr.length == quantityOfThreadLuckyMoney - 1) {
            sliceArr.push({
                start: i,
                end: usernames.length
            })
            break
        }
        sliceArr.push({
            start: i,
            end: i + subSize
        })
        i += subSize
    }
    console.log(sliceArr);

    let promises = sliceArr.map(slice => {
        const RunLuckyMoneyInstance = new RunLuckyMoney(slice);
        return RunLuckyMoneyInstance.RunLuckyMoney(usernames, passWords);
    });

    await Promise.all(promises);

    console.log(chalk.greenBright('All tasks completed'));

}

module.exports = { executeLuckyMoney }



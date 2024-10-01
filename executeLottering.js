const Services = require("./services.js")
const chalk = require("chalk")
const fs = require("fs")




class RunLottering {

    static data
    static indexThread = 0

    constructor(objThread, data) {
        RunLottering.data = data;
        this.objThread = objThread;
        this.services = new Services();
        this.indexThred = RunLottering.indexThread;
        RunLottering.indexThread++
    }

    async runLottering(v) {

        //fake


        let indexAccount = this.objThread.start;
        let curNumber = this.objThread.numberStart.indexStart;
        let moneyNeed = this.objThread.numberStart.preLostMoney




        while (indexAccount < this.objThread.end && curNumber < 100) {
            let inforAccount = await this.services.getInforToPayment(RunLottering.data[indexAccount].userName, RunLottering.data[indexAccount].passWord)
            let username = RunLottering.data[indexAccount].userName
            let passWord = RunLottering.data[indexAccount].passWord

            let balance = Math.floor(await this.services.getBlance(inforAccount.headers))
            if (balance <= 0) {
                console.log(chalk.bgRedBright("so du khong du"));

                indexAccount++
                continue;
            }

            while (balance > 0 && curNumber < 100) {
                console.log(chalk.bgCyanBright("username : ", username, " balance : ", balance, " moneyNeed : ", moneyNeed));

                if (balance > moneyNeed) {
                    let pay = await this.services.payment(v, inforAccount, moneyNeed, curNumber)
                    if (pay?.payCheck) {
                        fs.appendFileSync(`./lotteredThread${this.indexThred}.txt`, JSON.stringify({ username, passWord, number: curNumber, amount: moneyNeed }) + "\n")
                        balance = Math.floor(pay.balance);
                        console.log(chalk.bgGreenBright("username : ", username, "vào số : ", curNumber, " số tiền là : ", moneyNeed, " số tiền còn lại là : ", balance));
                        moneyNeed = this.objThread.defaultMoney;
                        curNumber++
                    }

                } else {
                    if (balance == moneyNeed) {
                        let bl = balance
                        let pay = await this.services.payment(v, inforAccount, balance, curNumber)
                        if (pay?.payCheck) {
                            fs.appendFileSync(`./lotteredThread${this.indexThred}.txt`, JSON.stringify({ username, passWord, number: curNumber, amount: balance }) + "\n")
                            moneyNeed = this.objThread.defaultMoney;
                            balance = Math.floor(pay.balance);
                            console.log(chalk.bgGreenBright("username : ", username, "vào số : ", curNumber, " số tiền là : ", bl, " số tiền còn lại là : ", balance));
                            curNumber++
                            indexAccount++
                            break;
                        }
                    } else {
                        if (balance < moneyNeed) {
                            let bl = balance
                            let pay = await this.services.payment(v, inforAccount, balance, curNumber)
                            if (pay?.payCheck) {
                                fs.appendFileSync(`./lotteredThread${this.indexThred}.txt`, JSON.stringify({ username, passWord, number: curNumber, amount: balance }) + "\n")
                                moneyNeed -= balance;
                                balance = Math.floor(pay.balance)
                                console.log(chalk.bgGreenBright("username : ", username, "vào số : ", curNumber, " số tiền là : ", bl, " số tiền còn lại là : ", balance));
                                indexAccount++
                                break;
                            }
                        }
                    }
                }


            }


        }



    }


    async test(v) {
        let indexAccount = this.objThread.start;
        let curNumber = this.objThread.numberStart.indexStart;
        let moneyNeed = this.objThread.numberStart.preLostMoney
        let inforAccount = await this.services.getInforToPayment(RunLottering.data[0].userName, RunLottering.data[0].passWord)
        let username = RunLottering.data[indexAccount].userName
        let pay = await this.services.payment(v, inforAccount, moneyNeed, curNumber)
        console.log(pay);



    }


}


function handleData(data, quantityOfThreadLottering) {

    //filter data
    data = data.map((e) => {
        try {
            return JSON.parse(e)
        } catch (error) {
        }
    }).filter((e) => {
        try {
            return Math.floor(e.balance) > 0
        } catch (error) {
        }
    })

    // caculator total of data
    let total = data.reduce((t, e) => { return t + e.balance }, 0)
    total = total * .95

    //default money each number
    let defaultMoney = Math.floor(total / 100)

    if (defaultMoney < 1) {
        return false
    }

    //slice array
    let subSize = Math.floor(data.length / quantityOfThreadLottering)

    let i = 0
    let sliceArr = []
    while (true) {
        if (i >= data.length - subSize) {
            sliceArr.push({
                start: i,
                end: data.length
            })
            break
        }
        sliceArr.push({
            start: i,
            end: i + subSize
        })
        i += subSize
    }
    let curentIndex = 0;
    let cunrentLostMoney = defaultMoney;

    for (let j = 0; j < sliceArr.length; j++) {
        let subTotal = 0

        for (let k = sliceArr[j].start; k < sliceArr[j].end; k++) {
            subTotal += data[k].balance
        }
        subTotal = Math.floor(subTotal)
        let rangeNumber = Math.floor((subTotal - cunrentLostMoney) / defaultMoney)
        let lost = defaultMoney - (subTotal - cunrentLostMoney - rangeNumber * defaultMoney)
        let numberStart = {
            indexStart: curentIndex,
            preLostMoney: cunrentLostMoney
        }
        let numberEnd = {
            indexEnd: curentIndex + rangeNumber + 2,
            postLostMoney: lost
        }
        curentIndex += rangeNumber + 2
        cunrentLostMoney = lost

        sliceArr[j].numberStart = numberStart;
        sliceArr[j].numberEnd = numberEnd;
        sliceArr[j].subTotal = subTotal;
        sliceArr[j].defaultMoney = defaultMoney
    }

    return { sliceArr, data }

}


async function executeLottering(v, data0, quantityOfThreadLottering) {
    console.log(chalk.blue("starting lottering...."));


    let { sliceArr, data } = handleData(data0, quantityOfThreadLottering);
    if (!sliceArr || !data) {
        console.log(chalk.redBright("tai khoan khong du de cheo"));

        return
    }



    let process = sliceArr.map((e) => {
        let run = new RunLottering(e, data)
        return run.runLottering(v);
    })


    await Promise.all(process)


    console.log(chalk.greenBright('All tasks completed'));


}

module.exports = { executeLottering }
const axios = require("axios")
const Tesseract = require("tesseract.js")
const fs = require("fs")
const chalk = require("chalk")
class Services {

    static index = 0;
    constructor() {
        console.log("create an instance of Services , index : " + Services.index);
        Services.index++
    }

    async scanText(base64Data) {
        try {
            fs.writeFileSync(`./image.png${Services.index}`, base64Data, { encoding: 'base64' }, function (err) {
                console.log('File created');
            });

            let { data: { text } } = await Tesseract.recognize(
                `./image.png${Services.index}`,
                'eng'
            );
            // console.log(text);
            // chinh sua ket qua scan ra
            text = text.replaceAll('s', '5')
            text = text.replaceAll('S', '5')
            text = text.replaceAll('o', '0')
            text = text.replaceAll('T', '7')
            text = text.replaceAll('H', '5')
            text = text.replaceAll(':', '')
            text = text.replaceAll('.', '')

            return text
            // fs.unlinkSync('./image.png')
        } catch (error) {
            console.error(error);
        }
    };

    async login(userName, passWord = "123456hg") {
        let result = null

        try {

            while (!result) {
                let cookies, data
                await axios.post("https://banca90.com/api/0.0/Home/GetCaptchaForLogin")
                    .then((res) => {
                        cookies = res.headers["set-cookie"];
                        data = res.data
                    })


                let Cookie = "";
                for (let i = 0; i < cookies.length; i++) {
                    Cookie += cookies[i].slice(0, cookies[i].indexOf(";")) + '; '
                }
                Cookie += "NG_TRANSLATE_LANG_KEY=vi; tmhDynamicLocale.locale=%22en-us%22;"
                let checkCode = await this.scanText(data.image);

                console.log(chalk.yellow("logging on username : ", userName));

                await axios.post("https://banca90.com/api/0.0/Login/login", {
                    account: userName,
                    checkCode,
                    fingerprint: "39b5a934f6e3ff8b8eef40d5681bfab8",
                    password: passWord,
                    checkCodeEncrypt: data.value
                }, {
                    headers: {
                        Cookie
                    }
                }).then((res) => {
                    if (res.data?.IsSuccess) {
                        Cookie = "";
                        cookies = res.headers["set-cookie"];
                        for (let i = 0; i < cookies.length; i++) {
                            Cookie += cookies[i].slice(0, cookies[i].indexOf(";")) + '; '
                        }
                        Cookie += "NG_TRANSLATE_LANG_KEY=vi; tmhDynamicLocale.locale=%22en-us%22;"

                        let LoginToken = res.data.LoginToken
                        result = {
                            LoginToken, Cookie
                        }
                    }
                }).catch((e) => {
                    console.log(e);
                })

            }
            return result

        } catch (error) {

            console.log("err when login ", error);

        }


    }

    async getLuckyMoneys(userName, passWord = "123456hg") {
        let dataUser = await this.login(userName);
        let { Cookie } = dataUser
        let { AccessToken, RefreshToken } = dataUser.LoginToken;
        Cookie += `_pat=${AccessToken} ;` + `_prt=${RefreshToken} ;`
        let headers = {
            Authorization: "Bearer " + AccessToken,
            Cookie
        }
        let text = chalk.red("username : ", userName)
        await axios.post("https://banca90.com/api/0.0/RedEnvelope/GetRedEnvelopList", {}, { headers })
            .then(async (res) => {
                text += chalk.green(" số lượng lì xì  : ", res.data.length)
                // console.log(text);
                let q = 0;


                if (res.data.length > 0) {
                    for (let i = 0; i < res.data.length; i++) {
                        await axios.post("https://banca90.com/api/1.0/redEnvelope/received", { id: res.data[i].Id }, { headers: headers })
                            .then((r) => {
                                console.log(chalk.blue(r.data));

                                if (r.data.Code == 200) { q++ }
                            })
                    }
                    text += chalk.greenBright(" đã nhận thành công : ", q, "lì xì");

                }
                await axios.post("https://banca90.com/api/0.0/Account/GetMyBalance", {}, { headers })
                    .then((rs) => {
                        text += chalk.blue(" số dư sau khi nhận lì xì là : " + rs.data);
                        console.log(text);
                        fs.appendFileSync("./lixi.txt", text + "\n");
                    })
            })



    }



}



module.exports = Services
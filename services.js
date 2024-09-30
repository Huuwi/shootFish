const axios = require("axios")
const Tesseract = require("tesseract.js")
const fs = require("fs")
const chalk = require("chalk")
class Services {

    static index = 0;
    indexImage
    constructor() {
        this.indexImage = Services.index;
        Services.index++
        console.log("create an instance of Services , index : " + this.indexImage);
    };

    async scanText(base64Data) {
        try {
            fs.writeFileSync(`./image.png${this.indexImage}`, base64Data, { encoding: 'base64' }, function (err) {
                console.log('File created');
            });

            let { data: { text } } = await Tesseract.recognize(
                `./image.png${this.indexImage}`,
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
                    // console.log(res.data);
                    if (res.data.ErrorMessage == 'Tài khoản này đang bị vô hiệu hóa, vui lòng liên hệ với bộ phận chăm sóc khách hàng') {
                        fs.appendFileSync("./loi_dang_nhap.txt", userName + " acc bi khoa \n")
                        result = true
                        return
                    }

                    if (res.data.ErrorMessage == 'Tài khoản mật khẩu sai\r\n') {
                        fs.appendFileSync("./loi_dang_nhap.txt", userName + " accsai tai khoan hoac mat khau \n")
                        result = true
                        return
                    }

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


    };

    async getLuckyMoneys(userName, passWord = "123456hg") {
        let dataUser = await this.login(userName);
        if (dataUser == true) {
            return
        }
        let { Cookie } = dataUser
        let { AccessToken, RefreshToken } = dataUser.LoginToken;
        Cookie += `_pat=${AccessToken} ;` + `_prt=${RefreshToken} ;`
        let headers = {
            Authorization: "Bearer " + AccessToken,
            Cookie
        }
        let text2 = ""
        let text = chalk.red("username : ", userName)
        let q = 0;

        await axios.post("https://banca90.com/api/0.0/RedEnvelope/GetRedEnvelopList", {}, { headers })
            .then(async (res) => {
                text += chalk.green(" số lượng lì xì  : ", res.data.length)

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
                        fs.appendFileSync("./lixi.txt", JSON.stringify({ userName, quantityOfLuckyMoney: q, balance: rs.data }) + "\n");
                    })
            })



    };


    // obj = { defaultAmount, preLostMoney, curentNumber } , 
    async payNumber(obj, userName, passWord = "123456hg") {

        let dataUser = await this.login(userName, passWord);
        if (dataUser == true) {
            return
        }
        let { Cookie } = dataUser
        let { AccessToken, RefreshToken } = dataUser.LoginToken;
        Cookie += `_pat=${AccessToken} ;` + `_prt=${RefreshToken} ;`

        let headers = {
            Authorization: "Bearer " + AccessToken,
            Cookie
        }
        let text2 = ""
        let text = chalk.red("username : ", userName)
        text2 += "username : " + userName
        let url = ""
        let token = undefined

        while (!token) {

            while (!url) {
                await axios.post("https://banca90.com/api/1.0/account/loginToGame?SupplierType=Tp&gid=1568", {}, { headers })
                    .then((res) => {
                        url = res?.data?.Result?.Url

                    })
            }

            let key = url.slice(url.indexOf("ssoKey=") + 7, url.indexOf("&style="))
            const data = new URLSearchParams({
                key,
                gameID: '1000',
                loginFrom: 'oh-gaming'
            });

            await axios.post("https://sunli.news4book.com/sso-login.api", data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': '*/*',
                    'Referer': 'https://mazi2.news4book.com/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0',
                    'Origin': 'https://mazi2.news4book.com'
                },
            })
                .then(response => {
                    token = response.data?.token
                    if (token) {
                        text += " có địa chỉ IP : " + chalk.greenBright(response.data.profile.ip)
                        text2 += " có địa chỉ IP : " + response.data.profile.ip
                    }
                })
                .catch(error => {
                    console.error('Error:', error.response ? error.response.data : error.message);
                });

        }



    }



}



module.exports = Services
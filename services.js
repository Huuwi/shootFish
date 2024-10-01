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
                        fs.appendFileSync("./lixi.txt", JSON.stringify({ userName, passWord, quantityOfLuckyMoney: q, balance: rs.data }) + "\n");
                    })
            })



    };


    async getBlance(headers) {
        return await axios.post("https://banca90.com/api/0.0/Account/GetMyBalance", {}, { headers })
            .then((rs) => {
                return rs.data
            })
    }


    async payment(v, { token, qishu, gameId, Cookie, userName }, amount, curentNumber) {
        curentNumber = curentNumber.toString()
        if (curentNumber.length == 1) {
            curentNumber = "0" + curentNumber
        }
        let payLoad = {
            token: token,
            qishu,
            v,
            gameId,
            bets: JSON.stringify([{ "type": "ball_1_1", "odds": "96", "amount": amount, "value": `尾-${curentNumber}`, "once_amount": amount }])
        }

        return await axios.post("https://sunli.news4book.com/lottery/order.api", payLoad, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': '*/*',
                Cookie,
                'Accept-Encoding': 'gzip, deflate, br, zstd',
                'Accept-Language': 'en,vi-VN;q=0.9,vi;q=0.8,fr-FR;q=0.7,fr;q=0.6,en-US;q=0.5',
                'Origin': 'https://mazi2.news4book.com',
                'Referer': 'https://mazi2.news4book.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
            },
        })
            .then(response => {
                if (response.data?.response?.error) {
                    console.log(chalk.bgRedBright("có lỗi tại payment api"));
                    console.log(response.data);
                }
                else {
                    console.log(chalk.bgGray(userName + " vào số " + curentNumber + " với số tiền là : " + amount));
                    return { payCheck: true, balance: response.data.data.balance }
                }
            })
            .catch(error => {
                console.error('Error when payment:', error.response ? error.response.data : error.message);
            });


    }


    async getInforToPayment(userName, passWord = "123456hg") {

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
        let text = chalk.red("username : ", userName)
        let url = ""
        let token = undefined
        let key = ""
        let qishu = ""
        let gameId = 40
        while (!token) {

            while (!url) {
                await axios.post("https://banca90.com/api/1.0/account/loginToGame?SupplierType=Tp&gid=1568", {}, { headers })
                    .then((res) => {
                        url = res?.data?.Result?.Url

                    })
            }

            key = url.slice(url.indexOf("ssoKey=") + 7, url.indexOf("&style="))
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
                    }
                })
                .catch(error => {
                    console.error('Error:', error.response ? error.response.data : error.message);
                });
        }
        while (qishu == "") {

            await axios.post("https://sunli.news4book.com/lottery/odds.api", { gameId, pankou: 40, token }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': '*/*',
                    'Referer': 'https://mazi2.news4book.com/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0',
                    'Origin': 'https://mazi2.news4book.com'
                },
            })
                .then(response => {

                    if (response?.data?.data?.qishu) {
                        qishu = response?.data?.data?.qishu
                    }

                })
                .catch(error => {
                    console.error('Error:', error.response ? error.response.data : error.message);
                });

        }
        console.log(chalk.red(token));


        await axios.post("https://sunli.news4book.com/lottery/summary.api", { token }, {
            headers: {
                'authority': 'sunli.news4book.com',
                'method': 'POST',
                'path': '/lottery/summary.api',
                'scheme': 'https',
                'accept': '*/*',
                'accept-encoding': 'gzip, deflate, br, zstd',
                'accept-language': 'en,vi-VN;q=0.9,vi;q=0.8,fr-FR;q=0.7,fr;q=0.6,en-US;q=0.5',
                // 'content-length': data.toString().length,
                'content-type': 'application/x-www-form-urlencoded',
                'origin': 'https://mazi2.news4book.com',
                'priority': 'u=1, i',
                'referer': 'https://mazi2.news4book.com/',
                'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
            }
            ,
        })
            .then(response => {
                if (response.data?.response?.error) {
                    console.log(chalk.bgRedBright("có lỗi tại sumary api"));
                }
            })
            .catch(error => {
                console.error('Error:', error.response ? error.response.data : error.message);
            });

        await axios.post("https://sunli.news4book.com/lottery/auto.api", { token, gameId: 40, limit: 100 }, {
            headers: {
                'authority': 'sunli.news4book.com',
                'method': 'POST',
                'path': '/lottery/summary.api',
                'scheme': 'https',
                'accept': '*/*',
                'accept-encoding': 'gzip, deflate, br, zstd',
                'accept-language': 'en,vi-VN;q=0.9,vi;q=0.8,fr-FR;q=0.7,fr;q=0.6,en-US;q=0.5',
                // 'content-length': data.toString().length,
                'content-type': 'application/x-www-form-urlencoded',
                'origin': 'https://mazi2.news4book.com',
                'priority': 'u=1, i',
                'referer': 'https://mazi2.news4book.com/',
                'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
            }
            ,
        })
            .then(response => {
                if (response.data?.response?.error) {
                    console.log(chalk.bgRedBright("có lỗi tại auto api"));
                }
            })
            .catch(error => {
                // console.error('Error:', error.response ? error.response.data : error.message);
            });

        await axios.post("https://sunli.news4book.com/lottery/notice.api", { token }, {
            headers: {
                'authority': 'sunli.news4book.com',
                'method': 'POST',
                'path': '/lottery/summary.api',
                'scheme': 'https',
                'accept': '*/*',
                'accept-encoding': 'gzip, deflate, br, zstd',
                'accept-language': 'en,vi-VN;q=0.9,vi;q=0.8,fr-FR;q=0.7,fr;q=0.6,en-US;q=0.5',
                // 'content-length': data.toString().length,
                'content-type': 'application/x-www-form-urlencoded',
                'origin': 'https://mazi2.news4book.com',
                'priority': 'u=1, i',
                'referer': 'https://mazi2.news4book.com/',
                'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
            }
            ,
        })
            .then(response => {
                if (response.data?.response?.error) {

                    console.log(chalk.bgRedBright("có lỗi tại notice api"));
                }
            })
            .catch(error => {
                console.error('Error:', error.response ? error.response.data : error.message);
            });


        // this.payment("04e82044a8db56038eabca9b6a42f776", { token, qishu, gameId, Cookie, headers, userName, passWord }, 1, 12)


        return { token, qishu, gameId, Cookie, headers, userName, passWord }

    }


    async sleep(ms) {
        return new Promise((res, rej) => {
            setTimeout(() => {
                res()
            }, ms)
        })
    }



}



module.exports = Services
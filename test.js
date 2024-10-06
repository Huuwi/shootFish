const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');


const getNewProxy = async (key) => {
    // let host, port, data0
    // await axios.get(`https://api.kiotproxy.com/api/v1/proxies/new?key=${key}&region=bac`)
    //     .then((res) => {
    //         console.log(res.data.data);

    //         data0 = res.data.data
    //         console.log(res.data.data);

    //         // host, port = data0.host, data0.httpPort
    //     })
    // console.log(host, port);
    //117.5.22.227:21156
    const proxy = {
        host: "116.107.112.104", // Thay bằng địa chỉ proxy của bạn
        port: 14487,               // Thay bằng cổng của proxy
    };

    // Cấu hình user agent

    const httpsAgent = new HttpsProxyAgent({ host: "117.5.22.227", port: "21156" })

    console.log(httpsAgent);


    const axiosInstance = axios.create({
        httpsAgent,
        headers: {
            'User-Agent': "Mozilla/5.0 (iPad; CPU OS 8_2 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12D508 Safari/600.1.4",
        }
    });

    // Thực hiện một request qua proxy
    axiosInstance.get('https://banca90.com/')
        .then(response => {
            console.log(response);
        })
        .catch(error => {
            console.error(error);
        });
}

getNewProxy("K209200e6babb46a698aea183f11de684")
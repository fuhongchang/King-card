const express = require('express');

const app = express();

const request = require('request');

//引入数据库
const db = require('./model/connect.js');

//设置post请求参数
const bodyParser = require('body-parser');
//接受post请求
app.use(bodyParser.urlencoded({ extended: false }));

//访问所有静态文件
app.use(express.static(__dirname));
//设置模板前缀和后缀和使用的模块
app.set('views', __dirname)
app.set('view engine', 'html');
app.engine('html', require('express-art-template'))

// app.get('/webapp/m-list.aspx', (req, res) => {
//     res.render('index')
// })

app.get('/', (req, res) => {
        res.render('index')
    })
    //跳转到成功界面
app.get('/sub', (req, res) => {
    console.log(3333)
        // res.send()
    res.render('subaa');
})

//登录
app.get('/login', function(req, res, next) {
    let requestData = {
        "source": "weichuang",
        "password": "fgoihf9f"
    };
    request({
        url: 'https://www.gzuni.com/apps/kingcard/api/v1/login/',
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: requestData
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(error)
            console.log(body)
            res.send(body)
        }
    });
})

// 获取验证码
app.post('/getCode', (req, res) => {
    console.log(req.body);
    request({
        url: 'https://www.gzuni.com/apps/kingcard/api/message/send/gzuni/v1/',
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: req.body
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(error)
            console.log(body)
            res.send(body)
        }
    });
})

// 效验验证码
app.post('/verifCode', (req, res) => {
        console.log(req.body)
        request({
            url: 'https://www.gzuni.com/apps/kingcard/api/message/check/gzuni/v1/',
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: req.body
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(error)
                console.log(444)
                console.log(body)
                res.send(body)
            }
        });
    })
    //选号
app.post('/getNum', (req, res) => {
    console.log(req.body)
    request({
        url: 'https://www.gzuni.com/apps/kingcard/api/num/select/v1/',
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: req.body
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(error)
            console.log(444)
            console.log(body)
            res.send(body)
        }
    });
})

//号码占用
function getPhone(phone, res) {
    console.log(phone)
    request({
        url: 'https://www.gzuni.com/apps/kingcard/api/num/state/change/v1/',
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: phone
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
            if (body.rspCode != "0000") {
                console.log('号码占用失败')
                res.send(body.rspDesc);
            }
            console.log(11)
            res.send({ status: '提交信息成功' })
        }
    });
}


//提交信息
function getSubmit(newData, res) {
    request({
        url: 'https://www.gzuni.com/apps/kingcard/api/king/card/order/ordersync/',
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: newData
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
            if (body.rspCode != "0000") {
                console.log(body)
                res.send('提交信息失败,请重新提交')
            } else {
                console.log('提交信息')
                console.log(body)
                res.send({ status: 'ok' })
            }
        }
    });
}

//身份证
app.post('/getCard', (req, res) => {
    let cards = {
        "source": req.body.source,
        "token": req.body.token,
        "province": req.body.province,
        "city": req.body.city,
        "certName": req.body.certName,
        "certNum": req.body.certNum,
        "certType": req.body.certType
    }

    let phone = {
        "source": req.body.source,
        "token": req.body.token,
        "provinceCode": req.body.province,
        "cityCode": req.body.city,
        "serialNumber": req.body.serialNumber,
        "proKey": req.body.proKey,
        "certNo": req.body.certNo
    }


    request({
        url: 'https://www.gzuni.com/apps/kingcard/api/king/identity/cust/v1/',
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: cards
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
                // res.send(body)
            if (body.aCode == '560-0203') {
                console.log(cards)
                console.log(body)
                console.log('身份证错误黑名单')
                res.send(body.aDesc);
            } else if (body.bCode != "0000") {
                console.log(body)
                console.log('身份证验证错误')
                res.send(body.bDesc);

            } else if (body.body.cust.userAmount >= 5) {
                res.send('您已经有5张联通卡了，一个人只能购买5张')
            } else {
                console.log('身份证验证')
                    // pdPhone();
                getPhone(phone, res);
            }
        }
    });
})

//提交数据
app.post('/tijiao', (req, res) => {
    console.log(req.body.certNo);
    console.log(req.body);
    let sql = `SELECT * FROM user WHERE  card = '${req.body.certNo}' `;
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(11)
            console.log(result)
            if (result.length != 0) {
                res.send('请勿重复提交')
            } else {
                let goodsId = req.body.goodsId === '981610241535' ? '大王卡' : '地王卡';
                let data = {
                    uname: req.body.certName,
                    phone: req.body.contactNum,
                    card: req.body.certNum,
                    newphone: req.body.serialNumber,
                    adress: req.body.postAddr,
                    combo: goodsId,
                    date: req.body.creatTime,
                    age: req.body.age,
                }
                let sql = 'INSERT INTO user SET ?';
                db.query(sql, data, (err, result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        //跳转到管理页面
                        let newData = {
                            "source": req.body.source,
                            "token": req.body.token,
                            "orderId": req.body.orderId,
                            "goodsId": req.body.goodsId,
                            "provinceCode": req.body.province,
                            "cityCode": req.body.city,
                            "phoneNum": req.body.serialNumber,
                            "contactNum": req.body.contactNum,
                            "certName": req.body.certName,
                            "certNo": req.body.certNo,
                            "creatTime": req.body.creatTime,
                            "updateTime": req.body.updateTime,
                            "custId": req.body.custId,
                            "referrerCode": req.body.referrerCode,
                            "referrerDepartId": req.body.referrerDepartId,
                            "channel": req.body.channel,
                            "postProvinceCode": req.body.postProvinceCode,
                            "postCityCode": req.body.postCityCode,
                            "postDistrictCode": req.body.postDistrictCode,
                            "postAddr": req.body.postAddr,
                            "postName": req.body.postName,
                            "captchaId": req.body.captchaId
                        }
                        console.log(req.body.captchaId + '--------------------------')
                        getSubmit(newData, res)
                    }
                })
            }
        }
    })
})


app.listen(3000, () => {
    console.log(' 服务器启动成功')
});
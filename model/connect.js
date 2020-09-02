//连接mysql数据库
const mysql = require('mysql');

//创建连接
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'lv'
})

//判断是否连接成功
db.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('连接成功');
    }
})
module.exports = db;
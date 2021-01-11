// 微前端基座应用
const express = require('express')

const app = express()
//目的： 让express应用允许跨域
app.get('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS")
    res.header("Access-Control-Allow-Headers", "X-Requested-With")
    res.header("Access-Control-Allow-Headers", "Content-Type")
    next()
})
app.use(express.static('./app1'))

app.listen(9001, () => {
    console.log('app1 at port 9001')
})

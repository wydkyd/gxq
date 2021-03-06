'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  API_ROOT: '"http://127.0.0.1:10087"'//软硬件平台
  // API_ROOT: '"http://127.0.0.1:10086/"'//统一监管平台
//API_ROOT: '"http://192.168.1.90:10003/"'//统一监管平台
//API_ROOT: '"http://192.168.1.25:10003/"'//安全保障平台
})

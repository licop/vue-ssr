const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const webpack = require('webpack')
const devMiddleware = require('webpack-dev-middleware')

const resolve = file => path.resolve(__dirname, file)

module.exports = (server, callback) => {
  let ready
  const onReady = new Promise(r => ready = r)

  // 监视构建，更新Renderer
  let template
  let serverBundle
  let clientManifest

  const update = () => {
    if (template && serverBundle && clientManifest) {
      ready()
      callback(serverBundle, template, clientManifest)
    }
  }
  
  // 监视构建 template -> 调用 update -> 更新 Renderer 渲染器
  const templatePath = path.resolve(__dirname, '../index.template.html')
  template = fs.readFileSync(templatePath, 'utf-8')
  update()
  // 使用chokidar监视文件变化
  chokidar.watch(templatePath).on('change', () => {
    console.log('template change')
    template = fs.readFileSync(templatePath, 'utf-8')
    update()
  })
  
  // 监视构建 serverBundle -> 调用 update -> 更新 Renderer 渲染器
  const serverConfig = require('./webpack.server.config')
  const serverCompiler = webpack(serverConfig)
  // 使用webpack-dev-middleware将文件从内存中读写
  const serverDevMiddleware = devMiddleware(serverCompiler, {
    logLevel: 'silent' // 关闭日志输出，由 FriendlyErrorsWebpackPlugin 处理
  })
  serverCompiler.hooks.done.tap('server', () => {
    serverBundle = JSON.parse(
      serverDevMiddleware.fileSystem.readFileSync(resolve('../dist/vue-ssr-server-bundle.json'), 'utf-8')
    )
    update()
  })

  
  // 监视构建 clientManifest -> 调用 update -> 更新 Renderer 渲染器

  return onReady
}

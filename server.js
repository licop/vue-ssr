const Vue = require('vue')
const express = require('express')
const fs = require('fs')
const { createBundleRenderer } = require('vue-server-renderer')
const setupDevServer = require('./build/setup-dev-server')

const server = express()
server.use('/dist', express.static('./dist'))

const isProd = process.env.NODE_ENV === 'production'
let renderer
let onReady
if(isProd) {
  const serverBundle = require('./dist/vue-ssr-server-bundle.json')
  const clientManifest = require('./dist/vue-ssr-client-manifest.json')
  const template = fs.readFileSync('./index.template.html', 'utf-8')
  renderer = createBundleRenderer(serverBundle, {
    template,
    clientManifest
  })
} else {
  // 开发模式 -> 监视打包构建 -> 重新生成 Renderer 渲染器
  onReady = setupDevServer(server, (serverBundle, template, clientManifest) => {
    renderer = createBundleRenderer(serverBundle, {
      template,
      clientManifest
    })
  })
}

const render = (req, res) => {
  renderer.renderToString({
    title: 'licop',
    meta: `
      <meta name="description" content="vue ssr">
    `
  }, (err, html) => {
    if (err) {
      return res.status(500).end('Internal Server Error')
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(html)
  })
}
server.get('/', isProd 
  ? render 
  : async (req, res) => {
    // 等待有渲染器Renderer以后，调用render渲染
    await onReady
    render()
  }
)

server.listen(3000, () => {
  console.log('server run at port 3000')
})

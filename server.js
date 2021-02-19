const Vue = require('vue')
const express = require('express')
const fs = require('fs')
const serverBundle = require('./dist/vue-ssr-server-bundle.json')
const clientManifest = require('./dist/vue-ssr-client-manifest.json')
const template = fs.readFileSync('./index.template.html', 'utf-8')
const renderer = require('vue-server-renderer').createBundleRenderer(serverBundle, {
  template,
  clientManifest
})
const server = express()

server.use('/dist', express.static('./dist'))

server.get('/', (req, res) => {

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
})

server.listen(3000, () => {
  console.log('server run at port 3000')
})

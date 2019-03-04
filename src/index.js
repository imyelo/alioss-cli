#!/usr/bin/env node

const _ = require('lodash')
const oss = require('ali-oss')
const ora = require('ora')
const parallel = require('p-all')
const globby = require('globby')
const rc = require('rc')
const Debug = require('debug')

const debug = Debug('alioss')

const APPNAME = 'alioss'

const config = rc(APPNAME, {
  accessKeyId: void 0,
  accessKeySecret: void 0,
  stsToken: void 0,
  bucket: void 0,
  endpoint: void 0,
  region: void 0,
  internal: void 0,
  secure: void 0,
  timeout: void 0,
  cwd: void 0,
  patterns: void 0,
  prefix: '/'
})

debug(JSON.stringify(config, null, 2))

if (_.some(_.pick(config, 'accessKeyId', 'accessKeySecret', 'cwd', 'patterns'), (val) => typeof val === 'undefined')) {
  throw new Error('invalid config')
}

const store = oss(_.omitBy(_.pick(config, 'accessKeyId', 'accessKeySecret', 'stsToken', 'bucket', 'endpoint', 'region', 'internal', 'secure', 'timeout'), (val) => typeof val === 'undefined'))

const upload = async function ({ prefix, cwd, patterns }) {
  let spinner, files, objects
  spinner = ora('uploading')
  spinner.start()
  files = await globby(patterns, {
    cwd,
    nodir: true
  })
  spinner.text = `uploading ${files.length} files from ${cwd} to ${prefix}...`
  objects = await parallel(files.map((file) => () =>
    store.put(`${prefix}${file}`, `${cwd}${file}`)
  ), { concurrency: 3 })
  spinner.stop()
  console.log(`total ${files.length} files success √'`)
  return objects
}

;(async function () {
  try {
    await upload(_.pick(config, 'prefix', 'cwd', 'patterns'))
  } catch (error) {
    console.error(error)
  }
})()

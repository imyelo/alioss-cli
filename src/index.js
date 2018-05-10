#!/usr/bin/env node

import 'babel-polyfill'
import _ from 'lodash'
import oss from 'ali-oss'
import co from 'co'
import ora from 'ora'
import parallel from 'co-parallel'
import globby from 'globby'
import rc from 'rc'
import Debug from 'debug'

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

const upload = function *({ prefix, cwd, patterns, ...options }) {
  let spinner, files, objects
  spinner = ora('uploading')
  spinner.start()
  files = yield globby(patterns, {
    cwd,
    nodir: true
  })
  spinner.text = `uploading ${files.length} files from ${cwd} to ${prefix}...`
  objects = yield parallel(files.map(function (file) {
    return store.put(`${prefix}${file}`, `${cwd}${file}`)
  }), 3)
  spinner.stop()
  console.log(`total ${files.length} files success √'`)
  return objects
}

co(function *() {
  yield upload(_.pick(config, 'prefix', 'cwd', 'patterns'))
}).catch(function (err) {
  console.error(err)
})

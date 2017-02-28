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
  accessKeyId: null,
  accessKeySecret: null,
  bucket: null,
  region: null,
  cwd: null,
  patterns: null,
  prefix: '/'
})

debug(JSON.stringify(config, null, 2))

if (_.some(_.pick(config, 'accessKeyId', 'accessKeySecret', 'bucket', 'region', 'cwd', 'patterns'), (val) => val === null)) {
  throw new Error('invalid config')
}

const store = oss(_.pick(config, 'accessKeyId', 'accessKeySecret', 'bucket', 'region'))

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
  console.log(`total ${files.length} files success √', files.length`)
  return objects
}

co(function *() {
  yield upload(_.pick(config, 'prefix', 'cwd', 'patterns'))
}).catch(function (err) {
  console.error(err)
})

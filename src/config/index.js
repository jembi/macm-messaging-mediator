'use strict'

const config = {
  hearthUrl: process.env.HEARTH_URL || 'http://localhost:3447/',
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || '3000'
}

export default {
  get: key => config[key]
}

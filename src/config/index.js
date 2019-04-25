'use strict'

const config = {
  hearthHost: process.env.HEARTH_HOST || 'localhost',
  hearthPort: process.env.HEARTH_PORT || '3447',
  hearthSecured: process.env.HEARTH_SCURED || false,
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || '3000'
}

export default {
  get: key => config[key]
}

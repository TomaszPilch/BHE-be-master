import createError from 'http-errors'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import debugLib from 'debug'
import OAuth2Server from 'oauth2-server'

import coreRoutes from '@bhe/core-modules/lib/routes/_routes'
import OAuthModel from '@bhe/core-modules/lib/OAuthModel'
import Authenticator from '@bhe/core-modules/lib/modules/authenticator/src/Authenticator'

import packageJson from '../package.json'
import defaultConfig from './config/config.json'
import configLoader from './config/configLoader'
import models from './models'
import modules from './cache/admin/modules'

const debug = debugLib('bhe-be-master:server')

const defaultConfigObject = {
  ...defaultConfig,
  MODELS: models,
  fullConfig: configLoader,
  appKey: packageJson.name,
  version: packageJson.version,
}

models.sequelize.authenticate().then(
  (err) => {
    debug('Error: ', err)
    return debug('Connection to Postgres established !')
  },
  (err) => {
    debug('Unable to connect: ', err)
  },
)

const app = express()

app.use(logger('dev'))
app.use(express.json({ type: 'text/plain', limit: '50mb' }))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '../public')))

app.oauth = new OAuth2Server({
  model: OAuthModel(models, new Authenticator(defaultConfig), ['admin']),
  allowBearerTokensInQueryString: true,
  accessTokenLifetime: 4 * 60 * 60, // 4 * 60 * 60
  refreshTokenLifetime: 14 * 24 * 60 * 60, // 2 * 24 * 60 * 60
})

/**
 * Initialize modules
 */
app.set(
  'modules',
  Object.keys(modules).reduce((acc, key) => {
    acc[key] = new modules[key](defaultConfigObject)
    return acc
  }, {}),
)

app.use((req, res, next) => {
  req.config = configLoader
  next()
})

/**
 * Register modules callback functions, pass modules
 */
const mods = app.get('modules')
Object.keys(mods).map((moduleKey) => {
  if (mods[moduleKey].setModules) {
    mods[moduleKey].setModules(mods)
  }
  if (mods[moduleKey].postConstructor) {
    mods[moduleKey].postConstructor()
  }
  if (mods[moduleKey].getCallbacks) {
    return mods[moduleKey].getCallbacks().map((cbConfig) => {
      if (mods[cbConfig.module] && mods[moduleKey][cbConfig.fn]) {
        return mods[cbConfig.module].registerCallback(mods[moduleKey][cbConfig.fn], moduleKey)
      }
      return false
    })
  }
  return false
})

app.use('*', (req, res, next) => {
  req.corsUrls = process.env.CORS_URLS
  next()
})

app.use('/api/v1', coreRoutes(app.oauth))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app

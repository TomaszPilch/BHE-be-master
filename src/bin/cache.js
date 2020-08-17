// @flow
import path from 'path'
import ModuleLoader from '@bhe/node-core/lib/ModuleLoader'

import config from '../config/config.json'
import MODELS from '../models'

const root = path.resolve(path.join(__dirname, '../'))
const moduleLoader = new ModuleLoader(config, MODELS, root)
moduleLoader.removeCache().then(() => {
  console.log('Cache removed')
  moduleLoader.createCache().then(() => {
    console.log('New cache files created')
    // process.exit(0)
  })
})

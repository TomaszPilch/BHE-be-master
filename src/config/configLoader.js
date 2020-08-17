import cachedConfig from '../cache/admin/config.json'
import config from './config.json'

export default {
  ...config,
  ...cachedConfig,
}

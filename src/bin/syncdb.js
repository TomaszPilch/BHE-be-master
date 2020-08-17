import models from '../models/index'

const syncDB = () => {
  models.sequelize.sync().then(() => {
    console.log('Database synced!')
    process.exit(0)
  })
}

models.sequelize.authenticate().then(
  () => {
    syncDB()
  },
  (err) => {
    console.log('Unable to connect: ', err)
  },
)

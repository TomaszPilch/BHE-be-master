// @flow
import fs from 'fs'
import path from 'path'
import Sequelize from 'sequelize'
import config from '../config/config.json'

const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  `${process.env.POSTGRES_PASSWORD}`,
  {
    host: process.env.POSTGRES_HOSTNAME || 'localhost',
    dialect: 'postgres',
    port: process.env.POSTGRES_PORT || 5432,
    timezone: '+1:00',
  },
)

const db = {}
const modelsPath = config.modelsPath

modelsPath.forEach((p) => {
  let fromAbsolutePath = path.join(__dirname, '../', p)
  if (!fs.existsSync(fromAbsolutePath)) {
    fromAbsolutePath = path.join(__dirname, '../../', p)
  }
  if (!fs.existsSync(fromAbsolutePath)) {
    fromAbsolutePath = path.join(__dirname, '../../node_modules/', p)
  }
  if (fs.existsSync(fromAbsolutePath)) {
    fs.readdirSync(fromAbsolutePath)
      .filter(
        (file) =>
          file.indexOf('.') !== 0 &&
          new RegExp('.*.js$').test(file) &&
          ![
            'index.js',
            'abstractGroupModelCreator.js',
            'abstractModelCreator.js',
            'abstractTextModelCreator.js',
          ].includes(file),
      )
      .forEach((file) => {
        let importedModel = require(path.join(fromAbsolutePath, file))
        if (typeof importedModel !== 'function' && typeof importedModel.default !== 'undefined') {
          importedModel = importedModel.default
        }
        const model = importedModel(sequelize, Sequelize.DataTypes)
        if (Array.isArray(model)) {
          model.forEach((m) => {
            db[m.name] = m
          })
        } else {
          db[model.name] = model
        }
      })
  } else {
    console.error(`Models with path: ${p} doesn't exist.`)
  }
})

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize
db.Op = Sequelize.Op

module.exports = db

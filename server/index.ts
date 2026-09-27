import { createApp } from './app'
import { loadConfig } from './config'

const config = loadConfig()
const { app, database } = createApp({ config })

const server = app.listen(config.PORT, () => {
  console.log(`Hourglass issuer listening on :${config.PORT} (${config.PAYMENT_MODE})`)
})

function shutdown() {
  server.close(() => {
    database.close()
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

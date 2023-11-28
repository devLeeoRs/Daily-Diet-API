import fastify from 'fastify'
import { dietRoute } from './routes/dietRoute'
import { usersRoute } from './routes/usersRoute'
import cookie from '@fastify/cookie'
import { metricsRoute } from './routes/metricsRoute'

export const app = fastify()

app.register(cookie)
app.register(dietRoute, {
  prefix: 'diet',
})
app.register(usersRoute, {
  prefix: 'users',
})
app.register(metricsRoute, {
  prefix: 'metrics',
})

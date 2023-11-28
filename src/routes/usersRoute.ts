import { randomUUID } from 'crypto'
import { compare, hash } from 'bcrypt'
import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'

export async function usersRoute(app: FastifyInstance) {
  app.post('/session', async (request, reply) => {
    const userSessionSchema = z.object({
      email: z.string(),
      password: z.string(),
    })

    const { email, password } = userSessionSchema.parse(request.body)

    const user = await knex('users').where({ email }).first()

    if (!user) {
      throw new Error('invalid email or password')
    }
    const comparePassword = await compare(password, user.password)

    if (!comparePassword) {
      throw new Error('invalid email or password')
    }

    reply.setCookie('userId', user.id, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24,
    })

    reply.status(200).send()
  })

  app.post('/', async (request, reply) => {
    const userSchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    })

    const { name, email, password } = userSchema.parse(request.body)

    const checkIsExistEmail = await knex('users').where({ email })

    if (checkIsExistEmail.length > 0) {
      reply.status(400).send('email already exists')
    }

    const hashPassword = await hash(password, 8)

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      password: hashPassword,
    })

    reply.status(201).send('User created')
  })
}

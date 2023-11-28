import { FastifyInstance } from 'fastify'
import { checkSessionIdExist } from '../middlewares/check-session-id-exist'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'
export async function dietRoute(app: FastifyInstance) {
  app.post(
    '/',
    { preHandler: [checkSessionIdExist] },
    async (request, reply) => {
      const createMealsSchema = z.object({
        name: z.string(),
        description: z.string(),
        dietOn: z.enum(['true', 'false']),
      })

      const { name, description, dietOn } = createMealsSchema.parse(
        request.body,
      )

      const userId = request.cookies.userId

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        dietOn,
        user_id: userId,
      })

      reply.status(201).send({ message: 'meals successfully registered' })
    },
  )
  app.put(
    '/:id',
    { preHandler: [checkSessionIdExist] },
    async (request, reply) => {
      const updateMealsSchema = z.object({
        name: z.string(),
        description: z.string(),
        dietOn: z.string(),
      })
      const updateMealsParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = updateMealsParamsSchema.parse(request.params)
      const { name, description, dietOn } = updateMealsSchema.parse(
        request.body,
      )

      const meal = await knex('meals').where({ id }).first()

      if (!meal) {
        reply.status(400).send({ error: 'meal not found' })
      }

      meal.name = name || meal.name
      meal.description = description || meal.description
      meal.dietOn = dietOn || meal.dietOn

      await knex('meals').update(meal).where({ id })

      reply.status(201).send({ message: 'Success' })
    },
  )
  app.delete(
    '/:id',
    { preHandler: [checkSessionIdExist] },
    async (request, reply) => {
      const mealsDeleteParams = z.object({
        id: z.string().uuid(),
      })

      const { id } = mealsDeleteParams.parse(request.params)
      const userId = request.cookies.userId

      const meal = await knex('meals').where({ id }).first()

      if (meal.user_id !== userId) {
        reply.status(400).send({ error: 'User not allowed' })
      }

      await knex('meals').delete().where({ id })

      reply.status(200)
    },
  )
  app.get(
    '/',
    { preHandler: [checkSessionIdExist] },
    async (request, reply) => {
      const userId = request.cookies.userId

      const meals = await knex('meals').select('*').where({ user_id: userId })

      if (!meals) {
        reply.status(401).send({ error: 'no meal found' })
      }

      reply.status(200).send(meals)
    },
  )
  app.get(
    '/:id',
    { preHandler: [checkSessionIdExist] },
    async (request, reply) => {
      const userId = request.cookies.userId

      const meal = await knex('meals').where({ user_id: userId }).first()

      if (!meal) {
        reply.status(401).send({ error: 'no meal found' })
      }

      reply.status(200).send(meal)
    },
  )
}

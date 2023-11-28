import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { checkSessionIdExist } from '../middlewares/check-session-id-exist'

export async function metricsRoute(app: FastifyInstance) {
  app.get(
    '/',
    { preHandler: [checkSessionIdExist] },
    async (request, reply) => {
      const userId = request.cookies.userId

      const totalMeals = await knex('meals').where({ user_id: userId })
      const totalMealsInDiet = await knex('meals').where({
        user_id: userId,
        dietOn: 'true',
      })
      const totalMealsOfDiet = await knex('meals').where({
        user_id: userId,
        dietOn: 'false',
      })

      const metrics = {
        totalMeals: totalMeals.length,
        totalMealsInDiet: totalMealsInDiet.length,
        totalMealsOfDiet: totalMealsOfDiet.length,
      }

      reply.status(200).send(metrics)
    },
  )
}

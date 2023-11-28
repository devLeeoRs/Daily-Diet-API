import { afterAll, beforeAll, expect, beforeEach, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'
import { describe } from 'node:test'

beforeAll(async () => {
  await app.ready()
})

afterAll(async () => {
  await app.close()
})

beforeEach(() => {
  execSync('npm run knex migrate:rollback -all')
  execSync('npm run knex migrate:latest')
})

describe('users test', () => {
  it('must be able to create a user', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'name test',
      email: 'testemail2@test.com',
      password: '12345',
    })

    expect(createUserResponse.statusCode).toEqual(201)
  })

  it('must be able to create a session for the user', async () => {
    await request(app.server).post('/users').send({
      name: 'name test',
      email: 'testemail2@test.com',
      password: '12345',
    })

    const sessionUser = await request(app.server).post('/users/session').send({
      email: 'testemail2@test.com',
      password: '12345',
    })

    expect(sessionUser.statusCode).toEqual(200)
  })
})

it('must be able to create a meal', async () => {
  await request(app.server).post('/users').send({
    name: 'name test',
    email: 'testemail2@test.com',
    password: '12345',
  })

  const sessionUser = await request(app.server).post('/users/session').send({
    email: 'testemail2@test.com',
    password: '12345',
  })
  const cookies = sessionUser.get('Set-Cookie')

  await request(app.server)
    .post('/diet')
    .send({
      name: 'meals test',
      description: 'meals test description',
      dietOn: 'true',
    })
    .set('Cookie', cookies)
    .expect(201)
})

it('must be able update a meal', async () => {
  await request(app.server).post('/users').send({
    name: 'name test',
    email: 'testemail2@test.com',
    password: '12345',
  })

  const sessionUser = await request(app.server).post('/users/session').send({
    email: 'testemail2@test.com',
    password: '12345',
  })
  const cookies = sessionUser.get('Set-Cookie')

  await request(app.server)
    .post('/diet')
    .send({
      name: 'meals test',
      description: 'meals test description',
      dietOn: 'true',
    })
    .set('Cookie', cookies)
})

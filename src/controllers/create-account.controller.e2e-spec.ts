import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

describe('Create account (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)

    await app.init()
  })

  test('[POST] /accounts', async () => {
    const response = await request(app.getHttpServer()).post('/accounts').send({
      name: 'Jhon Doe',
      email: 'jhon.doe@mail.com',
      password: '123465',
    })

    const userOnDatabase = await prisma.user.findUnique({
      where: {
        email: 'jhon.doe@mail.com',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(userOnDatabase).toBeTruthy()
    expect(userOnDatabase).toEqual(
      expect.objectContaining({
        name: 'Jhon Doe',
        email: 'jhon.doe@mail.com',
      }),
    )
  })
})

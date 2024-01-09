import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

describe('Create question (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[POST] /questions', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Jhon Doe',
        email: 'jhon.doe@mail.com',
        password: '123465',
      },
    })

    const accessToken = jwt.sign({ sub: user.id })

    const response = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'New Question',
        content: 'New Question Content',
      })

    const questionOnDatabase = await prisma.question.findUnique({
      where: {
        slug: 'new-question',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(questionOnDatabase).toBeTruthy()
    expect(questionOnDatabase).toEqual(
      expect.objectContaining({
        title: 'New Question',
        content: 'New Question Content',
      }),
    )
  })
})

import { AnswerFactory } from '$/factories/make-answer'
import { QuestionFactory } from '$/factories/make-question'
import { StudentFactory } from '$/factories/make-student'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

describe('Choose question best answer (E2E)', () => {
  let app: INestApplication
  let jwt: JwtService
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let prisma: PrismaService
  let answerFactory: AnswerFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory, AnswerFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    jwt = moduleRef.get(JwtService)
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    prisma = moduleRef.get(PrismaService)
    answerFactory = moduleRef.get(AnswerFactory)

    await app.init()
  })

  test('[PATCH] /answers/:id/choose-as-best', async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwt.sign({ sub: String(user.id) })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const answer = await answerFactory.makePrismaAnswer({
      questionId: question.id,
      authorId: user.id,
    })

    const response = await request(app.getHttpServer())
      .patch(`/answers/${answer.id}/choose-as-best`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    const questionOnDatabase = await prisma.question.findUnique({
      where: {
        id: String(question.id),
      },
    })

    expect(response.statusCode).toBe(204)
    expect(questionOnDatabase).toEqual(
      expect.objectContaining({
        bestAnswerId: String(answer.id),
      }),
    )
  })
})

import { QuestionCommentFactory } from '$/factories/make-question-comment'
import { QuestionFactory } from '$/factories/make-question'
import { StudentFactory } from '$/factories/make-student'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

describe('Delete question comment (E2E)', () => {
  let app: INestApplication
  let jwt: JwtService
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let prisma: PrismaService
  let questionCommentFactory: QuestionCommentFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory, QuestionCommentFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    jwt = moduleRef.get(JwtService)
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    prisma = moduleRef.get(PrismaService)
    questionCommentFactory = moduleRef.get(QuestionCommentFactory)

    await app.init()
  })

  test('[DELETE] /questions/comments/:id', async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwt.sign({ sub: String(user.id) })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const comment = await questionCommentFactory.makePrismaQuestionComment({
      questionId: question.id,
      authorId: user.id,
    })

    const response = await request(app.getHttpServer())
      .delete(`/questions/comments/${comment.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    const commentOnDatabase = await prisma.comment.findUnique({
      where: {
        id: String(comment.id),
      },
    })

    expect(response.statusCode).toBe(204)
    expect(commentOnDatabase).toBeNull()
  })
})

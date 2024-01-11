import { QuestionCommentFactory } from '$/factories/make-question-comment'
import { QuestionFactory } from '$/factories/make-question'
import { StudentFactory } from '$/factories/make-student'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import dayjs from 'dayjs'
import request from 'supertest'

describe('Fetch question comments (E2E)', () => {
  let app: INestApplication
  let jwt: JwtService
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
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
    questionCommentFactory = moduleRef.get(QuestionCommentFactory)

    await app.init()
  })

  test('[GET] /questions/:questionId/comments', async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwt.sign({ sub: String(user.id) })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    await Promise.all(
      Array.from({ length: 3 }).map((_, i) =>
        questionCommentFactory.makePrismaQuestionComment({
          questionId: question.id,
          content: `Comment Content ${i}`,
          authorId: user.id,
          createdAt: dayjs(new Date())
            .add(4 - i, 'hours')
            .toDate(),
        }),
      ),
    )

    const response = await request(app.getHttpServer())
      .get(`/questions/${question.id}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      comments: [
        expect.objectContaining({ content: 'Comment Content 0' }),
        expect.objectContaining({ content: 'Comment Content 1' }),
        expect.objectContaining({ content: 'Comment Content 2' }),
      ],
    })
  })
})

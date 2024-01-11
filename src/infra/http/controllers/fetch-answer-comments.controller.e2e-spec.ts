import { AnswerFactory } from '$/factories/make-answer'
import { AnswerCommentFactory } from '$/factories/make-answer-comment'
import { QuestionFactory } from '$/factories/make-question'
import { StudentFactory } from '$/factories/make-student'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import dayjs from 'dayjs'
import request from 'supertest'

describe('Fetch answer comments (E2E)', () => {
  let app: INestApplication
  let jwt: JwtService
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let answerFactory: AnswerFactory
  let answerCommentFactory: AnswerCommentFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AnswerFactory,
        AnswerCommentFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()

    jwt = moduleRef.get(JwtService)
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    answerFactory = moduleRef.get(AnswerFactory)
    answerCommentFactory = moduleRef.get(AnswerCommentFactory)

    await app.init()
  })

  test('[GET] /answers/:answerId/comments', async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwt.sign({ sub: String(user.id) })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const answer = await answerFactory.makePrismaAnswer({
      questionId: question.id,
      authorId: user.id,
    })

    await Promise.all(
      Array.from({ length: 3 }).map((_, i) =>
        answerCommentFactory.makePrismaAnswerComment({
          answerId: answer.id,
          content: `Comment Content ${i}`,
          authorId: user.id,
          createdAt: dayjs(new Date())
            .add(4 - i, 'hours')
            .toDate(),
        }),
      ),
    )

    const response = await request(app.getHttpServer())
      .get(`/answers/${answer.id}/comments`)
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

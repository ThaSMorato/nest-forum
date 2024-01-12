import { AnswerFactory } from '$/factories/make-answer'
import { AnswerAttachmentFactory } from '$/factories/make-answer-attachment'
import { AttachmentFactory } from '$/factories/make-attachment'
import { QuestionFactory } from '$/factories/make-question'
import { StudentFactory } from '$/factories/make-student'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

describe('Edit answer (E2E)', () => {
  let app: INestApplication
  let jwt: JwtService
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let prisma: PrismaService
  let answerFactory: AnswerFactory
  let attachmentFactory: AttachmentFactory
  let answerAttachmentFactory: AnswerAttachmentFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AnswerFactory,
        AttachmentFactory,
        AnswerAttachmentFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()

    jwt = moduleRef.get(JwtService)
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    prisma = moduleRef.get(PrismaService)
    answerFactory = moduleRef.get(AnswerFactory)
    attachmentFactory = moduleRef.get(AttachmentFactory)
    answerAttachmentFactory = moduleRef.get(AnswerAttachmentFactory)

    await app.init()
  })

  test('[PUT] /answers/:id', async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwt.sign({ sub: String(user.id) })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const answer = await answerFactory.makePrismaAnswer({
      questionId: question.id,
      authorId: user.id,
    })

    const attachments = await Promise.all([
      attachmentFactory.makePrismaAttachment(),
      attachmentFactory.makePrismaAttachment(),
    ])

    await Promise.all([
      answerAttachmentFactory.makePrismaAnswerAttachment({
        answerId: answer.id,
        attachmentId: attachments[0].id,
      }),
      answerAttachmentFactory.makePrismaAnswerAttachment({
        answerId: answer.id,
        attachmentId: attachments[1].id,
      }),
    ])

    const newAttachment = await attachmentFactory.makePrismaAttachment()

    const response = await request(app.getHttpServer())
      .put(`/answers/${answer.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'New Answer Content',
        attachments: [String(attachments[0].id), String(newAttachment.id)],
      })

    const answerOnDatabase = await prisma.answer.findFirst({
      where: {
        questionId: String(question.id),
      },
    })

    expect(response.statusCode).toBe(204)
    expect(answerOnDatabase).toBeTruthy()
    expect(answerOnDatabase).toEqual(
      expect.objectContaining({
        content: 'New Answer Content',
      }),
    )

    const attchmentsOnDatabase = await prisma.attachment.findMany({
      where: {
        answerId: answerOnDatabase?.id,
      },
    })

    expect(attchmentsOnDatabase).toHaveLength(2)
    expect(attchmentsOnDatabase).toEqual([
      expect.objectContaining({
        id: String(attachments[0].id),
      }),
      expect.objectContaining({
        id: String(newAttachment.id),
      }),
    ])
  })
})

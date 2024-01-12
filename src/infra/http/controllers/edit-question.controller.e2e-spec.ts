import { AttachmentFactory } from '$/factories/make-attachment'
import { QuestionFactory } from '$/factories/make-question'
import { QuestionAttachmentFactory } from '$/factories/make-question-attachment'
import { StudentFactory } from '$/factories/make-student'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

describe('Edit question (E2E)', () => {
  let app: INestApplication
  let jwt: JwtService
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let attachmentFactory: AttachmentFactory
  let questionAttachmentFactory: QuestionAttachmentFactory
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AttachmentFactory,
        QuestionAttachmentFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()

    jwt = moduleRef.get(JwtService)
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    attachmentFactory = moduleRef.get(AttachmentFactory)
    questionAttachmentFactory = moduleRef.get(QuestionAttachmentFactory)

    prisma = moduleRef.get(PrismaService)

    await app.init()
  })

  test('[PUT] /questions/:id', async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwt.sign({ sub: String(user.id) })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const attachments = await Promise.all([
      attachmentFactory.makePrismaAttachment(),
      attachmentFactory.makePrismaAttachment(),
    ])

    await Promise.all([
      questionAttachmentFactory.makePrismaQuestionAttachment({
        questionId: question.id,
        attachmentId: attachments[0].id,
      }),
      questionAttachmentFactory.makePrismaQuestionAttachment({
        questionId: question.id,
        attachmentId: attachments[1].id,
      }),
    ])

    const newAttachment = await attachmentFactory.makePrismaAttachment()

    const response = await request(app.getHttpServer())
      .put(`/questions/${question.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'New Title',
        content: 'New Content',
        attachments: [String(attachments[0].id), String(newAttachment.id)],
      })

    const questionOnDatabase = await prisma.question.findUnique({
      where: {
        id: String(question.id),
      },
    })

    expect(response.statusCode).toBe(204)
    expect(questionOnDatabase).toBeTruthy()
    expect(questionOnDatabase).toEqual(
      expect.objectContaining({
        title: 'New Title',
        content: 'New Content',
      }),
    )

    const attchmentsOnDatabase = await prisma.attachment.findMany({
      where: {
        questionId: questionOnDatabase?.id,
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

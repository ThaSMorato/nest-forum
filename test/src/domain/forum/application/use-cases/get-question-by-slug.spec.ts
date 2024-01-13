import { makeAttachment } from '$/factories/make-attachment'
import { makeQuestion } from '$/factories/make-question'
import { makeQuestionAttachment } from '$/factories/make-question-attachment'
import { makeStudent } from '$/factories/make-student'
import {
  fakeQuestionsRepository,
  functions,
} from '$/repositories/fake-repositories/fake-questions-repository'
import { InMemoryAttachmentsRepository } from '$/repositories/in-memory/in-memory-attachments-repository'
import { InMemoryQuestionAttachmentsRepository } from '$/repositories/in-memory/in-memory-question-attachments-repository'
import { InMemoryQuestionsRepository } from '$/repositories/in-memory/in-memory-questions-repository'
import { InMemoryStudentsRepository } from '$/repositories/in-memory/in-memory-students-repository'
import { Left, Right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { GetQuestionBySlugUseCase } from '@/domain/forum/application/use-cases/get-question-by-slug'
import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug'

let sut: GetQuestionBySlugUseCase
let inMemoryRepository: InMemoryQuestionsRepository
let inMemoryStudentsRepository: InMemoryStudentsRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository

const newQuestion = makeQuestion({
  slug: Slug.create('a-test-slug'),
})

describe('Get Question By Slug Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new GetQuestionBySlugUseCase(fakeQuestionsRepository)
    })
    it('should be able to find a question by slug', async () => {
      functions.findBySlugWithDetails.mockResolvedValue(newQuestion)

      const response = await sut.execute({
        slug: 'a-test-slug',
      })
      expect(response).toBeInstanceOf(Right)
      expect(response.isRight()).toBeTruthy()

      expect(functions.findBySlugWithDetails).toBeCalled()
    })
    it('should throw if receives a not valid question slug', async () => {
      functions.findBySlugWithDetails.mockResolvedValue(null)

      const response = await sut.execute({
        slug: 'a-not-valid-test-slug',
      })
      expect(response).toBeInstanceOf(Left)
      expect(response.isLeft()).toBeTruthy()
      expect(response.value).toBeInstanceOf(ResourceNotFoundError)
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryStudentsRepository = new InMemoryStudentsRepository()
      inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
      inMemoryQuestionAttachmentsRepository =
        new InMemoryQuestionAttachmentsRepository()
      inMemoryRepository = new InMemoryQuestionsRepository(
        inMemoryStudentsRepository,
        inMemoryAttachmentsRepository,
        inMemoryQuestionAttachmentsRepository,
      )
      sut = new GetQuestionBySlugUseCase(inMemoryRepository)
    })

    it('should be able to find a question by slug', async () => {
      const student = makeStudent()

      await inMemoryStudentsRepository.create(student)

      const newIntegrationQuestion = makeQuestion({
        authorId: student.id,
        slug: Slug.create('a-test-slug'),
      })

      await inMemoryRepository.create(newIntegrationQuestion)

      const attachment = makeAttachment()

      inMemoryAttachmentsRepository.items.push(attachment)

      inMemoryQuestionAttachmentsRepository.items.push(
        makeQuestionAttachment({
          attachmentId: attachment.id,
          questionId: newIntegrationQuestion.id,
        }),
      )

      const spyFindBySlug = vi.spyOn(
        inMemoryRepository,
        'findBySlugWithDetails',
      )

      const response = await sut.execute({
        slug: newIntegrationQuestion.slug.value,
      })

      expect(response).toBeInstanceOf(Right)
      expect(response.isRight()).toBeTruthy()
      expect(response.value).toEqual(
        expect.objectContaining({
          question: expect.objectContaining({
            title: newIntegrationQuestion.title,
            authorId: newIntegrationQuestion.authorId,
            content: newIntegrationQuestion.content,
            author: student.name,
            attachments: [
              expect.objectContaining({
                title: attachment.title,
              }),
            ],
          }),
        }),
      )

      expect(spyFindBySlug).toBeCalled()
    })

    it('should throw if receives a not valid question slug', async () => {
      const response = await sut.execute({
        slug: 'a-not-valid-test-slug',
      })
      expect(response).toBeInstanceOf(Left)
      expect(response.isLeft()).toBeTruthy()
      expect(response.value).toBeInstanceOf(ResourceNotFoundError)
    })
  })
})

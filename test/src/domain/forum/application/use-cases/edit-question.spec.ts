import { makeQuestion } from '$/factories/make-question'
import { makeQuestionAttachment } from '$/factories/make-question-attachment'
import {
  fakeQuestionAttachmentsRepository,
  functions as attachmentFunctions,
} from '$/repositories/fake-repositories/fake-question-attachments-repository'
import {
  fakeQuestionsRepository,
  functions,
} from '$/repositories/fake-repositories/fake-questions-repository'
import { InMemoryQuestionAttachmentsRepository } from '$/repositories/in-memory/in-memory-question-attachments-repository'
import { InMemoryQuestionsRepository } from '$/repositories/in-memory/in-memory-questions-repository'
import { Left } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { EditQuestionUseCase } from '@/domain/forum/application/use-cases/edit-question'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

let sut: EditQuestionUseCase
let inMemoryRepository: InMemoryQuestionsRepository
let inMemoryAttachmentsRepository: InMemoryQuestionAttachmentsRepository

const newQuestion = makeQuestion(
  {
    authorId: new UniqueEntityID('author-1'),
  },
  new UniqueEntityID('question-1'),
)

describe('Edit Question Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new EditQuestionUseCase(
        fakeQuestionsRepository,
        fakeQuestionAttachmentsRepository,
      )
    })
    it('should be able to Edit a question', async () => {
      functions.findById.mockResolvedValue(newQuestion)

      await sut.execute({
        questionId: 'question-1',
        authorId: 'author-1',
        content: 'new content',
        title: 'new title',
        attachmentsIds: [],
      })

      expect(functions.findById).toBeCalled()
      expect(functions.save).toBeCalled()
      expect(attachmentFunctions.findManyByQuestionId).toBeCalled()
    })
    it('should throw if receives a not valid author id', async () => {
      functions.findById.mockResolvedValue(newQuestion)

      const response = await sut.execute({
        questionId: 'question-1',
        authorId: 'author-2',
        content: 'new content',
        title: 'new title',
        attachmentsIds: [],
      })
      expect(response).toBeInstanceOf(Left)
      expect(response.isLeft()).toBeTruthy()
      expect(response.value).toBeInstanceOf(NotAllowedError)
      expect(attachmentFunctions.findManyByQuestionId).not.toBeCalled()
    })
    it('should throw if receives a not valid question id', async () => {
      functions.findById.mockResolvedValue(null)

      const response = await sut.execute({
        questionId: 'a-not-valid-id',
        authorId: 'author-1',
        content: 'new content',
        title: 'new title',
        attachmentsIds: [],
      })
      expect(response).toBeInstanceOf(Left)
      expect(response.isLeft()).toBeTruthy()
      expect(response.value).toBeInstanceOf(ResourceNotFoundError)
      expect(attachmentFunctions.findManyByQuestionId).not.toBeCalled()
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryAttachmentsRepository =
        new InMemoryQuestionAttachmentsRepository()

      inMemoryRepository = new InMemoryQuestionsRepository(
        inMemoryAttachmentsRepository,
      )

      sut = new EditQuestionUseCase(
        inMemoryRepository,
        inMemoryAttachmentsRepository,
      )
    })
    it('should be able to Edit a question', async () => {
      const newIntegrationQuestion = makeQuestion(
        {
          authorId: new UniqueEntityID('author-1'),
        },
        new UniqueEntityID('question-1'),
      )

      await inMemoryRepository.create(newIntegrationQuestion)

      inMemoryAttachmentsRepository.items.push(
        makeQuestionAttachment({
          questionId: newIntegrationQuestion.id,
          attachmentId: new UniqueEntityID('1'),
        }),
        makeQuestionAttachment({
          questionId: newIntegrationQuestion.id,
          attachmentId: new UniqueEntityID('2'),
        }),
      )

      const spyFindById = vi.spyOn(inMemoryRepository, 'findById')
      const spyEdit = vi.spyOn(inMemoryRepository, 'save')

      await sut.execute({
        questionId: 'question-1',
        authorId: 'author-1',
        content: 'new content',
        title: 'new title',
        attachmentsIds: ['1', '3'],
      })

      expect(spyFindById).toBeCalled()
      expect(spyEdit).toBeCalled()
      expect(inMemoryRepository.items.length).toBe(1)
      expect(inMemoryRepository.items[0]).toMatchObject({
        content: 'new content',
        title: 'new title',
      })

      expect(inMemoryRepository.items[0].attachments.currentItems).toHaveLength(
        2,
      )
      expect(inMemoryRepository.items[0].attachments.currentItems).toEqual([
        expect.objectContaining({ attachmentId: new UniqueEntityID('1') }),
        expect.objectContaining({ attachmentId: new UniqueEntityID('3') }),
      ])
    })
    it('should throw if receives a not valid author id', async () => {
      const newIntegrationQuestion = makeQuestion(
        {
          authorId: new UniqueEntityID('author-1'),
        },
        new UniqueEntityID('question-1'),
      )

      await inMemoryRepository.create(newIntegrationQuestion)

      const spyEdit = vi.spyOn(inMemoryRepository, 'save')

      const response = await sut.execute({
        questionId: 'question-1',
        authorId: 'author-2',
        content: 'new content',
        title: 'new title',
        attachmentsIds: [],
      })
      expect(response).toBeInstanceOf(Left)
      expect(response.isLeft()).toBeTruthy()
      expect(response.value).toBeInstanceOf(NotAllowedError)
      expect(spyEdit).not.toBeCalled()
    })
    it('should throw if receives a not valid question id', async () => {
      const spyEdit = vi.spyOn(inMemoryRepository, 'save')

      const response = await sut.execute({
        questionId: 'a-not-valid-id',
        authorId: 'author-1',
        content: 'new content',
        title: 'new title',
        attachmentsIds: [],
      })
      expect(response).toBeInstanceOf(Left)
      expect(response.isLeft()).toBeTruthy()
      expect(response.value).toBeInstanceOf(ResourceNotFoundError)
      expect(spyEdit).not.toBeCalled()
    })
    it('should sync new and removed attachments when editing a question', async () => {
      const newIntegrationQuestion = makeQuestion(
        {
          authorId: new UniqueEntityID('author-1'),
        },
        new UniqueEntityID('question-1'),
      )

      await inMemoryRepository.create(newIntegrationQuestion)

      inMemoryAttachmentsRepository.items.push(
        makeQuestionAttachment({
          questionId: newIntegrationQuestion.id,
          attachmentId: new UniqueEntityID('1'),
        }),
        makeQuestionAttachment({
          questionId: newIntegrationQuestion.id,
          attachmentId: new UniqueEntityID('2'),
        }),
      )

      const spyCreateMany = vi.spyOn(
        inMemoryAttachmentsRepository,
        'createMany',
      )

      const spyDeleteMany = vi.spyOn(
        inMemoryAttachmentsRepository,
        'deleteMany',
      )

      const response = await sut.execute({
        questionId: String(newQuestion.id),
        authorId: 'author-1',
        content: 'new content',
        title: 'new title',
        attachmentsIds: ['1', '3'],
      })

      expect(response.isRight()).toBeTruthy()
      expect(spyCreateMany).toHaveBeenCalled()
      expect(spyDeleteMany).toHaveBeenCalled()
      expect(inMemoryAttachmentsRepository.items).toHaveLength(2)
      expect(inMemoryAttachmentsRepository.items).toEqual([
        expect.objectContaining({
          attachmentId: new UniqueEntityID('1'),
        }),
        expect.objectContaining({
          attachmentId: new UniqueEntityID('3'),
        }),
      ])
    })
  })
})

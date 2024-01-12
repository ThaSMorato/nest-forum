import { makeInMemoryAnswerRepository } from '$/factories/make-in-memory-answer-repository'
import { fakeAnswersRepository } from '$/repositories/fake-repositories/fake-answers-repository'
import { InMemoryAnswerAttachmentsRepository } from '$/repositories/in-memory/in-memory-answer-attachments-repository'
import { InMemoryAnswersRepository } from '$/repositories/in-memory/in-memory-answers-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { AnswerQuestionUseCase } from '@/domain/forum/application/use-cases/answer-question'

let sut: AnswerQuestionUseCase
let inMemoryRepository: InMemoryAnswersRepository
let inMemoryAttachmentsRepository: InMemoryAnswerAttachmentsRepository

describe('Answer Question Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unit Tests', () => {
    beforeEach(() => {
      sut = new AnswerQuestionUseCase(fakeAnswersRepository)
    })

    it('should be able to answer a question', async () => {
      const result = await sut.execute({
        content: 'Nova Resposta',
        authorId: '1',
        questionId: '1',
        attachmentsIds: [],
      })

      expect(result.isRight()).toBeTruthy()

      expect(result.value?.answer.content).toEqual('Nova Resposta')
      expect(result.value?.answer.authorId.toValue()).toEqual('1')
      expect(result.value?.answer.questionId.toValue()).toEqual('1')

      expect(fakeAnswersRepository.create).toBeCalled()
    })
  })

  describe('Integration Tests', () => {
    beforeEach(() => {
      inMemoryAttachmentsRepository = new InMemoryAnswerAttachmentsRepository()
      inMemoryRepository = makeInMemoryAnswerRepository(
        inMemoryAttachmentsRepository,
      )
      sut = new AnswerQuestionUseCase(inMemoryRepository)
    })
    it('should be able to answer a question', async () => {
      const spyCreate = vi.spyOn(inMemoryRepository, 'create')

      const result = await sut.execute({
        content: 'Nova Resposta',
        authorId: '1',
        questionId: '1',
        attachmentsIds: ['1', '2'],
      })

      expect(result.isRight()).toBeTruthy()
      expect(result.value?.answer.content).toEqual('Nova Resposta')
      expect(result.value?.answer.authorId.toValue()).toEqual('1')
      expect(result.value?.answer.questionId.toValue()).toEqual('1')
      expect(inMemoryRepository.items[0].id).toEqual(result.value?.answer.id)

      expect(spyCreate).toBeCalled()

      expect(inMemoryRepository.items.length).toEqual(1)

      expect(inMemoryRepository.items[0].attachments.currentItems).toHaveLength(
        2,
      )
      expect(inMemoryRepository.items[0].attachments.currentItems).toEqual([
        expect.objectContaining({ attachmentId: new UniqueEntityID('1') }),
        expect.objectContaining({ attachmentId: new UniqueEntityID('2') }),
      ])
    })
    it('should persist attachments when creating a new answer', async () => {
      const spyCreateMany = vi.spyOn(
        inMemoryAttachmentsRepository,
        'createMany',
      )

      const response = await sut.execute({
        authorId: '1',
        questionId: '1',
        content: 'Conteúdo da nova pergunta',
        attachmentsIds: ['1', '2'],
      })

      expect(response.isRight()).toBeTruthy()
      expect(spyCreateMany).toHaveBeenCalled()
      expect(inMemoryAttachmentsRepository.items).toHaveLength(2)
      expect(inMemoryAttachmentsRepository.items).toEqual([
        expect.objectContaining({
          attachmentId: new UniqueEntityID('1'),
        }),
        expect.objectContaining({
          attachmentId: new UniqueEntityID('2'),
        }),
      ])
    })
  })
})

import { fakeQuestionsRepository } from '$/repositories/fake-repositories/fake-questions-repository'
import { InMemoryAttachmentsRepository } from '$/repositories/in-memory/in-memory-attachments-repository'
import { InMemoryQuestionAttachmentsRepository } from '$/repositories/in-memory/in-memory-question-attachments-repository'
import { InMemoryQuestionsRepository } from '$/repositories/in-memory/in-memory-questions-repository'
import { InMemoryStudentsRepository } from '$/repositories/in-memory/in-memory-students-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { CreateQuestionUseCase } from '@/domain/forum/application/use-cases/create-question'

let sut: CreateQuestionUseCase
let inMemoryRepository: InMemoryQuestionsRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryStudentsRepository: InMemoryStudentsRepository
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository

describe('Create Question Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new CreateQuestionUseCase(fakeQuestionsRepository)
    })
    it('should be able to create a question', async () => {
      const response = await sut.execute({
        authorId: '1',
        title: 'Nova pergunta',
        content: 'Conteúdo da nova pergunta',
        attachmentsIds: ['1', '2'],
      })

      expect(response.isRight()).toBeTruthy()

      expect(response.value?.question.title).toEqual('Nova pergunta')
      expect(response.value?.question.slug.value).toEqual('nova-pergunta')
      expect(response.value?.question.authorId.toValue()).toEqual('1')
      expect(response.value?.question.content).toEqual(
        'Conteúdo da nova pergunta',
      )
      expect(response.value?.question.id.toValue()).toEqual(expect.any(String))

      expect(fakeQuestionsRepository.create).toBeCalled()
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()

      inMemoryStudentsRepository = new InMemoryStudentsRepository()
      inMemoryQuestionAttachmentsRepository =
        new InMemoryQuestionAttachmentsRepository()
      inMemoryRepository = new InMemoryQuestionsRepository(
        inMemoryStudentsRepository,
        inMemoryAttachmentsRepository,
        inMemoryQuestionAttachmentsRepository,
      )
      sut = new CreateQuestionUseCase(inMemoryRepository)
    })

    it('should be able to create a question', async () => {
      const spyCreate = vi.spyOn(inMemoryRepository, 'create')

      const response = await sut.execute({
        authorId: '1',
        title: 'Nova pergunta',
        content: 'Conteúdo da nova pergunta',
        attachmentsIds: ['1', '2'],
      })

      expect(response.isRight()).toBeTruthy()

      expect(response.value?.question.title).toEqual('Nova pergunta')
      expect(response.value?.question.slug.value).toEqual('nova-pergunta')
      expect(response.value?.question.authorId.toValue()).toEqual('1')
      expect(response.value?.question.content).toEqual(
        'Conteúdo da nova pergunta',
      )
      expect(response.value?.question.id.toValue()).toEqual(expect.any(String))
      expect(inMemoryRepository.items[0].id).toEqual(
        response.value?.question.id,
      )

      expect(inMemoryRepository.items[0].attachments.currentItems).toHaveLength(
        2,
      )
      expect(inMemoryRepository.items[0].attachments.currentItems).toEqual([
        expect.objectContaining({ attachmentId: new UniqueEntityID('1') }),
        expect.objectContaining({ attachmentId: new UniqueEntityID('2') }),
      ])

      expect(spyCreate).toBeCalled()

      expect(inMemoryRepository.items.length).toEqual(1)
    })
    it('should persist attachments when creating a new question', async () => {
      const spyCreateMany = vi.spyOn(
        inMemoryQuestionAttachmentsRepository,
        'createMany',
      )

      const response = await sut.execute({
        authorId: '1',
        title: 'Nova pergunta',
        content: 'Conteúdo da nova pergunta',
        attachmentsIds: ['1', '2'],
      })

      expect(response.isRight()).toBeTruthy()
      expect(spyCreateMany).toHaveBeenCalled()
      expect(inMemoryQuestionAttachmentsRepository.items).toHaveLength(2)
      expect(inMemoryQuestionAttachmentsRepository.items).toEqual([
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

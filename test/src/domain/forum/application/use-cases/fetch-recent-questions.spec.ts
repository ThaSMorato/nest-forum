import { makeQuestion } from '$/factories/make-question'
import {
  fakeQuestionsRepository,
  functions,
} from '$/repositories/fake-repositories/fake-questions-repository'
import { InMemoryAttachmentsRepository } from '$/repositories/in-memory/in-memory-attachments-repository'
import { InMemoryQuestionAttachmentsRepository } from '$/repositories/in-memory/in-memory-question-attachments-repository'
import { InMemoryQuestionsRepository } from '$/repositories/in-memory/in-memory-questions-repository'
import { InMemoryStudentsRepository } from '$/repositories/in-memory/in-memory-students-repository'
import { Right } from '@/core/either'
import { FetchRecentQuestionsUseCase } from '@/domain/forum/application/use-cases/fetch-recent-questions'

let sut: FetchRecentQuestionsUseCase
let inMemoryRepository: InMemoryQuestionsRepository
let inMemoryStudentsRepository: InMemoryStudentsRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository

describe('Fetch Recent Questions Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new FetchRecentQuestionsUseCase(fakeQuestionsRepository)
    })
    it('should be able to fetch recent questions', async () => {
      const respose = [makeQuestion()]
      functions.findManyRecent.mockResolvedValue(respose)

      const response = await sut.execute({
        page: 1,
      })
      expect(response).toBeInstanceOf(Right)
      expect(response.isRight()).toBeTruthy()

      expect(response.value?.questions).toHaveLength(1)
      expect(response.value?.questions).toBe(respose)

      expect(functions.findManyRecent).toBeCalled()
      expect(functions.findManyRecent).toBeCalledWith({
        page: 1,
      })
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
      sut = new FetchRecentQuestionsUseCase(inMemoryRepository)
    })

    it('should be able to fetch recent questions', async () => {
      await inMemoryRepository.create(
        makeQuestion({ createdAt: new Date(2023, 0, 20) }),
      )
      await inMemoryRepository.create(
        makeQuestion({ createdAt: new Date(2023, 0, 18) }),
      )
      await inMemoryRepository.create(
        makeQuestion({ createdAt: new Date(2023, 0, 23) }),
      )

      const spyFindManyRecent = vi.spyOn(inMemoryRepository, 'findManyRecent')

      const response = await sut.execute({
        page: 1,
      })
      expect(response).toBeInstanceOf(Right)
      expect(response.isRight()).toBeTruthy()

      expect(response.value?.questions).toEqual([
        expect.objectContaining({ createdAt: new Date(2023, 0, 23) }),
        expect.objectContaining({ createdAt: new Date(2023, 0, 20) }),
        expect.objectContaining({ createdAt: new Date(2023, 0, 18) }),
      ])

      expect(spyFindManyRecent).toBeCalled()
    })

    it('should be able to fetch paginated recent questions', async () => {
      for (let index = 1; index <= 22; index++) {
        await inMemoryRepository.create(
          makeQuestion({ createdAt: new Date(2023, 0, 23 - index) }),
        )
      }
      const spyFindManyRecent = vi.spyOn(inMemoryRepository, 'findManyRecent')

      const response = await sut.execute({
        page: 2,
      })
      expect(response).toBeInstanceOf(Right)
      expect(response.isRight()).toBeTruthy()

      expect(response.value?.questions).toEqual([
        expect.objectContaining({ createdAt: new Date(2023, 0, 2) }),
        expect.objectContaining({ createdAt: new Date(2023, 0, 1) }),
      ])
      expect(response.value?.questions).toHaveLength(2)

      expect(spyFindManyRecent).toBeCalled()
    })
  })
})

import { makeAnswer } from '$/factories/make-answer'
import { makeInMemoryAnswerRepository } from '$/factories/make-in-memory-answer-repository'
import { makeQuestion } from '$/factories/make-question'
import {
  fakeAnswersRepository,
  functions as answerFunctions,
} from '$/repositories/fake-repositories/fake-answers-repository'
import {
  fakeQuestionsRepository,
  functions as questionFunctions,
} from '$/repositories/fake-repositories/fake-questions-repository'
import { InMemoryAnswersRepository } from '$/repositories/in-memory/in-memory-answers-repository'
import { InMemoryQuestionsRepository } from '$/repositories/in-memory/in-memory-questions-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ChooseQuestionBestAnswerUseCase } from '@/domain/forum/application/use-cases/choose-question-best-answer'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { InMemoryAttachmentsRepository } from '$/repositories/in-memory/in-memory-attachments-repository'
import { InMemoryQuestionAttachmentsRepository } from '$/repositories/in-memory/in-memory-question-attachments-repository'
import { InMemoryStudentsRepository } from '$/repositories/in-memory/in-memory-students-repository'

let sut: ChooseQuestionBestAnswerUseCase
let inMemoryAnswersRepository: InMemoryAnswersRepository
let inMemoryQuestionsRepository: InMemoryQuestionsRepository

let inMemoryStudentsRepository: InMemoryStudentsRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository

const newQuestion = makeQuestion({
  authorId: new UniqueEntityID('author-1'),
})

const newAnswer = makeAnswer({
  questionId: newQuestion.id,
})

describe('Chose Question Best Answer Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new ChooseQuestionBestAnswerUseCase(
        fakeAnswersRepository,
        fakeQuestionsRepository,
      )
    })
    it('should be able to choose the question best answer', async () => {
      answerFunctions.findById.mockResolvedValue(newAnswer)
      questionFunctions.findById.mockResolvedValue(newQuestion)

      await sut.execute({
        answerId: String(newAnswer.id),
        authorId: String(newQuestion.authorId),
      })

      expect(questionFunctions.findById).toBeCalled()
      expect(questionFunctions.save).toBeCalled()
      expect(answerFunctions.findById).toBeCalled()
    })
    it('should throw if receives a not valid author id', async () => {
      answerFunctions.findById.mockResolvedValue(newAnswer)

      const response = await sut.execute({
        answerId: String(newAnswer.id),
        authorId: 'author-2',
      })

      expect(response.value).toBeInstanceOf(NotAllowedError)
      expect(response.isLeft()).toBeTruthy()

      expect(questionFunctions.save).not.toBeCalled()
    })
    it('should throw if receives a not valid answer id', async () => {
      answerFunctions.findById.mockResolvedValue(null)

      const response = await sut.execute({
        answerId: 'a-not-valid-id',
        authorId: 'author-1',
      })

      expect(response.value).toBeInstanceOf(ResourceNotFoundError)
      expect(response.isLeft()).toBeTruthy()
      expect(questionFunctions.save).not.toBeCalled()
    })
    it('should throw if question repo returns null', async () => {
      answerFunctions.findById.mockResolvedValue(newAnswer)
      questionFunctions.findById.mockResolvedValue(null)

      const response = await sut.execute({
        answerId: 'a-not-valid-id',
        authorId: 'author-1',
      })
      expect(response.value).toBeInstanceOf(ResourceNotFoundError)
      expect(response.isLeft()).toBeTruthy()
      expect(questionFunctions.save).not.toBeCalled()
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryStudentsRepository = new InMemoryStudentsRepository()
      inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
      inMemoryQuestionAttachmentsRepository =
        new InMemoryQuestionAttachmentsRepository()

      inMemoryAnswersRepository = makeInMemoryAnswerRepository()
      inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
        inMemoryStudentsRepository,
        inMemoryAttachmentsRepository,
        inMemoryQuestionAttachmentsRepository,
      )

      sut = new ChooseQuestionBestAnswerUseCase(
        inMemoryAnswersRepository,
        inMemoryQuestionsRepository,
      )
    })

    it('should be able to choose the question best answer', async () => {
      await inMemoryAnswersRepository.create(newAnswer)
      await inMemoryQuestionsRepository.create(newQuestion)

      const spyFindAnswerById = vi.spyOn(inMemoryAnswersRepository, 'findById')
      const spyFindQuestionById = vi.spyOn(
        inMemoryQuestionsRepository,
        'findById',
      )
      const spySave = vi.spyOn(inMemoryQuestionsRepository, 'save')

      await sut.execute({
        answerId: String(newAnswer.id),
        authorId: String(newQuestion.authorId),
      })

      expect(spyFindAnswerById).toBeCalled()
      expect(spyFindQuestionById).toBeCalled()
      expect(spySave).toBeCalled()
      expect(inMemoryQuestionsRepository.items[0].bestAnswerId).toBe(
        newAnswer.id,
      )
    })
    it('should throw if receives a not valid author id', async () => {
      await inMemoryAnswersRepository.create(newAnswer)
      await inMemoryQuestionsRepository.create(newQuestion)

      const spySave = vi.spyOn(inMemoryQuestionsRepository, 'save')

      const response = await sut.execute({
        answerId: String(newAnswer.id),
        authorId: 'author-2',
      })

      expect(response.value).toBeInstanceOf(NotAllowedError)
      expect(response.isLeft()).toBeTruthy()

      expect(spySave).not.toBeCalled()
    })
    it('should throw if receives a not valid answer id', async () => {
      const spySave = vi.spyOn(inMemoryQuestionsRepository, 'save')

      const response = await sut.execute({
        answerId: 'a-not-valid-id',
        authorId: 'author-1',
      })

      expect(response.value).toBeInstanceOf(ResourceNotFoundError)
      expect(response.isLeft()).toBeTruthy()

      expect(spySave).not.toBeCalled()
    })
    it('should throw if returns a invalid question', async () => {
      const spySave = vi.spyOn(inMemoryQuestionsRepository, 'save')
      const spyFindById = vi.spyOn(inMemoryQuestionsRepository, 'findById')

      spyFindById.mockResolvedValue(null)

      const response = await sut.execute({
        answerId: String(newAnswer.id),
        authorId: String(newQuestion.authorId),
      })

      expect(response.value).toBeInstanceOf(ResourceNotFoundError)
      expect(response.isLeft()).toBeTruthy()

      expect(spySave).not.toBeCalled()
    })
  })
})

import {
  makeAnswerComment,
  makeAnswerCommentWithAuthor,
} from '$/factories/make-answer-comment'
import { makeStudent } from '$/factories/make-student'
import {
  fakeAnswerCommentsRepository,
  functions,
} from '$/repositories/fake-repositories/fake-answer-comments-repository'
import { InMemoryAnswerCommentsRepository } from '$/repositories/in-memory/in-memory-answer-comments-repository'
import { InMemoryStudentsRepository } from '$/repositories/in-memory/in-memory-students-repository'
import { Right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { FetchAnswerCommentsUseCase } from '@/domain/forum/application/use-cases/fetch-answer-comments'

let sut: FetchAnswerCommentsUseCase
let inMemoryRepository: InMemoryAnswerCommentsRepository
let inMemoryStudentsRepository: InMemoryStudentsRepository

describe('Fetch Answer Comments Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new FetchAnswerCommentsUseCase(fakeAnswerCommentsRepository)
    })
    it('should be able to fetch answer`s comments', async () => {
      const student = makeStudent()
      const answerComment = makeAnswerComment({
        authorId: student.id,
      })

      const expected = [
        makeAnswerCommentWithAuthor({
          authorId: student.id,
          author: student.name,
          commentId: answerComment.id,
          content: answerComment.content,
        }),
      ]

      functions.findManyByAnswerIdWithAuthor.mockResolvedValue(expected)

      const response = await sut.execute({
        page: 1,
        answerId: 'answer-1',
      })
      expect(response).toBeInstanceOf(Right)
      expect(response.isRight()).toBeTruthy()

      expect(response.value?.comments).toHaveLength(1)
      expect(response.value?.comments).toBe(expected)

      expect(functions.findManyByAnswerIdWithAuthor).toBeCalled()
      expect(functions.findManyByAnswerIdWithAuthor).toBeCalledWith(
        'answer-1',
        {
          page: 1,
        },
      )
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryStudentsRepository = new InMemoryStudentsRepository()

      inMemoryRepository = new InMemoryAnswerCommentsRepository(
        inMemoryStudentsRepository,
      )

      sut = new FetchAnswerCommentsUseCase(inMemoryRepository)
    })

    it('should be able to fetch answer`s answerComments', async () => {
      const student = makeStudent()

      inMemoryStudentsRepository.items.push(student)

      await inMemoryRepository.create(
        makeAnswerComment(
          {
            authorId: student.id,
            answerId: new UniqueEntityID('answer-1'),
          },
          new UniqueEntityID('comment-1'),
        ),
      )
      await inMemoryRepository.create(
        makeAnswerComment(
          {
            authorId: student.id,
            answerId: new UniqueEntityID('answer-1'),
          },
          new UniqueEntityID('comment-2'),
        ),
      )
      await inMemoryRepository.create(
        makeAnswerComment(
          {
            authorId: student.id,
            answerId: new UniqueEntityID('answer-1'),
          },
          new UniqueEntityID('comment-3'),
        ),
      )

      const spyFindManyByAnswerId = vi.spyOn(
        inMemoryRepository,
        'findManyByAnswerIdWithAuthor',
      )

      const response = await sut.execute({
        page: 1,
        answerId: 'answer-1',
      })
      expect(response).toBeInstanceOf(Right)
      expect(response.isRight()).toBeTruthy()

      expect(response.value?.comments).toEqual([
        expect.objectContaining({
          commentId: new UniqueEntityID('comment-1'),
          authorId: student.id,
        }),
        expect.objectContaining({
          commentId: new UniqueEntityID('comment-2'),
          authorId: student.id,
        }),
        expect.objectContaining({
          commentId: new UniqueEntityID('comment-3'),
          authorId: student.id,
        }),
      ])
      expect(response.value?.comments).toHaveLength(3)

      expect(spyFindManyByAnswerId).toBeCalled()
    })

    it('should be able to fetch paginated answer`s answerComments', async () => {
      const student = makeStudent()

      inMemoryStudentsRepository.items.push(student)

      for (let index = 1; index <= 22; index++) {
        await inMemoryRepository.create(
          makeAnswerComment(
            { answerId: new UniqueEntityID('answer-1'), authorId: student.id },
            new UniqueEntityID(`comment-${index + 1}`),
          ),
        )
      }
      const spyFindManyByAnswerId = vi.spyOn(
        inMemoryRepository,
        'findManyByAnswerIdWithAuthor',
      )

      const response = await sut.execute({
        page: 2,
        answerId: 'answer-1',
      })

      expect(response).toBeInstanceOf(Right)
      expect(response.isRight()).toBeTruthy()

      expect(response.value?.comments).toEqual([
        expect.objectContaining({
          authorId: student.id,
          commentId: new UniqueEntityID('comment-22'),
        }),
        expect.objectContaining({
          authorId: student.id,
          commentId: new UniqueEntityID('comment-23'),
        }),
      ])

      expect(response.value?.comments).toHaveLength(2)

      expect(spyFindManyByAnswerId).toBeCalled()
    })
  })
})

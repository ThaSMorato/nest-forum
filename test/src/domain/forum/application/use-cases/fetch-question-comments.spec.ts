import {
  makeQuestionComment,
  makeQuestionCommentWithAuthor,
} from '$/factories/make-question-comment'
import { makeStudent } from '$/factories/make-student'
import {
  fakeQuestionCommentsRepository,
  functions,
} from '$/repositories/fake-repositories/fake-question-comments-repository'
import { InMemoryQuestionCommentsRepository } from '$/repositories/in-memory/in-memory-question-comments-repository'
import { InMemoryStudentsRepository } from '$/repositories/in-memory/in-memory-students-repository'
import { Right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { FetchQuestionCommentsUseCase } from '@/domain/forum/application/use-cases/fetch-question-comments'

let sut: FetchQuestionCommentsUseCase
let inMemoryRepository: InMemoryQuestionCommentsRepository
let inMemoryStudentsRepository: InMemoryStudentsRepository

describe('Fetch Question Comments Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new FetchQuestionCommentsUseCase(fakeQuestionCommentsRepository)
    })
    it('should be able to fetch question`s comments', async () => {
      const student = makeStudent()
      const questionComment = makeQuestionComment({
        authorId: student.id,
      })

      const expected = [
        makeQuestionCommentWithAuthor({
          authorId: student.id,
          author: student.name,
          commentId: questionComment.id,
          content: questionComment.content,
        }),
      ]

      functions.findManyByQuestionIdWithAuthor.mockResolvedValue(expected)

      const response = await sut.execute({
        page: 1,
        questionId: 'question-1',
      })
      expect(response).toBeInstanceOf(Right)
      expect(response.isRight()).toBeTruthy()

      expect(response.value?.comments).toHaveLength(1)
      expect(response.value?.comments).toBe(expected)

      expect(functions.findManyByQuestionIdWithAuthor).toBeCalled()
      expect(functions.findManyByQuestionIdWithAuthor).toBeCalledWith(
        'question-1',
        {
          page: 1,
        },
      )
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryStudentsRepository = new InMemoryStudentsRepository()
      inMemoryRepository = new InMemoryQuestionCommentsRepository(
        inMemoryStudentsRepository,
      )
      sut = new FetchQuestionCommentsUseCase(inMemoryRepository)
    })

    it('should be able to fetch question`s questionComments', async () => {
      const student = makeStudent()

      inMemoryStudentsRepository.items.push(student)

      await Promise.all([
        inMemoryRepository.create(
          makeQuestionComment(
            {
              questionId: new UniqueEntityID('question-1'),
              authorId: student.id,
            },
            new UniqueEntityID('comment-1'),
          ),
        ),
        inMemoryRepository.create(
          makeQuestionComment(
            {
              questionId: new UniqueEntityID('question-1'),
              authorId: student.id,
            },
            new UniqueEntityID('comment-2'),
          ),
        ),
        inMemoryRepository.create(
          makeQuestionComment(
            {
              questionId: new UniqueEntityID('question-1'),
              authorId: student.id,
            },
            new UniqueEntityID('comment-3'),
          ),
        ),
      ])

      const spyFindManyByQuestionId = vi.spyOn(
        inMemoryRepository,
        'findManyByQuestionIdWithAuthor',
      )

      const response = await sut.execute({
        page: 1,
        questionId: 'question-1',
      })
      expect(response).toBeInstanceOf(Right)
      expect(response.isRight()).toBeTruthy()

      expect(response.value?.comments).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            authorId: student.id,
            commentId: new UniqueEntityID('comment-1'),
          }),
          expect.objectContaining({
            authorId: student.id,
            commentId: new UniqueEntityID('comment-2'),
          }),
          expect.objectContaining({
            authorId: student.id,
            commentId: new UniqueEntityID('comment-3'),
          }),
        ]),
      )

      expect(response.value?.comments).toHaveLength(3)

      expect(spyFindManyByQuestionId).toBeCalled()
    })

    it('should be able to fetch paginated question`s questionComments', async () => {
      const student = makeStudent()

      inMemoryStudentsRepository.items.push(student)

      for (let index = 1; index <= 22; index++) {
        await inMemoryRepository.create(
          makeQuestionComment(
            {
              questionId: new UniqueEntityID('question-1'),
              authorId: student.id,
            },
            new UniqueEntityID(`comment-${index + 1}`),
          ),
        )
      }
      const spyFindManyByQuestionId = vi.spyOn(
        inMemoryRepository,
        'findManyByQuestionIdWithAuthor',
      )

      const response = await sut.execute({
        page: 2,
        questionId: 'question-1',
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

      expect(spyFindManyByQuestionId).toBeCalled()
    })
  })
})

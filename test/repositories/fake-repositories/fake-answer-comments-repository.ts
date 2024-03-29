import { AnswerCommentsRepository } from '@/domain/forum/application/repositories/answer-comments-repository'
import { vi } from 'vitest'

const create = vi.fn()
const _delete = vi.fn()
const findById = vi.fn()
const findManyByAnswerId = vi.fn()
const findManyByAnswerIdWithAuthor = vi.fn()

export const functions = {
  create,
  delete: _delete,
  findById,
  findManyByAnswerId,
  findManyByAnswerIdWithAuthor,
}

export const fakeAnswerCommentsRepository: AnswerCommentsRepository = functions

import { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository'
import { vi } from 'vitest'

const create = vi.fn()
const findBySlug = vi.fn()
const _delete = vi.fn()
const findById = vi.fn()
const save = vi.fn()
const findManyRecent = vi.fn()
const findBySlugWithDetails = vi.fn()

export const functions = {
  create,
  findBySlug,
  delete: _delete,
  findById,
  save,
  findManyRecent,
  findBySlugWithDetails,
}

export const fakeQuestionsRepository: QuestionsRepository = functions

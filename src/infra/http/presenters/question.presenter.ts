import { Question } from '@/domain/forum/enterprise/entities/question'

export class QuestionPresenter {
  static toHTTP({
    id,
    title,
    slug,
    bestAnswerId,
    createdAt,
    updatedAt,
  }: Question) {
    return {
      id: String(id),
      title,
      slug: slug.value,
      bestAnswerId: bestAnswerId ? String(bestAnswerId) : null,
      createdAt,
      updatedAt,
    }
  }
}

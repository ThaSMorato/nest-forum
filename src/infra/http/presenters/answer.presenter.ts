import { Answer } from '@/domain/forum/enterprise/entities/answer'

export class AnswerPresenter {
  static toHTTP({ id, createdAt, updatedAt, content }: Answer) {
    return {
      id: String(id),
      content,
      createdAt,
      updatedAt,
    }
  }
}

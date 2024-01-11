import { QuestionComment } from '@/domain/forum/enterprise/entities/question-comment'
import { AnswerComment } from '@/domain/forum/enterprise/entities/answer-comment'

export class CommentPresenter {
  static toHTTP({
    id,
    createdAt,
    updatedAt,
    content,
  }: QuestionComment | AnswerComment) {
    return {
      id: String(id),
      content,
      createdAt,
      updatedAt,
    }
  }
}

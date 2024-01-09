import { Controller, Get, HttpCode, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import { z } from 'zod'
import { FetchRecentQuestionsUseCase } from '@/domain/forum/application/use-cases/fetch-recent-questions'
import { QuestionPresenter } from '../presenters/question.presenter'

const fetchRecentQuestionsQuerySchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(
  fetchRecentQuestionsQuerySchema,
)

type FetchRecentQuestionsQuerySchema = z.infer<
  typeof fetchRecentQuestionsQuerySchema
>

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class FetchRecentQuestionsController {
  constructor(private fetchRecentQuestions: FetchRecentQuestionsUseCase) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Query('page', queryValidationPipe) page: FetchRecentQuestionsQuerySchema,
  ) {
    const result = await this.fetchRecentQuestions.execute({ page })

    if (result.isLeft()) {
      throw new Error()
    }

    const { questions } = result.value

    return {
      questions: questions.map(QuestionPresenter.toHTTP),
    }
  }
}

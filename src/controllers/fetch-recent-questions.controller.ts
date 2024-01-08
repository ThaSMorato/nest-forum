import { Controller, Get, HttpCode, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe'
import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'

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
  constructor(private prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Query('page', queryValidationPipe) page: FetchRecentQuestionsQuerySchema,
  ) {
    const perPage = 20

    const questions = await this.prisma.question.findMany({
      take: perPage,
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * perPage,
    })

    return { questions }
  }
}

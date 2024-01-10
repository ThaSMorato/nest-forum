import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Student } from '@/domain/forum/enterprise/entities/student'
import { User as PrismaUser, Prisma } from '@prisma/client'

export class PrismaStudentMapper {
  static toDomain({ id, email, name, password }: PrismaUser): Student {
    return Student.create(
      {
        email,
        name,
        password,
      },
      new UniqueEntityID(id),
    )
  }

  static toPrisma({
    email,
    id,
    name,
    password,
  }: Student): Prisma.UserUncheckedCreateInput {
    return {
      email,
      name,
      password,
      id: String(id),
    }
  }
}

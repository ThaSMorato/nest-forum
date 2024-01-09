import { Student } from '../../enterprise/entities/student'

export abstract class StudentsRepository {
  abstract create(Student: Student): Promise<void>
  abstract findByEmail(email: string): Promise<Student | null>
}

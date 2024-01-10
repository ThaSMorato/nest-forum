import { InMemoryStudentsRepository } from '$/repositories/in-memory/in-memory-students-repository'
import { FakeHasher } from '../cryptography/fake-hasher'
import { AuthenticateStudentUseCase } from '@/domain/forum/application/use-cases/authenticate-student'
import { FakeEncrypter } from '../cryptography/fake-encrypter'
import { makeStudent } from '$/factories/make-student'

let sut: AuthenticateStudentUseCase
let inMemoryRepository: InMemoryStudentsRepository
let fakeEncrypter: FakeEncrypter
let fakeHasher: FakeHasher

describe('Create Student Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      fakeEncrypter = new FakeEncrypter()
      fakeHasher = new FakeHasher()
      inMemoryRepository = new InMemoryStudentsRepository()
      sut = new AuthenticateStudentUseCase(
        inMemoryRepository,
        fakeHasher,
        fakeEncrypter,
      )
    })

    it('should be able to authenticate a new student', async () => {
      const spyFindByEmail = vi.spyOn(inMemoryRepository, 'findByEmail')
      const spyCompare = vi.spyOn(fakeHasher, 'compare')
      const spyEncrypt = vi.spyOn(fakeEncrypter, 'encrypt')

      const hashedPassword = await fakeHasher.hash('1234567')

      const student = makeStudent({
        email: 'jhon@doe.com',
        password: hashedPassword,
      })

      await inMemoryRepository.create(student)

      const response = await sut.execute({
        email: 'jhon@doe.com',
        password: '1234567',
      })

      expect(response.isRight()).toBeTruthy()

      expect(response.value).toEqual({
        accessToken: expect.any(String),
      })

      expect(spyFindByEmail).toBeCalled()
      expect(spyCompare).toBeCalled()
      expect(spyEncrypt).toBeCalled()
    })
  })
})

import { Env } from './env'
import { ConfigService } from '@nestjs/config'
import { Injectable } from '@nestjs/common'

@Injectable()
export class EnvService {
  constructor(private configService: ConfigService<Env, true>) {}

  get<Key extends keyof Env>(key: Key) {
    return this.configService.get(key, { infer: true })
  }
}

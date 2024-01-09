export abstract class HashGenerator {
  abstract hash(plai: string): Promise<string>
}

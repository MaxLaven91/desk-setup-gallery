import { PrismaClient } from '@prisma/client'

const prismaClientPropertyName = `__prevent_name_collision__prisma`
type GlobalThisWithPrisma = typeof globalThis & {
  [prismaClientPropertyName]: PrismaClient
}

const getPrismaClient = () => {
  if (process.env.NODE_ENV === 'production') {
    return new PrismaClient()
  } else {
    const globalWithPrisma = globalThis as GlobalThisWithPrisma
    if (!globalWithPrisma[prismaClientPropertyName]) {
      globalWithPrisma[prismaClientPropertyName] = new PrismaClient()
    }
    return globalWithPrisma[prismaClientPropertyName]
  }
}

const prisma = getPrismaClient()

export default prisma
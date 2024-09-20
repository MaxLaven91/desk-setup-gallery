import { PrismaClient } from '@prisma/client'

const prismaClientPropertyName = `__prevent_name_collision__prisma`

const getPrismaClient = () => {
  if (process.env.NODE_ENV === 'production') {
    return new PrismaClient()
  } else {
    if (!global[prismaClientPropertyName]) {
      global[prismaClientPropertyName] = new PrismaClient()
    }
    return global[prismaClientPropertyName]
  }
}

const prisma = getPrismaClient()

export default prisma
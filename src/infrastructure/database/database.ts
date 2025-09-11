// import { PrismaClient } from ".prisma";
// const prisma = new PrismaClient();
//
// export default prisma;

// import { PrismaClient } from "@prisma/client";
import { PrismaClient } from ".prisma";
// ✅ Import the type from the actual generated file
import type { PrismaClient as GeneratedClient } from ".prisma/client/index";
//
const prisma = new PrismaClient() as unknown as GeneratedClient;
//
export default prisma;

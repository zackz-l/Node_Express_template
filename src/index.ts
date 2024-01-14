import 'source-map-support/register';
import 'reflect-metadata';
import 'module-alias/register';
import { startServer } from './application/server';
import _prisma from './infrastructure/database/database'; // importing the prisma instance we created.

startServer();

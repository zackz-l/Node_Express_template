# Wakuwaku Backend

## Local Development

Required Node version: 16.0. Configure this using Node Version Manager.

For Windows system, using git.bash instead of default terminal.

WSL(Windows Sub-system of Linux) is recomended for Windows user.

Install docker on https://docs.docker.com/get-docker/

Install pgadmin on https://www.pgadmin.org/download/

1. Clone this Repository to your local machine

2. Rename `.env-example` to `.env`

```shell
    cp .env-example .env1
```

3. Install dependencies:

```shell
    npm i
```

4. Initiate postgresql service:

```shell
    docker compose up
```

5. Initiate prisma(database ORM framework):

```shell
    npx prisma generate
```

6. Run database migration:

```shell
    npx prisma migrate dev
```

7. Start the service with auto-reloading when file changes:

```shell
    npm run start
```

### Add new column to a data model

1. Add it in schema.prisma file

2. Local setup:

```shell
    npx prisma generate
    npx prisma migrate dev
```

3. Production CI/CD will run:

```shell
    npm run start:deploy (which will run npx prisma deploy)
```

### Databse

Database local user interface:

- Dbeaver - an application 
- npx prisma studio - run in terminal

### Installing

Postman API
Dbeaver

Following extensions in Visual Studio Code editor:

- Prettier - Code formatter
- JavaScript and TypeScript Nightly
- TypeScript Debugger
- Prisma

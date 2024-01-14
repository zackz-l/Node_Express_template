/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         username:
 *           type: string
 *           description: The username of the user
 *       example:
 *         id: 5e41e80b-3d92-49db-ba71-175a8dc7eee3
 *         email: timcook@apple.com
 *         username: timcook
 */

/**
 * @swagger
 * tags:
 *   name: User
 *   description: The users managing API
 * /users/username/{username}:
 *   get:
 *     summary: Get the user by the username
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: The user.
 *         content:
 *           application/json:
 *             schema: 
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Some server error
 */
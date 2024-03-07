/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user account with the provided information.
 *     parameters:
 *       - name: body
 *         in: body
 *         description: User information for signup.
 *         required: true
 *         schema:
 *           $ref: '#/definitions/UserSignup'
 *     responses:
 *       200:
 *         description: User created successfully.
 *         schema:
 *           $ref: '#/definitions/UserToken'
 *       411:
 *         description: Incorrect inputs.
 *         schema:
 *           $ref: '#/definitions/Error'
 */

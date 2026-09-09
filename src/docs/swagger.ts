const errorSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: {
      type: 'object',
      properties: {
        code: { type: 'string', example: 'RESOURCE_NOT_FOUND' },
        message: { type: 'string', example: 'Resource not found' },
        details: { type: 'object' },
      },
    },
  },
};

const paginationMeta = {
  type: 'object',
  properties: {
    page: { type: 'integer', example: 1 },
    limit: { type: 'integer', example: 20 },
    total: { type: 'integer', example: 100 },
    totalPages: { type: 'integer', example: 5 },
  },
};

const productSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    code: { type: 'string', example: 'PROFESSIONAL' },
    name: { type: 'string' },
    domain: { type: 'string', nullable: true },
    status: { type: 'string' },
  },
};

const articleSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    productId: { type: 'string', format: 'uuid' },
    authorId: { type: 'string', format: 'uuid', nullable: true },
    title: { type: 'string' },
    slug: { type: 'string' },
    excerpt: { type: 'string', nullable: true },
    content: { type: 'string', nullable: true },
    coverImage: { type: 'string', nullable: true },
    status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] },
    publishedAt: { type: 'string', format: 'date-time', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    product: productSchema,
  },
};

const listResponse = (itemSchema: object) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    data: { type: 'array', items: itemSchema },
    message: { type: 'string' },
    meta: paginationMeta,
  },
});

const security = [{ bearerAuth: [] }];

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Sigma Talenta API',
    version: '1.0.0',
    description:
      'Modular monolith backend for the Sigma Talenta multi-product CMS. Public endpoints read published/active content scoped by the `X-Product` header. Admin endpoints require a JWT (Authorization: Bearer <token>).',
  },
  servers: [{ url: '/api' }],
  tags: [
    { name: 'Auth' },
    { name: 'Articles' },
    { name: 'Landing Pages' },
    { name: 'FAQs' },
    { name: 'Services' },
    { name: 'Industries' },
    { name: 'Media' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: errorSchema,
      Product: productSchema,
      Article: articleSchema,
    },
  },
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        token: { type: 'string' },
                        user: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            email: { type: 'string' },
                            role: { type: 'string' },
                            productId: { type: 'string', nullable: true },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/me': {
      get: { tags: ['Auth'], summary: 'Current user', security, responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } } },
    },
    '/auth/logout': {
      post: { tags: ['Auth'], summary: 'Logout (client discards token)', security, responses: { 200: { description: 'OK' } } },
    },
    '/admin/articles': {
      get: {
        tags: ['Articles'], summary: 'List articles (scoped by product)', security,
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'productId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'SUPER_ADMIN only' },
        ],
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: listResponse(articleSchema) } } } },
      },
      post: {
        tags: ['Articles'], summary: 'Create article', security,
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['title', 'slug'], properties: { title: { type: 'string' }, slug: { type: 'string' }, excerpt: { type: 'string', nullable: true }, content: { type: 'string', nullable: true }, coverImage: { type: 'string', nullable: true }, status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] }, productId: { type: 'string', format: 'uuid', description: 'SUPER_ADMIN only' } } } } } },
        responses: { 201: { description: 'Created' }, 409: { description: 'Duplicate slug within product' } },
      },
    },
    '/admin/articles/{id}': {
      get: { tags: ['Articles'], summary: 'Get article', security, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { 200: { description: 'OK' }, 403: { description: 'Forbidden (product isolation)' }, 404: { description: 'Not found' } } },
      put: { tags: ['Articles'], summary: 'Update article', security, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { 200: { description: 'OK' }, 403: { description: 'Forbidden' }, 409: { description: 'Duplicate slug' } } },
      delete: { tags: ['Articles'], summary: 'Delete article', security, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { 200: { description: 'OK' }, 403: { description: 'Forbidden' } } },
    },
    '/public/articles': {
      get: {
        tags: ['Articles'], summary: 'List published articles',
        parameters: [
          { name: 'X-Product', in: 'header', required: true, schema: { type: 'string', example: 'PROFESSIONAL' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: listResponse(articleSchema) } } } },
      },
    },
    '/public/articles/{slug}': {
      get: { tags: ['Articles'], summary: 'Get published article by slug', parameters: [{ name: 'X-Product', in: 'header', required: true, schema: { type: 'string' } }, { name: 'slug', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } } },
    },
    '/admin/pages': {
      get: { tags: ['Landing Pages'], summary: 'List landing pages', security, responses: { 200: { description: 'OK' } } },
      post: { tags: ['Landing Pages'], summary: 'Create landing page', security, responses: { 201: { description: 'Created' } } },
    },
    '/public/pages/{slug}': {
      get: { tags: ['Landing Pages'], summary: 'Get published landing page', parameters: [{ name: 'X-Product', in: 'header', required: true, schema: { type: 'string' } }, { name: 'slug', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
    },
    '/admin/faqs': {
      get: { tags: ['FAQs'], summary: 'List FAQs', security, responses: { 200: { description: 'OK' } } },
      post: { tags: ['FAQs'], summary: 'Create FAQ', security, responses: { 201: { description: 'Created' } } },
    },
    '/public/faqs': {
      get: { tags: ['FAQs'], summary: 'List active FAQs', parameters: [{ name: 'X-Product', in: 'header', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
    },
    '/admin/services': {
      get: { tags: ['Services'], summary: 'List services', security, responses: { 200: { description: 'OK' } } },
      post: { tags: ['Services'], summary: 'Create service', security, responses: { 201: { description: 'Created' } } },
    },
    '/public/services': {
      get: { tags: ['Services'], summary: 'List active services', parameters: [{ name: 'X-Product', in: 'header', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
    },
    '/public/services/{slug}': {
      get: { tags: ['Services'], summary: 'Get active service', parameters: [{ name: 'X-Product', in: 'header', required: true, schema: { type: 'string' } }, { name: 'slug', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
    },
    '/admin/industries': {
      get: { tags: ['Industries'], summary: 'List industries', security, responses: { 200: { description: 'OK' } } },
      post: { tags: ['Industries'], summary: 'Create industry', security, responses: { 201: { description: 'Created' } } },
    },
    '/public/industries': {
      get: { tags: ['Industries'], summary: 'List active industries', parameters: [{ name: 'X-Product', in: 'header', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
    },
    '/public/industries/{slug}': {
      get: { tags: ['Industries'], summary: 'Get active industry', parameters: [{ name: 'X-Product', in: 'header', required: true, schema: { type: 'string' } }, { name: 'slug', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
    },
    '/admin/media': {
      get: { tags: ['Media'], summary: 'List media', security, responses: { 200: { description: 'OK' } } },
      post: { tags: ['Media'], summary: 'Upload media (multipart form: file, optional productId)', security, responses: { 201: { description: 'Created' } } },
    },
    '/admin/media/{id}': {
      get: { tags: ['Media'], summary: 'Get media', security, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { 200: { description: 'OK' } } },
      delete: { tags: ['Media'], summary: 'Delete media', security, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { 200: { description: 'OK' } } },
    },
  },
};

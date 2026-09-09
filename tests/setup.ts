// Must run before the app (and its Sequelize instance) is imported, so the
// database name is resolved correctly.
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DB_NAME = process.env.DB_NAME_TEST || 'sigma_talenta_test';

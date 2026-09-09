'use strict';

const bcrypt = require('bcryptjs');

// Development-only credentials. Never use these in production.
const DEV_PASSWORD = 'Password123!';
const passwordHash = bcrypt.hashSync(DEV_PASSWORD, 10);

const USERS = [
  { name: 'Super Admin', email: 'super@sigma-talenta.com', role: 'SUPER_ADMIN', productCode: null },
  { name: 'Admin Main', email: 'admin-main@sigma-talenta.com', role: 'PRODUCT_ADMIN', productCode: 'MAIN' },
  { name: 'Admin Professional', email: 'admin-professional@sigma-talenta.com', role: 'PRODUCT_ADMIN', productCode: 'PROFESSIONAL' },
  { name: 'Admin Manpower', email: 'admin-manpower@sigma-talenta.com', role: 'PRODUCT_ADMIN', productCode: 'MANPOWER' },
  { name: 'Admin Hospitality', email: 'admin-hospitality@sigma-talenta.com', role: 'PRODUCT_ADMIN', productCode: 'HOSPITALITY' },
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const products = await queryInterface.sequelize.query('SELECT id, code FROM products', {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    });
    const idByCode = Object.fromEntries(products.map((p) => [p.code, p.id]));

    await queryInterface.bulkInsert(
      'users',
      USERS.map((u, i) => ({
        id: `20000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`,
        product_id: u.productCode ? idByCode[u.productCode] : null,
        name: u.name,
        email: u.email,
        password_hash: passwordHash,
        role: u.role,
        status: 'ACTIVE',
        created_at: now,
        updated_at: now,
      })),
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  },
};

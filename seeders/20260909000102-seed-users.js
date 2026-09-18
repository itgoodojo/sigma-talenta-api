'use strict';

const bcrypt = require('bcryptjs');

// Dev fallback only. In production ADMIN_PASSWORD must be set — see the guard in `up`.
const DEV_PASSWORD = 'Password123!';

const USERS = [
  { name: 'Super Admin', email: 'super@sigma-talenta.com', role: 'SUPER_ADMIN', productCode: null },
  { name: 'Admin Main', email: 'admin-main@sigma-talenta.com', role: 'PRODUCT_ADMIN', productCode: 'MAIN' },
  { name: 'Admin Professional', email: 'admin-professional@sigma-talenta.com', role: 'PRODUCT_ADMIN', productCode: 'PROFESSIONAL' },
  { name: 'Admin Manpower', email: 'admin-manpower@sigma-talenta.com', role: 'PRODUCT_ADMIN', productCode: 'MANPOWER' },
  { name: 'Admin Hospitality', email: 'admin-hospitality@sigma-talenta.com', role: 'PRODUCT_ADMIN', productCode: 'HOSPITALITY' },
];

const SEEDED_EMAILS = USERS.map((u) => u.email);

module.exports = {
  async up(queryInterface, Sequelize) {
    const isProduction = process.env.NODE_ENV === 'production';
    const password = process.env.ADMIN_PASSWORD || (isProduction ? '' : DEV_PASSWORD);

    if (!password) {
      throw new Error('ADMIN_PASSWORD must be set when seeding in production');
    }
    if (isProduction && password === DEV_PASSWORD) {
      throw new Error('ADMIN_PASSWORD must not be the development default');
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const now = new Date();

    const products = await queryInterface.sequelize.query('SELECT id, code FROM products', {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    });
    const idByCode = Object.fromEntries(products.map((p) => [p.code, p.id]));

    // The super-admin address is overridable so production doesn't inherit the sample domain.
    const superEmail = process.env.ADMIN_EMAIL || USERS[0].email;

    const rows = USERS.map((u, i) => ({
      id: `20000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`,
      product_id: u.productCode ? idByCode[u.productCode] : null,
      name: u.name,
      email: u.role === 'SUPER_ADMIN' ? superEmail : u.email,
      password_hash: passwordHash,
      role: u.role,
      status: 'ACTIVE',
      created_at: now,
      updated_at: now,
    }));

    // ignoreDuplicates keeps re-runs safe: existing admins are left untouched,
    // so a rotated password is never reset back to the seed value.
    await queryInterface.bulkInsert('users', rows, { ignoreDuplicates: true });
  },

  async down(queryInterface, Sequelize) {
    // Only remove the seeded accounts — never every row in the table.
    const superEmail = process.env.ADMIN_EMAIL || USERS[0].email;
    const emails = [...new Set([...SEEDED_EMAILS, superEmail])];
    await queryInterface.bulkDelete('users', { email: { [Sequelize.Op.in]: emails } }, {});
  },
};

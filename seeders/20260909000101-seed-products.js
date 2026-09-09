'use strict';

const PRODUCTS = [
  { code: 'MAIN', name: 'Sigma Talenta', domain: 'sigma-talenta.com', description: 'Main corporate website' },
  { code: 'PROFESSIONAL', name: 'Sigma Talenta Professional', domain: 'professional.sigma-talenta.com', description: 'Professional services' },
  { code: 'MANPOWER', name: 'Sigma Talenta Manpower', domain: 'manpower.sigma-talenta.com', description: 'Manpower services' },
  { code: 'HOSPITALITY', name: 'Sigma Talenta Hospitality', domain: 'hospitality.sigma-talenta.com', description: 'Hospitality services' },
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert(
      'products',
      PRODUCTS.map((p, i) => ({
        id: `10000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`,
        ...p,
        status: 'ACTIVE',
        created_at: now,
        updated_at: now,
      })),
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('products', null, {});
  },
};

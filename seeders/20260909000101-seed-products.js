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
      // Safe to re-run: existing products keep whatever the CMS has since edited.
      { ignoreDuplicates: true },
    );
  },

  async down(queryInterface, Sequelize) {
    // Only the seeded product codes — leave anything added later alone.
    await queryInterface.bulkDelete(
      'products',
      { code: { [Sequelize.Op.in]: PRODUCTS.map((p) => p.code) } },
      {},
    );
  },
};

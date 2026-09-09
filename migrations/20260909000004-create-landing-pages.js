'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('landing_pages', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      product_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'products', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      title: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false },
      content: { type: Sequelize.JSONB, allowNull: true },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'DRAFT' },
      seo_title: { type: Sequelize.STRING, allowNull: true },
      seo_description: { type: Sequelize.TEXT, allowNull: true },
      canonical_url: { type: Sequelize.STRING, allowNull: true },
      og_title: { type: Sequelize.STRING, allowNull: true },
      og_description: { type: Sequelize.TEXT, allowNull: true },
      og_image: { type: Sequelize.STRING, allowNull: true },
      robots_index: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      published_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('landing_pages', ['product_id', 'slug'], { unique: true, name: 'landing_pages_product_slug_unique' });
    await queryInterface.addIndex('landing_pages', ['status'], { name: 'landing_pages_status_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('landing_pages');
  },
};

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('audit_logs', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      user_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      product_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'products', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      action: { type: Sequelize.STRING, allowNull: false },
      entity: { type: Sequelize.STRING, allowNull: false },
      entity_id: { type: Sequelize.UUID, allowNull: true },
      metadata: { type: Sequelize.JSONB, allowNull: true },
      ip_address: { type: Sequelize.STRING, allowNull: true },
      user_agent: { type: Sequelize.STRING, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('audit_logs', ['user_id'], { name: 'audit_logs_user_id_idx' });
    await queryInterface.addIndex('audit_logs', ['product_id'], { name: 'audit_logs_product_id_idx' });
    await queryInterface.addIndex('audit_logs', ['entity', 'entity_id'], { name: 'audit_logs_entity_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('audit_logs');
  },
};

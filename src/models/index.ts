import Product from './Product';
import User from './User';

Product.hasMany(User, { foreignKey: 'productId', as: 'users' });
User.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

export { sequelize } from '../config/database';
export { Product, User };
export type { UserRole } from './User';

import Product from './Product';
import User from './User';
import Article from './Article';
import LandingPage from './LandingPage';
import Faq from './Faq';
import Service from './Service';
import Industry from './Industry';
import Media from './Media';
import AuditLog from './AuditLog';

Product.hasMany(User, { foreignKey: 'productId', as: 'users' });
User.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(Article, { foreignKey: 'productId', as: 'articles' });
Article.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
User.hasMany(Article, { foreignKey: 'authorId', as: 'articles' });
Article.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

Product.hasMany(LandingPage, { foreignKey: 'productId', as: 'landingPages' });
LandingPage.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(Faq, { foreignKey: 'productId', as: 'faqs' });
Faq.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(Service, { foreignKey: 'productId', as: 'services' });
Service.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(Industry, { foreignKey: 'productId', as: 'industries' });
Industry.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(Media, { foreignKey: 'productId', as: 'media' });
Media.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
User.hasMany(Media, { foreignKey: 'uploaderId', as: 'media' });
Media.belongsTo(User, { foreignKey: 'uploaderId', as: 'uploader' });

export { sequelize } from '../config/database';
export { Product, User, Article, LandingPage, Faq, Service, Industry, Media, AuditLog };
export type { UserRole } from './User';
export type { ArticleStatus } from './Article';
export type { LandingPageStatus } from './LandingPage';

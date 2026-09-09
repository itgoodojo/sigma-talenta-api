import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

export type LandingPageStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

class LandingPage extends Model<InferAttributes<LandingPage>, InferCreationAttributes<LandingPage>> {
  declare id: CreationOptional<string>;
  declare productId: string;
  declare title: string;
  declare slug: string;
  declare content: object | null;
  declare status: CreationOptional<string>;
  declare seoTitle: string | null;
  declare seoDescription: string | null;
  declare canonicalUrl: string | null;
  declare ogTitle: string | null;
  declare ogDescription: string | null;
  declare ogImage: string | null;
  declare robotsIndex: CreationOptional<boolean>;
  declare publishedAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

LandingPage.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    productId: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.JSONB, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'DRAFT' },
    seoTitle: { type: DataTypes.STRING, allowNull: true },
    seoDescription: { type: DataTypes.TEXT, allowNull: true },
    canonicalUrl: { type: DataTypes.STRING, allowNull: true },
    ogTitle: { type: DataTypes.STRING, allowNull: true },
    ogDescription: { type: DataTypes.TEXT, allowNull: true },
    ogImage: { type: DataTypes.STRING, allowNull: true },
    robotsIndex: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    publishedAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, modelName: 'LandingPage', tableName: 'landing_pages', underscored: true },
);

export default LandingPage;

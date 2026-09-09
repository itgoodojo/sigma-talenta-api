import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

class AuditLog extends Model<InferAttributes<AuditLog>, InferCreationAttributes<AuditLog>> {
  declare id: CreationOptional<string>;
  declare userId: string | null;
  declare productId: string | null;
  declare action: string;
  declare entity: string;
  declare entityId: string | null;
  declare metadata: object | null;
  declare ipAddress: string | null;
  declare userAgent: string | null;
  declare createdAt: CreationOptional<Date>;
}

AuditLog.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    userId: { type: DataTypes.UUID, allowNull: true },
    productId: { type: DataTypes.UUID, allowNull: true },
    action: { type: DataTypes.STRING, allowNull: false },
    entity: { type: DataTypes.STRING, allowNull: false },
    entityId: { type: DataTypes.UUID, allowNull: true },
    metadata: { type: DataTypes.JSONB, allowNull: true },
    ipAddress: { type: DataTypes.STRING, allowNull: true },
    userAgent: { type: DataTypes.STRING, allowNull: true },
    createdAt: { type: DataTypes.DATE, allowNull: false },
  },
  {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'audit_logs',
    underscored: true,
    updatedAt: false,
  },
);

export default AuditLog;

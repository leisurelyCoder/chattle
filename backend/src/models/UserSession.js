import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import User from './User.js';

const UserSession = sequelize.define('UserSession', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    defaultValue: () => uuidv4()
  },
  userId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  socketId: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    field: 'socket_id'
  },
  isActive: {
    type: DataTypes.TINYINT(1),
    defaultValue: 1,
    field: 'is_active'
  }
}, {
  tableName: 'user_sessions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['user_id'],
      name: 'idx_sessions_user'
    },
    {
      unique: true,
      fields: ['socket_id'],
      name: 'idx_sessions_socket'
    }
  ]
});

// Associations will be defined in models/index.js to avoid circular dependencies

export default UserSession;


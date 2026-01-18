import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    defaultValue: () => uuidv4()
  },
  participant1Id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'participant1_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  participant2Id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'participant2_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  lastMessageId: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    field: 'last_message_id',
    references: {
      model: 'messages',
      key: 'id'
    }
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_message_at'
  }
}, {
  tableName: 'conversations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['participant1_id', 'participant2_id'],
      name: 'unique_participants'
    },
    {
      fields: ['participant1_id', 'participant2_id'],
      name: 'idx_conversations_participants'
    },
    {
      fields: ['last_message_at'],
      name: 'idx_conversations_last_message'
    }
  ]
});

// Associations will be defined in models/index.js to avoid circular dependencies

export default Conversation;


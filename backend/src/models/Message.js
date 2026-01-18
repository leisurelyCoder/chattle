import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    defaultValue: () => uuidv4()
  },
  conversationId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'conversation_id',
    references: {
      model: 'conversations',
      key: 'id'
    }
  },
  senderId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'sender_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  receiverId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'receiver_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 5000]
    }
  },
  deliveryStatus: {
    type: DataTypes.ENUM('sent', 'delivered', 'read'),
    defaultValue: 'sent',
    field: 'delivery_status'
  }
}, {
  tableName: 'messages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['conversation_id', 'created_at'],
      name: 'idx_messages_conversation'
    },
    {
      fields: ['sender_id'],
      name: 'idx_messages_sender'
    },
    {
      fields: ['receiver_id'],
      name: 'idx_messages_receiver'
    },
    {
      fields: ['receiver_id', 'delivery_status'],
      name: 'idx_messages_status'
    }
  ]
});

// Associations will be defined in models/index.js to avoid circular dependencies

export default Message;


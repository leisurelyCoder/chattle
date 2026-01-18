import sequelize from './database.js';
import { testConnection } from './database.js';
import { User, Conversation, Message, UserSession } from '../models/index.js';

const migrate = async () => {
    try {
        const connected = await testConnection();
        if (!connected) {
            process.exit(1);
        }

        console.log('🔄 Starting database migration...');

        // Sync all models (creates tables if they don't exist)
        await sequelize.sync({ alter: false, force: false });

        console.log('✅ Database migration completed successfully.');
        console.log('📊 Tables created/verified: users, conversations, messages, user_sessions');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrate();


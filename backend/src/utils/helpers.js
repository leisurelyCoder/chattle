export const sanitizeMessage = (content) => {
    if (typeof content !== 'string') {
        return '';
    }

    return content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
};

export const formatUserResponse = (user) => {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isOnline: user.isOnline === 1,
        lastSeen: user.lastSeen
    };
};

export const formatMessageResponse = (message) => {
    if (!message) {
        return null;
    }
    
    // Handle Sequelize model - it uses camelCase by default, but we need to get the dataValues
    const data = message.dataValues || message;
    
    const createdAt = data.createdAt || data.created_at;
    const formattedDate = createdAt ? 
        (createdAt instanceof Date ? createdAt.toISOString() : createdAt) : 
        new Date().toISOString();
    
    return {
        id: data.id,
        conversationId: data.conversationId || data.conversation_id,
        senderId: data.senderId || data.sender_id,
        receiverId: data.receiverId || data.receiver_id,
        content: data.content || '',
        deliveryStatus: data.deliveryStatus || data.delivery_status || 'sent',
        createdAt: formattedDate
    };
};

export const formatConversationResponse = (conversation, currentUserId) => {
    const participant = conversation.participant1Id === currentUserId
        ? conversation.participant2
        : conversation.participant1;

    return {
        id: conversation.id,
        participant: formatUserResponse(participant),
        lastMessage: conversation.lastMessage ? formatMessageResponse(conversation.lastMessage) : null,
        lastMessageAt: conversation.lastMessageAt,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
    };
};


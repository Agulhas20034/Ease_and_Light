const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ease_and_light');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const chatMessageSchema = new mongoose.Schema({
  groupId: { type: String, required: true }, 
  senderId: { type: Number, required: true }, 
  senderName: { type: String, default: 'Guest' },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  id_utilizador: { type: Number, required: true, unique: true },
  nome: String,
  email: String,
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
const User = mongoose.model('User', userSchema);

class MongoService {
  async saveChatMessage(data) {
    const message = new ChatMessage(data);
    return await message.save();
  }

  async getChatMessages(groupId, limit = 50) {
    const messages = await ChatMessage.find({ groupId }).sort({ timestamp: 1 }).limit(limit);
    
    const populatedMessages = await Promise.all(
      messages.map(async (msg) => {
        const user = await User.findOne({ id_utilizador: msg.senderId });
        return {
          ...msg.toObject(),
          senderName: msg.senderName || user?.nome || 'Guest',
          senderId: user ? { id_utilizador: user.id_utilizador, nome: user.nome } : msg.senderId
        };
      })
    );
    
    return populatedMessages;
  }

  async createOrUpdateUser(userData) {
    return await User.findOneAndUpdate({ id_utilizador: userData.id_utilizador }, userData, { upsert: true, new: true });
  }

  async getUserById(id) {
    return await User.findOne({ id_utilizador: id });
  }
}

module.exports = new MongoService();
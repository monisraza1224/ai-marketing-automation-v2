const { Sequelize } = require('sequelize');
const Logger = require('../server/utils/logger');
const path = require('path');

class Database {
  constructor() {
    this.sequelize = null;
  }

  async connect() {
    try {
      // Use SQLite database file (creates automatically)
      const dbPath = path.join(__dirname, '..', 'database.sqlite');
      
      this.sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: dbPath,
        logging: (msg) => Logger.debug(msg), // Optional: log SQL queries
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      });

      // Test connection
      await this.sequelize.authenticate();
      Logger.info('✅ SQLite database connected successfully');

      // Sync models (create tables)
      await this.syncModels();
      
      return this.sequelize;
    } catch (error) {
      Logger.error('❌ Database connection failed:', error);
      // Don't crash - continue without database for now
      Logger.info('⚠️  Continuing without database connection');
      return null;
    }
  }

  async syncModels() {
    try {
      // Import models
      const Contact = require('../server/models/Contact');
      const Campaign = require('../server/models/Campaign');
      const Content = require('../server/models/Content');
      
      // Sync all models
      await this.sequelize.sync({ force: false }); // force: true would drop tables
      Logger.info('✅ Database models synchronized');
    } catch (error) {
      Logger.error('❌ Model synchronization failed:', error);
    }
  }

  async disconnect() {
    if (this.sequelize) {
      await this.sequelize.close();
      Logger.info('Database disconnected');
    }
  }
}

module.exports = new Database();

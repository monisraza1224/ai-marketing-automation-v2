const { DataTypes } = require('sequelize');
const Database = require('../../config/database');

const Content = Database.sequelize ? Database.sequelize.define('Content', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  contentId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  funnelStage: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  variations: {
    type: DataTypes.TEXT,
    get() {
      const rawValue = this.getDataValue('variations');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('variations', JSON.stringify(value || []));
    }
  },
  aiPrompt: DataTypes.TEXT,
  aiModel: DataTypes.STRING,
  tokensUsed: DataTypes.INTEGER,
  generationTime: DataTypes.INTEGER,
  clientData: {
    type: DataTypes.TEXT,
    get() {
      const rawValue = this.getDataValue('clientData');
      return rawValue ? JSON.parse(rawValue) : {};
    },
    set(value) {
      this.setDataValue('clientData', JSON.stringify(value || {}));
    }
  },
  strategyAnalysis: {
    type: DataTypes.TEXT,
    get() {
      const rawValue = this.getDataValue('strategyAnalysis');
      return rawValue ? JSON.parse(rawValue) : {};
    },
    set(value) {
      this.setDataValue('strategyAnalysis', JSON.stringify(value || {}));
    }
  },
  performance: {
    type: DataTypes.TEXT,
    get() {
      const rawValue = this.getDataValue('performance');
      return rawValue ? JSON.parse(rawValue) : {};
    },
    set(value) {
      this.setDataValue('performance', JSON.stringify(value || {}));
    }
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'draft'
  },
  campaignId: DataTypes.STRING,
  publishedAt: DataTypes.DATE
}, {
  tableName: 'content',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
}) : null;

module.exports = Content;

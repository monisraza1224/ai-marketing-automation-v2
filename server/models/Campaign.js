const { DataTypes } = require('sequelize');
const Database = require('../../config/database');

const Campaign = Database.sequelize ? Database.sequelize.define('Campaign', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  campaignId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  platform: {
    type: DataTypes.STRING,
    defaultValue: 'facebook'
  },
  platformCampaignId: DataTypes.STRING,
  objective: {
    type: DataTypes.STRING,
    allowNull: false
  },
  funnelStage: {
    type: DataTypes.STRING,
    allowNull: false
  },
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
  contentTemplates: {
    type: DataTypes.TEXT,
    get() {
      const rawValue = this.getDataValue('contentTemplates');
      return rawValue ? JSON.parse(rawValue) : {};
    },
    set(value) {
      this.setDataValue('contentTemplates', JSON.stringify(value || {}));
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
  startedAt: DataTypes.DATE,
  completedAt: DataTypes.DATE
}, {
  tableName: 'campaigns',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
}) : null;

module.exports = Campaign;

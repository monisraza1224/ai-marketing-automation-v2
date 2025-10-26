const { DataTypes } = require('sequelize');
const Database = require('../../config/database');
const Helpers = require('../utils/helpers');

const Contact = Database.sequelize ? Database.sequelize.define('Contact', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ghlContactId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  locationId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: DataTypes.STRING,
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  leadScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'New Contact'
  },
  emailOpens: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  linkClicks: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastEngagement: DataTypes.DATE,
  businessName: DataTypes.STRING,
  industry: DataTypes.STRING,
  painPoints: {
    type: DataTypes.TEXT,
    get() {
      const rawValue = this.getDataValue('painPoints');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('painPoints', JSON.stringify(value || []));
    }
  },
  goals: {
    type: DataTypes.TEXT,
    get() {
      const rawValue = this.getDataValue('goals');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('goals', JSON.stringify(value || []));
    }
  },
  clientStory: DataTypes.TEXT,
  campaigns: {
    type: DataTypes.TEXT,
    get() {
      const rawValue = this.getDataValue('campaigns');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('campaigns', JSON.stringify(value || []));
    }
  }
}, {
  tableName: 'contacts',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
}) : null;

module.exports = Contact;

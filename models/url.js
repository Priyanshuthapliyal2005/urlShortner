import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema({
  shortcode: {
    type: String,
    required: true,
    unique: true
  },
  originalUrl: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  clicks: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    ip: String,
    userAgent: String,
    referrer: String
  }],
  isExpired: {
    type: Boolean,
    default: false
  }
});

urlSchema.methods.addClick = function(clientInfo) {
  this.clicks.push({
    ip: clientInfo.ip,
    userAgent: clientInfo.userAgent,
    referrer: clientInfo.referrer
  });
  return this.save();
};

urlSchema.methods.checkExpiry = function() {
  const now = new Date();
  if (now > this.expiresAt && !this.isExpired) {
    this.isExpired = true;
    return this.save();
  }
  return this;
};

const Url = mongoose.model('Url', urlSchema);

export default Url;
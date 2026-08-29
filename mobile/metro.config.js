const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('webp', 'png', 'jpg', 'jpeg', 'svg');

module.exports = config;

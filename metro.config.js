const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add .bin to asset extensions so the model weights can be bundled
config.resolver.assetExts.push('bin');

module.exports = config;

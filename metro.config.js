const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

<<<<<<< HEAD
module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
=======
module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
});
>>>>>>> f6309e9

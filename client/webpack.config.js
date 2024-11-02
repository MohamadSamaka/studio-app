const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Add fallbacks for Node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer/'),
    vm: require.resolve('vm-browserify'),  // Add vm fallback
  };

  // Provide global variables for `process` and `Buffer`
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    })
  );

  // Define environment variables
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.EXPO_PUBLIC_API_URL': JSON.stringify(process.env.EXPO_PUBLIC_API_URL),
      'process.env.EXPO_PUBLIC_WEBSOCKET_URL': JSON.stringify(process.env.EXPO_PUBLIC_WEBSOCKET_URL),
    })
  );

  // Handle font files for vector icons
  config.module.rules.push({
    test: /\.(ttf|otf|eot|svg|woff(2)?)$/,
    type: 'asset/resource',
    generator: {
      filename: 'fonts/[name][hash][ext][query]'
    }
  });

  return config;
};

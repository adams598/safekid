module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@theme': './src/theme',
            '@types': './src/types',
            '@store': './src/store',
            '@services': './src/services',
            '@components': './src/components',
            '@screens': './src/screens',
            '@navigation': './src/navigation',
            '@assets': './assets',
          },
        },
      ],
    ],
  };
};

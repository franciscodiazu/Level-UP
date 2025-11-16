// karma.conf.js (ACTUALIZADO)

module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    
    files: [
      'src/**/*.test.js',
      'src/**/*.test.jsx'
    ],
    
    preprocessors: {
      'src/**/*.test.js': ['webpack'],
      'src/**/*.test.jsx': ['webpack']
    },
    
    // Configuración de Webpack actualizada
    webpack: {
      mode: 'development',
      module: {
        rules: [
          // Regla para JavaScript (JSX)
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env', '@babel/preset-react']
              }
            }
          },
          // ¡NUEVA REGLA! Para archivos CSS
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
          }
        ]
      },
      resolve: {
        extensions: ['.js', '.jsx']
      }
    },
    
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    singleRun: true,
    concurrency: Infinity,
    
    // Asegúrate de que los navegadores estén bien
    browsers: ['Chrome']
  });
};
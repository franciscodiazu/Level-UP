const webpackConfig = require('./webpack.config');

module.exports = function(config){
    config.set({
        frameworks:['jasmine'],
        file:[
            'src/**/*.test.js',
            'src/**/*.test.jsx',
            'src/**/*.test.ts',
            'src/**/*.test.tsx'
        ],
        preprocessors:{
            'src/**/*.test.js': ['webpack'],
            'src/**/*.test.jsx': ['webpack'],
            'src/**/*.test.ts': ['webpack'],
            'src/**/*.test.tsx': ['webpack']
            },
        webpack:{
            ...webpackConfig,
            mode:'development',
            resolve: {
                ...webpackConfig.resolve
                
            }
        }
    });
};
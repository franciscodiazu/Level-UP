module.exports = function(config) {
    config.set({
        // Framework base
        frameworks: ['jasmine'],
        
        // Archivos a incluir
        files: [
            'src/test/unit/**/*.test.js'
        ],
        
        exclude: [
            'src/**/*.test.jsx',
            'src/**/*.test.ts',
            'src/**/*.test.tsx',
            'src/App.test.js',
            'src/components/**/*.test.js'
        ],

        // --- ESTO ES LO NUEVO PARA VER LOS LOGS ---
        client: {
            clearContext: false, // Mantiene visible la ventana del navegador
            captureConsole: true // Obliga a capturar los console.log del navegador
        },

        browserConsoleLogOptions: {
            level: 'log',        // Nivel de log a mostrar (log, error, warn, debug)
            format: '%b %T: %m', // Formato: Navegador + Tiempo + Mensaje
            terminal: true       // ¡IMPORTANTE! Esto lo imprime en tu VS Code
        },
        // ------------------------------------------
        
        preprocessors: {
            'src/test/unit/**/*.test.js': ['webpack']
        },
        
        webpack: {
            mode: 'development',
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        exclude: /node_modules/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-env']
                            }
                        }
                    }
                ]
            },
            resolve: {
                extensions: ['.js']
            }
        },
        
        browsers: ['Chrome'],
        
        reporters: ['mocha', 'progress', 'kjhtml'],
        
        mochaReporter: {
            output: 'autowatch',
            showDiff: false,
            colors: {
                success: 'green',
                info: 'blue',
                warning: 'yellow',
                error: 'red'
            }
        },
        
        specReporter: {
            maxLogLines: 5,
            suppressErrorSummary: false,
            suppressFailed: false,
            suppressPassed: false,
            suppressSkipped: false,
            showSpecTiming: true,
            failFast: false
        },
        
        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher',
            'karma-webpack',
            'karma-mocha-reporter',
            'karma-spec-reporter',
            'karma-jasmine-html-reporter'
        ],
        
        autoWatch: true,
        singleRun: process.env.CI === 'true',
        logLevel: config.LOG_INFO,
        colors: true,
        browserNoActivityTimeout: 30000
    });
};
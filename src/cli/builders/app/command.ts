import {Compiler} from "webpack";

export const build = (compiler: Compiler) => {
    compiler.run((err, stats) => {
        if (err) {
            console.error('Webpack compilation error:', err);
            process.exit(1);
        }

        if (stats?.hasErrors()) {
            console.error(stats.toString({
                colors: true,
                errors: true
            }));

            process.exit(1);
        }

        console.log(stats?.toString({colors: true}));

        compiler.close((closeErr) => {
            if (closeErr) {
                console.error('Webpack close error:', closeErr);
                process.exit(1);
            }
        });
    });
};

export const watch = (compiler: Compiler) => {
    const watching = compiler.watch({
        aggregateTimeout: 300,
        ignored: /node_modules/
    }, (err, stats) => {
        if (err) {
            console.error('Webpack watch error:', err);
            process.exit(1);
        }

        if (stats?.hasErrors()) {
            console.error(stats.toString({
                colors: true,
                errors: true
            }));

            return;
        }

        console.log(stats?.toString({colors: true}));
    });

    process.on('SIGINT', () => {
        watching.close(() => {
            console.log('Webpack watch mode stopped');
            process.exit(0);
        });
    });
}
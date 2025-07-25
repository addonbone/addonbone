import {Compiler} from "@rspack/core";

export const build = (compiler: Compiler) => {
    compiler.run((err, stats) => {
        if (err) {
            console.error("Rspack compilation error:", err);
            process.exit(1);
        }

        if (stats?.hasErrors()) {
            console.error(
                stats.toString({
                    colors: true,
                    errors: true,
                })
            );

            process.exit(1);
        }

        console.log(stats?.toString({colors: true}));

        compiler.close(closeErr => {
            if (closeErr) {
                console.error("Rspack close error:", closeErr);
                process.exit(1);
            }
        });
    });
};

export const watch = (compiler: Compiler) => {
    const watching = compiler.watch(
        {
            aggregateTimeout: 300,
            ignored: /node_modules/,
        },
        (err, stats) => {
            if (err) {
                console.error("Rspack watch error:", err);
                process.exit(1);
            }

            if (stats?.hasErrors()) {
                console.error(
                    stats.toString({
                        colors: true,
                        errors: true,
                    })
                );

                return;
            }

            console.log(stats?.toString({colors: true}));
        }
    );

    process.on("SIGINT", () => {
        watching.close(() => {
            console.log("Rspack watch mode stopped");
            process.exit(0);
        });
    });
};

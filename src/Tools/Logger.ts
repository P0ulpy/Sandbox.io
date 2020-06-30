import env from "../Environment";

export enum LogLevel {
    LEVEL_NOTE,
    LEVEL_INFO,
    LEVEL_WARNING,
    LEVEL_ERROR
}

export default class Logger
{
    private readonly prefixes: string[] = [ "[+]", "[~]", "[!]", "[-]" ];
    private readonly colors: string[] = [ "\x1b[37m", "\x1b[34m", "\x1b[33m", "\x1b[31m" ];
    private readonly resetColor: string = "\x1b[0m";

    private log(level: LogLevel, ...args: any[]): void
    {
        if (level >= env.logLevel)
        {
            const color = this.colors[level];
            const prefix = this.prefixes[level];

            console.log(`${color}${prefix}${this.resetColor} %s`, ...args);
        }
    }

    public note(...args: any[]): void
    {
        this.log(LogLevel.LEVEL_NOTE, ...args);
    }

    public info(...args: any[]): void
    {
        this.log(LogLevel.LEVEL_INFO, ...args);
    }

    public warning(...args: any[]): void
    {
        this.log(LogLevel.LEVEL_WARNING, ...args);
    }

    public error(...args: any[]): void
    {
        this.log(LogLevel.LEVEL_ERROR, ...args);
    }
}
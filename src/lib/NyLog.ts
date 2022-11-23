const color = {
    Reset: "\x1B[0m",
    Bright: "\x1B[1m",
    Dim: "\x1B[2m",
    Underscore: "\x1B[4m",
    Blink: "\x1B[5m",
    Reverse: "\x1B[7m",
    Hidden: "\x1B[8m",
    
    FgBlack: "\x1B[30m",
    FgRed: "\x1B[31m",
    FgGreen: "\x1B[32m",
    FgYellow: "\x1B[33m",
    FgBlue: "\x1B[34m",
    FgMagenta: "\x1B[35m",
    FgCyan: "\x1B[36m",
    FgWhite: "\x1B[37m",
    
    BgBlack: "\x1B[40m",
    BgRed: "\x1B[41m",
    BgGreen: "\x1B[42m",
    BgYellow: "\x1B[43m",
    BgBlue: "\x1B[44m",
    BgMagenta: "\x1B[45m",
    BgCyan: "\x1B[46m",
    BgWhite: "\x1B[47m"
};
/**
 * 
 * @param { number } type 0: Log / 1: Success / 2: Error
 * @param { string } text message
 * @param { object? } add add other message
 */
function CallLog(type: number, text: string, add?: object) {
    const message = [];
    switch (type) {
        case 0:
            message.push(`${color.FgWhite}📝 Log`);
            break;
        case 1:
            message.push(`${color.FgGreen}✅ Success`);
            break;
        case 2:
            message.push(`${color.FgRed}❌ Error`)
            break;
    }
    const date = new Date();
    const time = `${date.toLocaleDateString()} ${date.toLocaleTimeString()} (${Date.now()})`;
    const data = Object.entries(Object.assign({
        type: type,
        message: text,
        time: time
    }, add));
    data.forEach(([key, value], idx) => {
        const valueArr = value.toString().split("\n");
        valueArr.forEach((content, idx2) => {
            if (data.length-1=== idx && valueArr.length-1 === idx2) message.push(`└ ${key} : ${content}`);
            else if (idx2 !== 0) message.push(`│ ${content}`); 
            else message.push(`├ ${key} : ${content}`)
        });
    })
    console.log(`${message.join("\n")}${color.Reset}`);
}
export function Log(text: string, add?: object) {
    CallLog(0, text, add);
}
export function Success(text: string, add?: object) {
    CallLog(1, text, add);
}
export function Error(text: string, add?: object) {
    CallLog(2, text, add)
}
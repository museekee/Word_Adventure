// const fs = require("fs");
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
// const startDate = new Date();
// const fileName = `./logs/${startDate.getFullYear()} ${startDate.getMonth() + 1} ${startDate.getDate()}.json`;
// (function() {
//     if (!fs.existsSync(fileName)) fs.writeFileSync(fileName, "[]", "utf8");
// })();
/**
 * 
 * @param { number } type 0: Log / 1: Success / 2: Error
 * @param { string } text message
 * @param { object? } add add other message
 */
function CallLog(type: number, text: string, add?: object) {
    let message;
    switch (type) {
        case 0:
            message = `${color.FgWhite}📝 Log`;
            break;
        case 1:
            message = `${color.FgGreen}✅ Success`;
            break;
        case 2:
            message = `${color.FgRed}❌ Error`
            break;
    }
    const date = new Date();
    const time = `${date.toLocaleDateString()} ${date.toLocaleTimeString()} (${Date.now()})`;
    const data: data = Object.assign({
        type: type,
        message: text,
        time: time 
    }, add);
    for (const value in data) {
        const valueArr = data[value].toString().split("\n");
        message += `\n├ ${value}: ${valueArr[0]}`;
        for (let i = 0; i < valueArr.length; i++)
            if (i !== 0) message += `\n│ ${valueArr[i]}`;
    }
    // const logfileJson = JSON.parse(fs.readFileSync(fileName, "utf8"));
    // logfileJson.push(data)
    // fs.writeFileSync(fileName, JSON.stringify(logfileJson, null, 4));
    console.log(`${message}${color.Reset}`);
}
interface data {
    [index: string]: string | number | boolean
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
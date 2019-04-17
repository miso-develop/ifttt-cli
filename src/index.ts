import argvParser from "./argvParser"
import IFTTT from "./ifttt"
import Command from "./command"

; (async () => {
    let ifttt: IFTTT | undefined
    try {
        const argv = argvParser.get().argv
        ifttt = await new IFTTT().wake(argv)
        await new Command(ifttt).run()
        
    } catch (e) {
        console.error(`\u001b[31m${e}\u001b[0m`)
    }
    if (ifttt) await ifttt.browser.close()
})()

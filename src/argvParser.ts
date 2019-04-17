import strings from "./strings"
import yargs from "yargs"
import validator from "validator"
import fs from "fs"

const rootPath = `${__dirname.replace(/(src|dist)$/, "")}/`
const packageJson = require(`${rootPath}package.json`)

class ArgvParser {
    public yargs = yargs
    public get(): yargs.Argv {
        try {
            return yargs
                .options("b", {
                    alias: ["browser", "no-headless"],
                    desc: strings.message.argv.describe.option.browser,
                    type: "boolean",
                })
                
                .command({
                    command: "$0 [options] <command>",
                    // @ts-ignore
                    desc: strings.message.argv.describe.command.$0,
                    builder: (yargs: yargs.Argv) => yargs
                        .positional("command", {
                            choices: [
                                "login",
                                "logout",
                                "connect",
                                "list",
                                "get",
                                "create",
                                "delete",
                                "update",
                            ],
                        })
                        .demandOption("command")
                    ,
                })
                
                .command({
                    // tslint:disable-next-line:max-line-length
                    // command: "login [-e, --email <email> <password>] [-g, --google <id> <password>] [-f, --facebook <id> <password>]", // IMPL: implements -g, -f
                    command: "login [-e, --email <mail address> <password>]",
                    desc: strings.message.argv.describe.command.login,
                    builder: (yargs: yargs.Argv) => yargs
                        .option("e", {
                            alias: "email",
                            desc: strings.message.argv.describe.option.email,
                            type: "string",
                            nargs: 2,
                        })
                        // IMPL: implement!
                        // .option("g", {
                        //     alias: "google",
                        //     desc: strings.message.argv.describe.option.google,
                        //     type: "string",
                        //     nargs: 2,
                        // })
                        // IMPL: implement!
                        // .option("f", {
                        //     alias: "facebook",
                        //     desc: strings.message.argv.describe.option.facebook,
                        //     type: "string",
                        //     nargs: 2,
                        // })
                        .positional("mail address", {
                            desc: strings.message.argv.describe.positional.mailAddress,
                            type: "string",
                        })
                        .positional("password", {
                            desc: strings.message.argv.describe.positional.password,
                            type: "string",
                        })
                        // IMPL: implement!
                        // .positional("id", {
                        //     desc: strings.message.argv.describe.positional.loginId,
                        //     type: "string"
                        // })
                        .conflicts("e", ["g", "f"])
                        .conflicts("g", ["e", "f"])
                        .conflicts("f", ["e", "g"])
                        .check(this.checkEmail)
                        .group("e", "Positional Options: ")
                    ,
                })
                
                .command({
                    command: "logout",
                    desc: strings.message.argv.describe.command.logout,
                })
                
                .command({
                    command: "connect <service>",
                    desc: strings.message.argv.describe.command.connect,
                    builder: (yargs: yargs.Argv) => yargs
                        .positional("service", {
                            desc: strings.message.argv.describe.positional.service,
                            type: "string",
                        })
                    ,
                })
                
                .command({
                    command: "list [-l, --long]",
                    desc: strings.message.argv.describe.command.list,
                    builder: (yargs: yargs.Argv) => yargs
                        .options("l", {
                            alias: "long",
                            desc: strings.message.argv.describe.option.long,
                            type: "boolean",
                        })
                        .group("l", "Positional Options: ")
                    ,
                })
                
                .command({
                    command: "get [id..]",
                    desc: strings.message.argv.describe.command.get,
                    builder: (yargs: yargs.Argv) => yargs
                        .positional("id", {
                            desc: strings.message.argv.describe.positional.id,
                            type: "string",
                            array: true,
                        })
                        .options("a", {
                            alias: "all",
                            desc: strings.message.argv.describe.option.all,
                            type: "boolean",
                        })
                        .check(this.checkIdOrAll)
                        .group("a", "Positional Options: ")
                        .usage(`get <-a, --all | id..>\n\n${strings.message.argv.describe.command.get}`)
                    ,
                })
                
                .command({
                    command: "create <file>",
                    desc: strings.message.argv.describe.command.create,
                    builder: (yargs: yargs.Argv) => yargs
                        .positional("file", {
                            desc: strings.message.argv.describe.positional.file,
                            type: "string",
                            normalize: true,
                        })
                        .check(this.checkFile)
                        .demandOption("file")
                    ,
                })
                
                .command({
                    command: "delete <id..>",
                    desc: strings.message.argv.describe.command.delete,
                    builder: (yargs: yargs.Argv) => yargs
                        .positional("id", {
                            desc: strings.message.argv.describe.positional.id,
                            type: "string",
                            array: true,
                        })
                        .demandOption("id")
                    ,
                })
                
                .command({
                    command: "update <file>",
                    desc: strings.message.argv.describe.command.update,
                    builder: (yargs: yargs.Argv) => yargs
                        .positional("file", {
                            desc: strings.message.argv.describe.positional.file,
                            type: "string",
                            normalize: true,
                        })
                        .check(this.checkFile)
                        .demandOption("file")
                    ,
                })
                
                .alias("h", "help")
                .alias("v", "version")
                
                .scriptName(strings.name)
                .version(packageJson.version)
                
                .recommendCommands()
                .strict()
                
        } catch (e) {
            throw e
        }
    }
    
    private checkEmail(argv: any) {
        if (!argv.email) return true
        if (!validator.isEmail(argv.email[0])) throw strings.message.argv.error.mailAddress
        if (!validator.isLength(argv.email[1], 6)) throw strings.message.argv.error.password
        return true
    }
    
    private checkFile(argv: any) {
        const file = `./${argv.file}`
        try {
            fs.statSync(file)
            return true
        } catch (e) {
            throw `${strings.message.argv.error.file} "${file}"`
        }
    }
    
    private checkIdOrAll(argv: any) {
        if (!argv.id.length && !argv.a && !argv.all) throw strings.message.argv.error.get
        return true
    }
    
}

export default new ArgvParser()

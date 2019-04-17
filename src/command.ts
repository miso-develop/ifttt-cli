import Types from "./types"
import strings from "./strings"
import { table, getBorderCharacters } from "table"
import rimraf from "rimraf"

export default class Command {
    private ifttt: Types.IFTTT
    constructor(ifttt: Types.IFTTT) {
        this.ifttt = ifttt
    }
    
    public async run(): Promise<void> {
        const commands: any = {
            login: () => {
                // -e, --email mailAddress password
                if (this.ifttt.argv.e || this.ifttt.argv.email)
                    return this.loginEmail({ email: this.ifttt.argv.e[0], password: this.ifttt.argv.e[1] })
                return this.loginBrowser()
            },
            logout: () => {
                return this.logout()
            },
            connect: () => {
                return this.connect(this.ifttt.argv.service)
            },
            list: () => {
                // -l, --long
                if (this.ifttt.argv.l, this.ifttt.argv.long) return this.getAppletList(this.ifttt.argv.l)
                return this.getAppletList()
            },
            get: () => {
                // -a, --all
                if (this.ifttt.argv.a || this.ifttt.argv.all) return this.getApplets(this.ifttt.argv.all)
                return this.getApplets(this.ifttt.argv.id)
            },
            delete: () => {
                return this.deleteApplets(this.ifttt.argv.id)
            },
            create: () => {
                return this.createApplets(this.ifttt.argv.file)
            },
            update: () => {
                return this.updateApplets(this.ifttt.argv.file)
            },
        }
        
        const commandName: string = this.ifttt.argv._[0]
        const serviceName: string = this.ifttt.argv.service
        await this.moveFirstPage(commandName, serviceName)
        this.checkLoggedInStatus(commandName)
        await commands[commandName]()
    }
    
    private async moveFirstPage(commandName: string, serviceName: string): Promise<void> {
        let url = strings.url.myApplets
        if (commandName === "create") url = strings.url.create
        if (commandName === "connect") url = `${strings.url.root}${serviceName}`
        await this.ifttt.moveUrl(url)
    }
    private checkLoggedInStatus(commandName: string): void {
        if (commandName === "login" && this.ifttt.isLoggedIn()) throw strings.message.command.error.loggedIn
        if (commandName !== "login" && !this.ifttt.isLoggedIn()) throw strings.message.command.error.notLoggedIn
    }
    
    
    
    private async loginBrowser(): Promise<void> {
        await this.ifttt.login.waitForLogin()
        console.log(strings.message.command.success.login)
    }
    
    private async loginEmail(emailAndPassword: Types.emailAndPassword): Promise<void> {
        await this.ifttt.moveClick("a.sign-in")
        await this.ifttt.login.inputEmailForm(emailAndPassword)
        if (this.ifttt.login.checkLoggedIn()) throw strings.message.command.error.loginFailed
        console.log(strings.message.command.success.login)
    }
    
    private async loginGoogle(emailAndPassword: Types.emailAndPassword): Promise<void> {
        // IMPL: implement!
        console.log(strings.message.command.success.login)
    }
    
    private async loginFacebook(emailAndPassword: Types.emailAndPassword): Promise<void> {
        // IMPL: implement!
        console.log(strings.message.command.success.login)
    }
    
    
    
    private async logout(): Promise<void> {
        rimraf(`${__dirname.replace(/(src|dist)$/, "")}/${strings.config.cacheDir}`, () => {})
        console.log(strings.message.command.success.logout)
    }
    
    
    
    private async connect(serviceId: string): Promise<void> {
        if (await this.ifttt.service.checkPageNotFound()) throw strings.message.command.error.serviceNotFound
        if (await this.ifttt.service.checkConnected()) throw strings.message.command.error.connected
        await this.ifttt.service.clickConnect()
        if (!this.ifttt.isLoggedIn()) throw strings.message.command.error.notLoggedIn
        await this.ifttt.service.waitForConnected()
        if (!(await this.ifttt.service.checkConnected())) throw strings.message.command.error.connectionFailed
        console.log(strings.message.command.success.connect)
    }
    
    
    
    private async getAppletList(long?: boolean): Promise<void> {
        const appletList: Types.AppletList[] = await this.ifttt.list.getAppletList()
        const border = { border: getBorderCharacters("norc") }
        const output: string = long ?
            table(appletList, border) :
            table(appletList.map(applet => [applet[0], applet[1]]), border)
        console.log(output)
    }
    
    
    
    private async getApplets(ids: string[] | boolean): Promise<void> {
        // tslint:disable-next-line:no-parameter-reassignment
        if (typeof ids === "boolean") ids = await this.ifttt.list.getAllAppletId()
        
        const applets: Types.Applet[] = []
        for (const id of ids) {
            if (!this.ifttt.isMyAppletsPage()) await this.ifttt.moveMyApplets()
            applets.push(await this.getApplet(id))
        }
        
        const appletsString: string = JSON.stringify(applets, null, 2)
        console.log(appletsString)
    }
    
    private async getApplet(id: string): Promise<Types.Applet> {
        // move page
        await this.ifttt.list.moveAppletDetail(id)
        await this.ifttt.detail.moveAppletEdit()
        
        // get applet
        const applet: Types.Applet = await this.ifttt.edit.getAppletFields()
        return applet
    }
    
    
    
    private async deleteApplets(ids: string[] | boolean): Promise<void> {
        // tslint:disable-next-line:no-parameter-reassignment
        if (typeof ids === "boolean") ids = await this.ifttt.list.getAllAppletId()
        
        for (const id of ids) await this.deleteApplet(id)
        
        console.log(strings.message.command.success.deleteComplate)
    }
    
    private async deleteApplet(id: string): Promise<void> {
        await this.ifttt.list.moveAppletDetail(id)
        await this.ifttt.detail.moveAppletEdit()
        await this.ifttt.edit.delete()
        await this.ifttt.moveMyApplets()
        console.log(`${strings.message.command.success.delete}${id}`)
    }
    
    
    
    private async createApplets(file: string): Promise<void> {
        const recipes: Types.Applet[] = require(`${process.cwd()}/${file}`)
        for (const recipe of recipes) {
            if (!this.ifttt.isMyAppletsPage()) await this.ifttt.moveMyApplets()
            await this.createApplet(recipe)
        }
        console.log(strings.message.command.success.createComplate)
    }
    
    private async createApplet(recipe: Types.Applet): Promise<void> {
        // move page
        await this.ifttt.list.moveNewApplet()
        
        // trigger
        await this.ifttt.create.selectService(recipe.trigger.service)
        await this.ifttt.create.selectServiceType(recipe.trigger.type)
        await this.ifttt.create.setServiceFields(recipe.trigger.fields)
        
        // action
        await this.ifttt.create.selectService(recipe.action.service)
        await this.ifttt.create.selectServiceType(recipe.action.type)
        await this.ifttt.create.setServiceFields(recipe.action.fields)
        
        // applet name
        if (!!recipe.name) await this.ifttt.create.setAppletName(recipe.name)
        
        // notice off
        if (!recipe.notification) await this.ifttt.create.setOffNotice()
        
        // finish
        await this.ifttt.create.finish()
        
        // status off
        if (!recipe.status) await this.ifttt.create.setOffStatus()
        
        const appletId = await this.ifttt.create.getAppletId()
        console.log(`${strings.message.command.success.create}${appletId}`)
    }
    
    
    
    public async updateApplets(file: string[]): Promise<void> {
        const recipes: Types.Applet[] = require(`${process.cwd()}/${file}`)
        for (const recipe of recipes) {
            if (!this.ifttt.isMyAppletsPage()) await this.ifttt.moveMyApplets()
            await this.updateApplet(recipe)
        }
        console.log(strings.message.command.success.updateComplate)
    }
    
    private async updateApplet(recipe: Types.Applet): Promise<void> {
        // move
        await this.ifttt.list.moveAppletDetail(recipe.id)
        
        // status on
        await this.ifttt.detail.updateStatus(true)
        
        // move
        await this.ifttt.detail.moveAppletEdit()
        
        // name update
        await this.ifttt.edit.updateAppletName(recipe.name)
        // notice update
        await this.ifttt.edit.updateNotification(recipe.notification)
        
        // service check
        await this.ifttt.edit.checkService(recipe)
        
        // fields update
        await this.ifttt.edit.updateServiceFields(recipe.trigger.fields)
        await this.ifttt.edit.updateServiceFields(recipe.action.fields)
        
        // save
        await this.ifttt.edit.save()
        
        // status update
        await this.ifttt.detail.updateStatus(recipe.status)
        
        console.log(`${strings.message.command.success.update}${recipe.id}`)
    }
}

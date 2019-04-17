import Types from "./types"
import strings from "./strings"
import IFTTT from "./ifttt"

abstract class Page {
    public ifttt: IFTTT
    constructor(ifttt: IFTTT) {
        this.ifttt = ifttt
    }
}

export class Login extends Page {
    constructor(ifttt: IFTTT) {
        super(ifttt)
    }
    
    public async inputEmailForm(emailAndPassword: Types.emailAndPassword) {
        await this.ifttt.type("#user_username", emailAndPassword.email)
        await this.ifttt.type("#user_password", emailAndPassword.password)
        await this.ifttt.moveClick("input[type=submit]")
    }
    
    public checkLoggedIn() {
        return this.ifttt.page.url().indexOf("/session/new") > -1
    }
    
    public async waitForLogin() {
        await this.ifttt.page.waitForFunction(
            (discover, myApplets) => document.URL === discover || document.URL === myApplets,
            { timeout: 0 },
            strings.url.discover,
            strings.url.myApplets,
        )
    }
}

export class Service extends Page {
    constructor(ifttt: IFTTT) {
        super(ifttt)
    }
    
    public async checkPageNotFound(): Promise<boolean> {
        return (await this.ifttt.page.title()).indexOf("404") > -1
    }
    
    public async checkConnected(): Promise<boolean> {
        return !(await this.ifttt.page.$("a[data-track-event*=connect]"))
    }
    
    public async clickConnect(): Promise<void> {
        await this.ifttt.moveClick("a[data-track-event*=connect]")
    }
    
    public async waitForConnected() {
        await this.ifttt.page.waitForSelector("a[data-track-event*=settings]", { timeout: 0 })
    }
}

export class List extends Page {
    constructor(ifttt: IFTTT) {
        super(ifttt)
    }
    
    public async moveAppletDetail(id: string): Promise<void> {
        if (!(await this.existAppletId(id))) throw strings.message.command.error.appletNotFound
        await this.ifttt.moveClick(`#applet-${id} > a`)
    }
    private async existAppletId(id: string) {
        return await this.ifttt.existSelector(`#applet-${id}`)
    }
    
    public async moveNewApplet(): Promise<void> {
        await this.ifttt.moveClick("a.new-applet-btn")
    }
    
    public async getAppletList(): Promise<Types.AppletList[]> {
        if (await this.ifttt.existSelector(".btn-primary")) throw strings.message.command.error.noApplet
        
        const selector = "li.web-applet-card[id]"
        await this.ifttt.page.waitForSelector(selector)
        const appletsData: Types.AppletList[] = await this.ifttt.page.$$eval(
            selector,
            (list: Element[]): Types.AppletList[] => list.map(
                (elem: any): Types.AppletList => {
                    const id: string = elem.dataset.id
                    const name: string = elem.querySelector("span.title").innerHTML.replace(/\n/, "").trim()
                    const trigger: string = elem.querySelector("div.content img").getAttribute("title")
                    const action: string = elem.querySelector("div.meta > div.works-with img") ?
                        elem.querySelector("div.meta > div.works-with img").getAttribute("title") : trigger
                    const status: boolean = elem.querySelector("div.meta > div.status")
                        .innerText.replace(/\n/, "").trim() === "On"
                    
                    return [
                        id,
                        name,
                        trigger,
                        action,
                        status,
                    ]
                },
            ),
        )
        appletsData.unshift(["ID", "Name", "Trigger", "Action", "Status"])
        return appletsData
    }
    
    public async getAllAppletId(): Promise<string[]> {
        if (await this.ifttt.existSelector(".btn-primary")) throw strings.message.command.error.noApplet
        
        const selector = "li.web-applet-card[id]"
        await this.ifttt.page.waitForSelector(selector)
        
        const allId: string[] = await this.ifttt.page.$$eval(
            selector,
            (list: Element[]): string[] => list.map((elem: any): string => elem.dataset.id),
        )
        return allId
    }
}

export class Detail extends Page {
    constructor(ifttt: IFTTT) {
        super(ifttt)
    }
    
    public async moveAppletEdit(): Promise<void> {
        await this.ifttt.moveClick("a.applet-edit")
        await this.ifttt.page.waitForSelector("input[type=submit]")
    }
    
    public async updateStatus(status: boolean): Promise<void> {
        // FIXME: sleep...
        await this.ifttt.page.waitFor(1000)
        const currentState: boolean = await this.ifttt.getSwitchState()
        if (status !== currentState) {
            await this.ifttt.click("button.switch-button")
            await this.ifttt.page.waitForSelector(".alert-success")
        }
    }
}

export class Edit extends Page {
    constructor(ifttt: IFTTT) {
        super(ifttt)
    }
    
    public async getAppletFields(): Promise<Types.Applet> {
        const props: Types.ReactProps = await this.getReactProps()
        
        const id: string = props.applet.id
        const name: string = props.applet.name
        const status: boolean = this.getStatus(props.applet.status)
        const notification: boolean = await this.ifttt.getSwitchState()
        
        const triggerData: {service: string, type: string} = this.getServiceData(props.applet.permissions, "trigger")
        const actionData: {service: string, type: string} = this.getServiceData(props.applet.permissions, "action")
        
        const triggerFields: Types.ServiceField[] = this.getServiceFields(props.storedFields, triggerData.service)
        const actionFields: Types.ServiceField[] = this.getServiceFields(props.storedFields, actionData.service)
        
        const trigger: Types.AppletService = {
            service: triggerData.service,
            type: triggerData.type,
            fields: triggerFields,
        }
        const action: Types.AppletService = {
            service: actionData.service,
            type: actionData.type,
            fields: actionFields,
        }
        
        return {
            id,
            name,
            notification,
            status,
            trigger,
            action,
        }
        
    }
    
    private async getReactProps(): Promise<Types.ReactProps> {
        const selector: string = "div.applet-content > div"
        await this.ifttt.page.waitForSelector(selector)
        const props = await this.ifttt.page.$eval(
            selector,
            (elem: Element): string => (<HTMLElement>elem).dataset.reactProps || "",
        )
        return JSON.parse(props)
    }
    
    private getServiceData(permissions: any[], serviceType: string): {service: string, type: string} {
        for (const permission of permissions)
            if (permission.id.indexOf(serviceType) > -1)
                return {
                    service: permission.service_id,
                    type: permission.id.split(".")[1],
                }
        
        throw strings.message.command.error.serviceDataNotFound
    }
    
    private getServiceFields(fields: any[], serviceId: string): Types.ServiceField[] {
        return fields
        .filter((field: any): boolean => {
            return !!field.owner.match(serviceId)
        })
        .map((field: any): Types.ServiceField => {
            return {
                name: field.name,
                value: field.value,
                type: field.field_subtype,
            }
        })
    }
    
    private getStatus(status: string) {
        return !!status.match("enabled")
    }
    
    public async delete(): Promise<void> {
        // Press the OK button when the dialog pops up Event hook
        await this.ifttt.page.once("dialog", async dialog => await dialog.accept())
        await this.ifttt.moveClick("a.delete-applet")
    }
    
    public async updateAppletName(name: string): Promise<void> {
        await this.ifttt.typeOverwrite("textarea[name=name]", name)
    }
    
    public async updateNotification(notification: boolean): Promise<void> {
        const currentState: boolean = await this.ifttt.getSwitchState()
        if (notification !== currentState) {
            await this.ifttt.click("button.switch-button")
            await this.ifttt.page.waitForSelector(".alert-success")
        }
    }
    
    public async checkService(service: Types.Applet): Promise<void> {
        const props: Types.ReactProps = await this.getReactProps()
        const triggerData: {service: string, type: string} = this.getServiceData(props.applet.permissions, "trigger")
        const actionData: {service: string, type: string} = this.getServiceData(props.applet.permissions, "action")
        // IMPL: Return the unmatched one
        if (service.trigger.service !== triggerData.service ||
            service.trigger.type !== triggerData.type ||
            service.action.service !== actionData.service ||
            service.action.type !== actionData.type)
            throw strings.message.command.error.updateServiceNotMatch
    }
    
    public async updateServiceFields(fields: Types.ServiceField[]): Promise<void> {
        await this.ifttt.inputFields(fields)
    }
    
    public async save(): Promise<void> {
        try {
            await Promise.all([
                this.ifttt.page.waitForNavigation(this.ifttt.waitOption),
                new Promise(async (resolve, reject) => {
                    await this.ifttt.click("input[type=submit]")
                    if (await this.ifttt.checkErrorMessage()) reject()
                    resolve()
                }),
            ])
        } catch (e) {
            // IMPL: It would be nice if I could return the error content.
            throw strings.message.command.error.notUpdate
        }
    }
}

export class Create extends Page {
    constructor(ifttt: IFTTT) {
        super(ifttt)
    }
    
    public async selectService(serviceId: string): Promise<void> {
        // FIXME: sleep
        await this.ifttt.page.waitFor(500)
        await this.ifttt.moveClick("span.plus")
        if (!(await this.checkServiceId(serviceId))) throw strings.message.command.error.serviceIdNotFound
        await this.ifttt.moveClick(`ul.service-grid > li.service-tile > a[data-track-data*=${serviceId}]`)
        if (await this.checkConnectButton()) throw `${strings.message.command.error.needConnect}${serviceId}\`\n`
        await this.ifttt.page.waitForSelector("div.tanda-selector span.title")
    }
    private async checkServiceId(serviceId: string): Promise<boolean> {
        return await this.ifttt.existSelector(`a[data-track-data*=${serviceId}]`)
    }
    private async checkConnectButton(): Promise<boolean> {
        return await this.ifttt.existSelector("div.service-connection > button")
    }
    
    public async selectServiceType(type: string): Promise<void> {
        // FIXME: sleep
        await this.ifttt.page.waitFor(500)
        if (!(await this.checkServiceType(type))) throw strings.message.command.error.serviceTypeNotFound
        await this.ifttt.moveClick(`div.tanda-selector > ul > li[data-track-data*=${type}]`)
    }
    private async checkServiceType(type: string): Promise<boolean> {
        return await this.ifttt.existSelector(`li[data-track-data*=${type}]`)
    }
    
    public async setServiceFields(fields: Types.ServiceField[]): Promise<void> {
        await this.ifttt.inputFields(fields)
        
        try {
            await Promise.all([
                this.ifttt.page.waitForNavigation(this.ifttt.waitOption),
                new Promise(async (resolve, reject) => {
                    await this.ifttt.click("input[type=submit]")
                    if (await this.ifttt.checkErrorMessage()) reject()
                    resolve()
                }),
            ])
        } catch (e) {
            // IMPL: It would be nice if I could return the error content.
            throw strings.message.command.error.notCreate
        }
    }
    
    public async setAppletName(name: string): Promise<void> {
        const selector = "textarea:nth-child(1)"
        await this.ifttt.typeOverwrite(selector, name)
        // FIXME: sleep
        await this.ifttt.page.waitFor(500)
    }
    
    public async setOffNotice(): Promise<void> {
        await this.ifttt.click("button.switch-button")
    }
    
    public async finish(): Promise<void> {
        await this.ifttt.moveClick("input[type=submit]")
        try {
            await this.ifttt.page.waitForSelector("a.applet-edit")
        } catch (e) {
            throw strings.message.command.error.notCreate
        }
    }
    
    public async setOffStatus(): Promise<void> {
        await this.ifttt.click("button.switch-button")
    }
    
    public async getAppletId(): Promise<string> {
        const shortId: string = (await this.ifttt.getText("p.applet-id")).replace("Applet version ID ", "").trim()
        const reg: RegExp = new RegExp(`^.*\\/(${shortId}[\\w])-.*$`)
        const match: string[] | null = this.ifttt.page.url().match(reg)
        const id: string = match ? match[1] : ""
        return id
    }
}

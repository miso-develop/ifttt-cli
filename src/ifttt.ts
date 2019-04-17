import Types from "./types"
import strings from "./strings"
import { Login, Service, List, Detail, Edit, Create } from "./pages"
import puppeteer from "puppeteer"

export default class IFTTT {
    public page: Types.Page = <Types.Page>{}
    public browser: Types.Browser = <Types.Browser>{}
    public argv: any = {}
    
    public login: Login = new Login(this)
    public service: Service = new Service(this)
    public list: List = new List(this)
    public detail: Detail = new Detail(this)
    public edit: Edit = new Edit(this)
    public create: Create = new Create(this)
    
    private readonly delay10: { delay: number } = { delay: 10 }
    private readonly delay100: { delay: number } = { delay: 100 }
    
    private readonly emulateOption: puppeteer.EmulateOptions = {
        // tslint:disable-next-line:max-line-length
        userAgent: strings.config.userAgent,
        viewport: {
            width: 1000,
            height: 1000,
            deviceScaleFactor: 1,
            isMobile: false,
            hasTouch: false,
            isLandscape: false,
        },
    }
    
    public readonly waitOption: puppeteer.DirectNavigationOptions = {
        waitUntil: "domcontentloaded",
    }
    
    private readonly launchOptions: puppeteer.LaunchOptions = {
        userDataDir: `${__dirname.replace(/(src|dist)$/, "")}/${strings.config.cacheDir}`,
        args: [
            "--proxy-server=direct://",
            "--proxy-bypass-list=*",
        ],
        headless: false,
    }
    
    
    
    public async wake(argv: any): Promise<IFTTT> {
        const launchOptions: puppeteer.LaunchOptions = this.getLaunchOptionsFromArgv(argv)
        const chrome = await this.wakeChrome(launchOptions)
        this.page = chrome.page
        this.browser = chrome.browser
        this.argv = argv
        return this
    }
    private getLaunchOptionsFromArgv(argv: any): puppeteer.LaunchOptions {
        const commandName: string = argv._[0]
        if (commandName === "connect") return this.launchOptions
        if (commandName === "login" && !argv.e) return this.launchOptions
        if (argv.b) return this.launchOptions
        
        const launchOptions = this.launchOptions
        launchOptions.headless = true
        return launchOptions
    }
    private async wakeChrome(launchOptions: puppeteer.LaunchOptions): Promise<Types.Chrome> {
        const browser: puppeteer.Browser = await puppeteer.launch(launchOptions)
        const page: puppeteer.Page = await browser.newPage()
        await page.emulate(this.emulateOption)
        return { browser, page }
    }
    
    
    
    public async getInnerHTML(selector: string): Promise<string>
        { return await this.page.$eval(selector, (elem: Element): string => elem.innerHTML) }
    public async getValue(selector: string): Promise<string>
        { return await this.page.$eval(selector, (elem: Element): string => (<HTMLInputElement>elem).value) }
    public async getText(selector: string): Promise<string>
        { return await this.page.$eval(selector, (elem: Element): string => elem.innerHTML) }
    public async getSelect(selector: string): Promise<string>
        { return await this.page.$eval(selector, (elem: Element): string => (<HTMLInputElement>elem).value) }
        
    public async getSelectHtmlValue(selector: string, value: string): Promise<string> {
        const optionSelector: string = `${selector} > option`
        await this.page.waitForSelector(optionSelector)
        
        const selectHtmlValue: string = await this.page.$$eval(
            optionSelector,
            (elems: Element[], value: string): string => {
                for (const elem of elems)
                    if ((<HTMLInputElement>elem).value === value)
                        return elem.innerHTML
                return ""
            },
            value,
        )
        return selectHtmlValue
    }
    
    public async getStyle(selector: string, styleName: string): Promise<string> {
        const style: string = await this.page.$eval(
            selector,
            (elem: Element, styleName: any): string => (<HTMLInputElement>elem).style[styleName],
            styleName,
        )
        return style
    }
    
    public async existSelectValue(selector: string, value: string): Promise<boolean> {
        const optionSelector: string = `${selector} > option`
        await this.page.waitForSelector(optionSelector)
        
        const exist = await this.page.$$eval(
            optionSelector,
            (elems: Element[], value: string): boolean => {
                for (const elem of elems)
                    if ((<HTMLInputElement>elem).value === value)
                        return true
                return false
            },
            value,
        )
        return exist
    }
    
    public async click(selector: string): Promise<void> {
        await this.page.waitForSelector(selector)
        await this.page.click(selector, this.delay10)
    }
    
    public async type(selector: string, text: string): Promise<void> {
        await this.page.waitForSelector(selector)
        await this.page.type(selector, text, this.delay10)
    }
    
    public async typeOverwrite(selector: string, text: string): Promise<void> {
        await this.page.waitForSelector(selector)
        await this.page.click(selector, { clickCount: 3 })
        await this.page.type(selector, text, this.delay10)
    }
    
    private async move(moveFunction: any): Promise<void> {
        await Promise.all([
            this.page.waitForNavigation(this.waitOption),
            moveFunction(),
        ])
        this.page.waitFor(500)
    }
    
    public async moveClick(selector: string): Promise<void> {
        await this.move(async () => {
            await this.click(selector)
        })
    }
    
    public async moveMyApplets(): Promise<void> {
        await this.moveUrl(strings.url.myApplets)
    }
    
    private async moveService(serviceId: string): Promise<void> {
        await this.moveUrl(`${strings.url.root}${serviceId}`)
    }
    
    public async moveUrl(url: string): Promise<void> {
        if (this.checkUrl(url)) return
        await this.page.goto(url, this.waitOption)
    }
    
    private checkUrl(url: string): boolean {
        return this.page.url() === url
    }
    
    public isLoggedIn() {
        return !this.checkUrl(strings.url.join) && !this.checkUrl(strings.url.login)
    }
    
    public isMyAppletsPage() {
        return this.checkUrl(strings.url.myApplets)
    }
    
    public async existSelector(selector: string): Promise<boolean> {
        return !!(await this.page.$(selector))
    }
    
    private async existSelectBox(): Promise<boolean> {
        return !!(await this.page.$("select"))
    }
    
    public async inputFields(fields: Types.ServiceField[]): Promise<void> {
        await this.waitForSelectLoaded()
        for (const field of fields) {
            // IMPL: It would be nice to return a field that did not match!
            if (!(await this.existField(field.name))) throw strings.message.command.error.serviceField
            await this.inputField(field)
        }
    }
    private async inputField(field: Types.ServiceField): Promise<void> {
        // IMPL: Append here if there are other input types!
        switch (field.type) {
        case strings.ifttt.fieldType.text:
            await this.typeOverwrite(`textarea[name*=${field.name}]`, field.value)
            break
            
        case strings.ifttt.fieldType.select:
            const selector: string = `select[name*=${field.name}]`
            if (!(await this.existSelectValue(selector, field.value)))
                throw strings.message.command.error.serviceSelectField
            const selectHtmlValue: string = await this.getSelectHtmlValue(selector, field.value)
            await this.type(selector, selectHtmlValue)
            break
            
        default:
            throw strings.message.command.error.serviceFieldType
        }
    }
    private async existField(fieldName: string): Promise<boolean> {
        return await this.existSelector(`[name*=${fieldName}]`)
    }
    
    public async checkErrorMessage(): Promise<boolean> {
        try {
            // FIXME: Confirm that no error occurs for 3 seconds. This is not good.
            await this.page.waitForSelector(`.error-message`, { timeout: 3000 })
        } catch (e) {
            return false
        }
        return true
    }
    
    public async getSwitchState(): Promise<boolean> {
        return !(await this.existSelector("div.switch-ui.disabled"))
    }
    
    private async waitForSelectLoaded(): Promise<void> {
        if (!(await this.existSelector("select"))) return
        await this.page.waitForFunction(
            () => !(<HTMLInputElement>document.querySelector("input[type=submit]")).disabled,
            {polling: 100},
        )
    }
}

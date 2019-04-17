/* tslint:disable:trailing-comma */
import puppeteer from "puppeteer"
import ifttt from "./ifttt"

declare namespace Types {
    // alias
    export type IFTTT = ifttt
    export type Page = puppeteer.Page
    export type Browser = puppeteer.Browser
    export type EmulateOptions = puppeteer.EmulateOptions
    export type DirectNavigationOptions = puppeteer.DirectNavigationOptions
    export type LaunchOptions = puppeteer.LaunchOptions
    
    export type Chrome = {
        browser: puppeteer.Browser,
        page: puppeteer.Page,
    }
    
    
    
    export type AppletList = [
        string,
        string,
        string,
        string,
        boolean | string
    ]
    
    // dummy
    export type ReactProps = any
    
    export type Applet = {
        id: string,
        name: string,
        notification: boolean,
        status: boolean,
        trigger: AppletService,
        action: AppletService,
        index?: number,
    }
    export type AppletService = {
        service: string,
        type: string,
        fields: ServiceField[],
    }
    export type ServiceField = {
        name: string,
        value: string,
        type: string,
    }
    
    
    
    export type emailAndPassword = {
        email: string,
        password: string,
    }
    export type idAndPassword = {
        id: string,
        password: string,
    }
    
}

export default Types

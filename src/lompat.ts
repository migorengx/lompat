import { uid } from 'uid';

declare global {
    interface Window {
        lompat: Lompat
    }
}

interface LompatInterface {
    callback: (key: string, fn: () => void) => void
}

type ReceiverPayload = {
    key: string
    data: Map<string, any>
    valid: boolean
}

type SenderPayload = {
    key: string
    body: string
}

type Callbacks = {
    [key: string]: (resp: ReceiverPayload) => void
}

class Lompat {
    
    private target: Partial<Window>
    private callbacks: Callbacks = {}
    private timeout: number 
    private prefix: string = "lompat"

    constructor(target: Partial<Window>, timeout: number = 3000) {
        this.prepare(target)
        this.timeout = timeout
    }
    private prepare(target: Partial<Window>) {
        console.log('-- target', target)
        if (target.parent) {
            this.target = target.parent
        } else {
            throw new Error("Target is not a window")
        }
    }
    private cleanCallback(key: string) {
        delete this.callbacks[key]
    }
    private cleanCallbacks() {
        this.callbacks = {}
    }
    private generateKey (): string {
        return this.prefix + "-" + uid()
    }
    private checkIfCallbackIsValid(key: string): boolean{
        return key.startsWith(this.prefix)
    }
    private validEventData(data: string): ReceiverPayload  {
        let output: ReceiverPayload = {
            key: "",
            data: new Map(),
            valid: false
        }
        try {
            output = JSON.parse(data)
            output.valid = true
        } catch (error) {
            console.warn("Invalid event data", data)
        }
        return output
    }
    public send(body: any, fn: () => void) {
        let packet: SenderPayload = {
            key: this.generateKey(),
            body: JSON.stringify(body)
        }
        this.target.postMessage(packet)
        this.callbacks[packet.key] = fn
        setTimeout(() => {
            this.cleanCallback(packet.key)
        }, this.timeout)
    }
    public start() {
        this.target.addEventListener('message', (event) => {
            const validData = this.validEventData(event.data)
            if (!validData.valid) {
                console.warn("Invalid event data", event.data)
                return
            }
            if (this.checkIfCallbackIsValid(validData.key) && validData.key in this.callbacks) {
                this.callbacks[validData.key](validData)
                setTimeout(() => {
                    this.cleanCallback(validData.key)
                }, 0); // wait until callbacks is done
            } else {
                console.warn("Invalid callback", validData.key)
            }
        })
    }
    public stop() {
        this.target.removeEventListener('message', () => {})
        this.cleanCallbacks()
    }
}

export default Lompat


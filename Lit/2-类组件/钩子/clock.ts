import { ReactiveController, ReactiveControllerHost } from 'lit'

export class ClockController implements ReactiveController {
    private readonly host: ReactiveControllerHost
    private interval = 0
    date = new Date()
    constructor(host: ReactiveControllerHost) {
        this.host = host
        host.addController(this)
    }

    hostConnected() {
        this.interval = setInterval(() => this.tick(), 1000)
    }
    private tick() {
        this.date = new Date()
        // ~  告知托管组件运行更新生命周期。
        this.host.requestUpdate()
    }

    hostDisconnected() {
        clearInterval(this.interval)
    }

    hostUpdate() {

    }

    hostUpdated() {

    }
}
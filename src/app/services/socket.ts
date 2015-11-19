var zone = new Zone();

export class SocketService {
    static socket: any = io();

    static on(evt: string, callback: any): any {
        if(typeof callback !== 'function') {
            throw new Error('You need to define a callback to listen to events');
        }
        return SocketService.socket.on(evt, zone.bind((...args: Array<any>) => {
            callback.apply(null, args);
        }));
    }

    static off(evt: string): any {
        return SocketService.socket.off(evt);
    }
}

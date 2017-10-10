import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';

@Injectable()
export class SocketIoService {

  constructor() {
  }

}


@Injectable()
export class AppSocketIoService {
  private socket: SocketIOClient.Socket; // The client instance of socket.io

  // Constructor with an injection of ToastService
  constructor(/*private toasterService: ToasterService*/) {
    this.socket = io();
  }

  // Emit: gist saved event
  emitEventOnGistSaved(gistSaved) {
    this.socket.emit('gistSaved', gistSaved);
  }

  // Emit: gist updated event
  emitEventOnGistUpdated(gistUpdated) {
    this.socket.emit('gistUpdated', gistUpdated);
  }

  // Consume: on gist saved
  consumeEvenOnGistSaved() {
    const self = this;
    this.socket.on('gistSaved', function(/*gist: Gist*/) {
      // self.toasterService.pop('success', 'NEW GIST SAVED',
      //   'A gist with title \"' + gist.title + '\" has just been shared' + ' with stack: ' + gist.technologies);
      console.log('success saved');
    });
  }

  // Consume on gist updated
  consumeEvenOnGistUpdated() {
    const self = this;
    this.socket.on('gistUpdated', function(/*gist: Gist*/) {
      // self.toasterService.pop('info', 'GIST UPDATED',
      //   'A gist with title \"' + gist.title + '\" has just been updated');
      console.log('info updated');
    });
  }
}

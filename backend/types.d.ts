import {WebSocket} from 'ws';

export interface ActiveConnections {
    [id: string]: WebSocket
}
  
export interface Drawings {
    x: number;
    y: number;
    color: string
}
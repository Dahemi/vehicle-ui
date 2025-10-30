import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { io, Socket } from "socket.io-client";

export interface ExportNotification{
    jobId: string;
    filename: string;
    recordCount: number;
    years: number;
}

export interface ExportFailedNotification{
    jobId: string;
    error: string;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService{
    private socket: Socket;
    private exportCompleted$ = new Subject<ExportNotification>();
    private exportFailed$ = new Subject<ExportFailedNotification>();

    constructor(){
        
        this.socket = io('http://localhost:3000',{
            transports: ['websocket'],
            autoConnect: true,
        })

        this.setUpListeners();
        
    }

    private setUpListeners(): void {
        this.socket.on('connect', ()=>{
            console.log('Websocket connected');
        });

        this.socket.on('disconnect', ()=>{
            console.log('Websocket disconnected');
        });

        this.socket.on('export-completed',(data: ExportNotification) =>{
            this.exportCompleted$.next(data);
        })

        this.socket.on('export-failed',(data: ExportFailedNotification) =>{
            this.exportFailed$.next(data);
        });
    }

    // public methods other components can use to subscribe 
    onExportCompleted(): Observable<ExportNotification>{
        return this.exportCompleted$.asObservable();
    }

    onExportFailed(): Observable<ExportFailedNotification>{
        return this.exportFailed$.asObservable();
    }

    disconnect(): void{
        if(this.socket){
            this.socket.disconnect();
        }
    }
}
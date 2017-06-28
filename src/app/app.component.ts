import { Component, OnInit, Directive } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take'
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';

declare var webNotification:any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{
  user: Observable<firebase.User>;
  userBjt: any;
  usersUidsBjt: any;
  timeObservableBjt: any;

  time: any;

  admin: Boolean = false;
  ini: Boolean = false;
  usersUids: FirebaseObjectObservable<any>;
  timeObservable: FirebaseObjectObservable<any>;
  usersOnline: FirebaseListObservable<any>;
  userUid: string = "";


  hour:number = 0;
  min:number = 0;
  seg:number = 0;

  cycle:number = 0;

  state: Boolean = true;//true trabajo

  pause: Boolean = false;

  constructor(db: AngularFireDatabase, public afAuth: AngularFireAuth) {
    this.user = afAuth.authState;
    this.usersUids = db.object('/admins');
    this.usersOnline = db.list('/users');
    this.timeObservable = db.object('/time',{ preserveSnapshot: true });
  }

  ngOnInit() {
    this.noti('Pomodoro Emkode','Bienvenido');
  }

  noti(title:string,body:string){
    webNotification.showNotification(title, {
        body: body,
        icon: 'favicon.ico',
        onClick: function onNotificationClicked() {
            console.log('Notification clicked.');
        },
        autoClose: 6000 //auto close the notification after 4 seconds (you can manually close it via hide function)
    }, function onShow(error, hide) {
        if (error) {
            window.alert('Unable to show notification: ' + error.message);
        } else {
            console.log('Notification Shown.');

            setTimeout(function hideNotification() {
                console.log('Hiding notification....');
                hide(); //manually close the notification (you can skip this if you use the autoClose option)
            }, 5000);
        }
    });
  }

  login() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    this.userBjt = this.user.subscribe((userInfo)=>{
      if(userInfo){
        this.userUid = userInfo.uid;
        this.usersOnline.push({ uid: userInfo.uid, name: userInfo.displayName});
        this.usersUidsBjt = this.usersUids.subscribe((data)=>{
          for(let i=0;i<data.length;i++){
            if(data[i]==this.userUid){
              this.admin=true;
            }
          }
        });
        this.timeObservableBjt = this.timeObservable.subscribe((snapshot)=>{
          let data = snapshot.val();
          if(data.min == 0 && data.seg == 0){
            let cad="";
            if(data.cycle==3){
              cad+="Ultimo Ciclo:"+(data.cycle+1);
            }else{
              cad+="Ciclo:"+(data.cycle+1);
            }
            if(data.state==true){
              cad+=" | Trabajo";
            }else{
              cad+=" | Descanso";
            }
            this.noti('Pomodoro Emkode',cad);
          }
          if(!this.admin){
            this.min = snapshot.val().min;
            this.seg = snapshot.val().seg;
            this.cycle = snapshot.val().cycle;
            this.state = snapshot.val().state;
          }
        });
      }else{
        this.userUid = "";
      }
    });
  }

  start(){
    this.ini = true;
    this.time = setInterval(()=>{
      if(!this.pause){
        this.seg++;
      }
      if(this.seg==60){
        this.min++;
        this.seg=0;
        if(this.cycle==3 && !this.state && this.min==25){
          this.min=0;
          this.cycle=0;
          this.state=!this.state;
        }else if(this.state && this.min==25){
          this.min=0;
          this.state=!this.state;
        }else if(this.cycle<3 && !this.state && this.min==5){
          this.min=0;
          this.state=!this.state;
          this.cycle++;
        }
      }
      this.timeObservable.set({ seg: this.seg,min : this.min, cycle : this.cycle, state : this.state});
    },1000);
  }

  stop(){
    clearInterval(this.time);
    this.seg = 0;
    this.min = 0;
    this.cycle = 0;
    this.state = true;
    this.timeObservable.set({ seg: this.seg,min : this.min, cycle : this.cycle, state : this.state});
    this.ini = false;
  }

  pauseB(){
    this.pause=!this.pause;
  }

  logout() {
    if(this.userBjt)
      this.userBjt.unsubscribe();
    if(this.usersUidsBjt)
      this.usersUidsBjt.unsubscribe();
    if(this.timeObservableBjt)
      this.timeObservableBjt.unsubscribe();
    clearInterval(this.time);
    this.seg = 0;
    this.min = 0;
    this.cycle = 0;
    this.state = true;
    this.timeObservable.set({ seg: this.seg,min : this.min, cycle : this.cycle, state : this.state});
    this.admin=false;
    this.usersOnline.take(1).subscribe((items)=>{
      items.forEach(element => {
        if(element.uid == this.userUid){
          this.usersOnline.remove(element.$key); 
        }
      });
    });
    this.afAuth.auth.signOut();
  }
}

import { Component, OnInit, Directive } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take'
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { PushNotificationComponent } from 'ng2-notifications/ng2-notifications';

//@Directive({ selector: '[PushNotificationComponent]' })
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
  admin: Boolean = false;
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
    var options = {
        body:  '<h5>Hi</h5>',
        icon: 'img/sad_head.png',
    }

    var n = new Notification('Emogotchi says',options);
    setTimeout(n.close.bind(n), 5000);
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
        this.timeObservableBjt = this.timeObservable.subscribe(snapshot => {
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
    setInterval(()=>{
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

  pauseB(){
    this.pause=!this.pause;
  }

  logout() {
    this.userBjt.unsubscribe();
    this.usersUidsBjt.unsubscribe();
    this.timeObservableBjt.unsubscribe();
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

import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{
  user: Observable<firebase.User>;
  admin: Boolean = false;
  constructor(db: AngularFireDatabase, public afAuth: AngularFireAuth) {
    this.user = afAuth.authState;
  }
  ngOnInit() {
    
  }

  login() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    this.user.subscribe((data)=>{
      if(data){
        console.log(data.uid);
      }
    });
  }

  logout() {
    this.afAuth.auth.signOut();
  }
}

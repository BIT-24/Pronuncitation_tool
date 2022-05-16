import {Component, OnInit} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {RecordDialogComponent} from "../record-dialog/record-dialog.component";
import {User} from "./user";
import {USER_DATA} from "../data";
import {PronunciationService} from "./pronunciation.service";
import {DomSanitizer} from "@angular/platform-browser";

export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User[] = USER_DATA;
  selectedUser: User = this.user[0]
  audioFile: BlobEvent | undefined;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;

  constructor(public dialog: MatDialog, private audioService: PronunciationService, private dom: DomSanitizer) {
    this.voices = [];
    this.selectedVoice = null;
  }

  ngOnInit() {
    this.voices = speechSynthesis.getVoices();
    this.selectedVoice = (this.voices[0] || null);

    if (!this.voices.length) {
      speechSynthesis.addEventListener(
        "voiceschanged",
        () => {
          this.voices = speechSynthesis.getVoices();
          this.selectedVoice = (this.voices[0] || null);
          console.log(this.voices);
        }
      );
    }
  }
  audio: any;
  defaultPronunciation() {
    this.audioService
      .getUserNameAudio(this.selectedUser.firstName, this.selectedUser.lastName)
      .subscribe(data => {
        console.log(data);
        let urlBlob = URL.createObjectURL(data);
        this.audio = this.dom.bypassSecurityTrustUrl(urlBlob);
      });
  }

  userSelected(firstName: string) {
    this.selectedUser = this.user.filter(user => user.firstName === firstName)[0];
  }

  openRecordDialog() {
    let recordDialog = this.dialog.open(RecordDialogComponent,
      {
        height: '250px',
        width: '250px',
        disableClose: true
      });

    // TODO save the data returned to a database, need a service call
    recordDialog.afterClosed().subscribe(data => {
      console.log(data);
      this.audioFile = data;
      console.log(this.audioFile);
    });
  }

  speakPreferredPronunciation(firstName: string, lastName: string, voiceName: string){
    this.synthesizeSpeechFromText(1, `${firstName} ${lastName}`, voiceName);
  }

  private synthesizeSpeechFromText(
    rate: number,
    text: string,
    voiceName: string
  ): void {

    let speechSynthesisVoice = this.voices.filter(voice => voice.name === voiceName)[0];

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = speechSynthesisVoice ? speechSynthesisVoice : this.selectedVoice;
    utterance.rate = rate;

    speechSynthesis.speak(utterance);
  }

  listenName() {
    // TODO play with saved audio file returned from dialog box
    // TODO need to figure out how to play audio from blobevent
  }
}

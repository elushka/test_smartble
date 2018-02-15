import { Component, NgZone } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';

// OG Service UUIDs FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFF0
const UNLOCK_SERVICE = 'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFF0';
const LOCK = 'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFF4';
const NFC_READ = 'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFF3';

@Component({
  selector: 'page-detail',
  templateUrl: 'detail.html',
})
export class DetailPage {

  peripheral: any = {};
  pin: number;
  public compartments: any;
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private ble: BLE,
              public toastCtrl: ToastController,
              private ngZone: NgZone) {
    let device = navParams.get('device');
    this.ble.connect(device.id).subscribe(
      peripheral => this.onConnected(peripheral),
      peripheral => this.onDeviceDisconnected(peripheral)
    );
    this.compartments = [
                  "MacBook Pro 15",
                  "MacBook Air 13",
                  "Lenovo ThinkPad",
                  "MacBook Pro 13",
                  "MacBook Pro 15",
                  "Lenovo ThinkPad",
                  "MacBook Air 11",
                  "Empty Compartment",
                  "MacBook Pro 13",
                  "MacBook Pro 15",
                ];
  }

  onConnected(peripheral) {
    console.log('Connected to ' + peripheral.name + ' ' + peripheral.id);
    this.ngZone.run(() => {
      this.peripheral = peripheral;
    });

  }

  onDeviceDisconnected(peripheral) {
    let toast = this.toastCtrl.create({
      message: 'The peripheral unexpectedly disconnected',
      duration: 3000,
      position: 'center'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
      // TODO navigate back?
    });

    toast.present();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DetailPage');
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave disconnecting Bluetooth');
    this.ble.disconnect(this.peripheral.id).then(
      () => console.log('Disconnected ' + JSON.stringify(this.peripheral)),
      () => console.log('ERROR disconnecting ' + JSON.stringify(this.peripheral))
    )
  }

  showLongToast(phrase: string) {
      if(phrase == "0") {
          let toast = this.toastCtrl.create({
              message: 'Please return the correct device.',
              duration: 2000,

          });
          toast.present();
      }
      if(phrase == "1") {
          let toast = this.toastCtrl.create({
              message: 'Laptop returned successfully.',
              duration: 2000,
          });
          toast.present();
        }
    if(phrase == "2") {
        let toast = this.toastCtrl.create({
            message: 'NFC connection timeout, open shelf again',
            duration: 5000,
        });
        toast.present();
    }

  }

  ShelfUnlock(position: string) {
    let toast = this.toastCtrl.create({
      message: 'Unlocked!',
      duration: 2000,
      position: position
    });
    toast.present(toast);
  }
  returnLaptop(){
    this.ble.read(this.peripheral.id,UNLOCK_SERVICE,NFC_READ).then(
        buffer =>{
          let data = new Uint8Array(buffer);
            console.log('This is the data: '+data);
            console.log('This is the data zero: '+data[1]);
            console.log('This is the data buffer: '+data.buffer);
            this.showLongToast(data[1].toString());


        }
    )


  }
  setLock(pin){
    console.log('setLock');
    console.log('This is the pin: '+pin);
    if(pin == 9){
      pin = 2;
      this.returnLaptop();
    }
    let data = new Uint8Array([pin]);
    console.log('This is the data: '+data);
    console.log('This is the data buffer: '+data.buffer);
    this.ble.write(this.peripheral.id, UNLOCK_SERVICE, LOCK, data.buffer).then(
      () => console.log('Updated lock'),
      () => console.log('Error updating lock')
    );
    
    console.log('The write is done!!!');
  }

  actLock(i){
    this.pin = i;
    console.log("Pin rn: "+this.pin);
    this.setLock(this.pin);
  }
}
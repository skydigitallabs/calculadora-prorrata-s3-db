'use strict';

module.exports = class CalcProrratS3toDb {

  constructor(context, event, callback) {
    this.context = context;
    this.event = event;
    this.callback = callback;
  }

  async run() {
    console.log('Opa foi hein');
    console.log(`context: ${JSON.stringify(this.context)}`);
    console.log(`event: ${JSON.stringify(this.event)}`);
    console.log(`callback: ${this.callback}`);
  }
}
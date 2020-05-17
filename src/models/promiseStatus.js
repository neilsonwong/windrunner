class PromiseStatus {
  constructor(promiseId, status) {
    this.promiseId = promiseId;
    this.completed = status;
  }
}

module.exports = PromiseStatus;

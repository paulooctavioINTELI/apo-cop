class VoiceStateService {
  constructor() {
    this.userTimes = {};
  }

  handleVoiceStateUpdate(oldState, newState) {
    const userId = newState.id;
    if (!this.userTimes[userId]) {
      this.userTimes[userId] = {};
    }

    // Se o usuário se desconectou de um canal de voz
    if (oldState.channelId && !newState.channelId) {
        console.log('saiu');
        console.log(this.userTimes);
        this.calculateTimeInCall(userId, oldState.channelId);
    }

    // Se o usuário mudou de canal
    if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        console.log('mudou');
      this.calculateTimeInCall(userId, oldState.channelId);
      this.initUserChannel(userId, newState.channelId);
    }

    // Se o usuário se conectou a um novo canal de voz
    if (!oldState.channelId && newState.channelId) {
        console.log('entrou');
      this.initUserChannel(userId, newState.channelId);
      this.userTimes[userId][newState.channelId].joinTime = Date.now();
    }
  }

  calculateTimeInCall(userId, channelId) {
    const now = Date.now();
    const user = this.userTimes[userId];
    if (user && user[channelId] && user[channelId].joinTime) {
      const timeSpent = now - user[channelId].joinTime;
      user[channelId].totalTime = (user[channelId].totalTime || 0) + timeSpent;
      user[channelId].online = false
    }
  }

  getCurrentTimeInCall(userId, channelId) {
    const now = Date.now();
    const user = this.userTimes[userId];
    if (user && user[channelId] && user[channelId].joinTime) {
      return now - user[channelId].joinTime;
    }
    return 0;
  }

  initUserChannel(userId, channelId) {
    if (!this.userTimes[userId][channelId]) {
      this.userTimes[userId][channelId] = { totalTime: 0, joinTime: Date.now(), online: true };
    }
    this.userTimes[userId][channelId].joinTime = Date.now()
    this.userTimes[userId][channelId].online = true
  }

  resetUserTimes() {
    this.userTimes = {};
  }

  getUserTimes() {
    // console.log(this.userTimes);
    return this.userTimes;
  }
}

module.exports = new VoiceStateService();

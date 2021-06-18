import { gravity } from '../config/gravity.cjs';
import Worker from './_worker.mjs';
import User from '../models/user.mjs';


export default class RegistrationWorker extends Worker {
  async checkRegistration(workerData, jobId, done) {
    const data = workerData;
    const accessData = JSON.parse(gravity.decrypt(data.accountData));
    const timeNow = Date.now();
    const timeLimit = 60 * 1000 * 30; // 30 minutes limit
    let registrationCompleted = false;
    let res;

    if ((timeNow - data.originalTime) > timeLimit) {
      done();
      return { success: false, message: 'Time limit reached. Job terminated.' };
    }

    const response = await gravity.getUser(
      accessData.account,
      accessData.passphrase,
      accessData,
    );

    const database = response.database || response.tables;
    // const { tableList } = response;
    const tableBreakdown = gravity.tableBreakdown(database);

    if (response.error) {
      done();
      this.addToQueue('completeRegistration', data);
      console.log('There was an error retrieving user information');
      console.log(response);
      return { error: true, message: 'Error retrieving user information' };
    }

    if (data.userDataBacked
      && data.usersExists
      && data.channelsExists
      && data.invitesExists
      && data.channelsConfirmed) {
      done();
      this.socket.emit(`fullyRegistered#${accessData.account}`);
      return { success: true, message: 'Worker completed' };
    }


    if (!gravity.hasTable(database, 'users') && !data.usersExists) {
      console.log('users table does not exist');
      try {
        console.log('Creating user table');
        res = await gravity.attachTable(accessData, 'users', tableBreakdown);
        res = { success: true };
        data.usersExists = true;
        data.usersConfirmed = false;
      } catch (e) {
        res = { error: true, fullError: e };
      }
      if (res.error) {
        console.log(res.error);
        if (res.fullError === 'Error: Unable to save table. users is already in the database') {
          data.usersExists = true;
          data.usersConfirmed = false;
        }
      }
      done();
      this.addToQueue('completeRegistration', data);
      return res;
    }

    if (gravity.hasTable(database, 'channels') && !data.channelsConfirmed) {
      data.channelsConfirmed = true;
      this.socket.emit(`channelsCreated#${accessData.account}`);
    }

    if (!gravity.hasTable(database, 'channels') && !data.channelsExists) {
      console.log('Channels table does not exist');
      try {
        res = await gravity.attachTable(accessData, 'channels', tableBreakdown);
        res = { success: true };
        data.channelsExists = true;
        data.channelsConfirmed = false;
      } catch (e) {
        res = { error: true, fullError: e };
      }

      if (res.error) {
        console.log(res.error);
      }
      done();
      this.addToQueue('completeRegistration', data);
      return res;
    }

    if (!gravity.hasTable(database, 'invites') && !data.invitesExists) {
      try {
        res = await gravity.attachTable(accessData, 'invites', tableBreakdown);
        res = { success: true };
        data.invitesExists = true;
        data.invitesConfirmed = false;
      } catch (e) {
        res = { error: true, fullError: e };
      }

      if (res.error) {
        console.log(res.error);
      }
      done();
      this.addToQueue('completeRegistration', data);
      return res;
    }

    if (response.userNeedsSave && !data.userDataBacked) {
      console.log('User needs user information to be saved');
      const userData = response.user;
      const userTableData = this.findUserTableData(database);
      if (userTableData.address) {
        const user = new User(JSON.parse(userData));
        let userSaveResponse;
        try {
          userSaveResponse = await user.save(accessData, userTableData);
        } catch (e) {
          userSaveResponse = { error: true, fullError: e, message: 'Error saving user data backup' };
          console.log(e);
          done();
          this.addToQueue('completeRegistration', data);
          return userSaveResponse;
        }

        if (userSaveResponse.success) {
          data.userDataBacked = true;
          data.waitingForFullConfirmation = true;
        }
      }
      done();
      this.addToQueue('completeRegistration', data);
      return { success: true, message: 'User information is being applied' };
    }

    if (data.waitingForFullConfirmation) {
      if (response.databaseFound && !response.noUserTables) {
        registrationCompleted = true;
        this.socket.emit(`fullyRegistered#${accessData.account}`);
      }
    }

    if (!data.waitingForFullConfirmation
      && response.databaseFound
      && !response.noUserTables) {
      registrationCompleted = true;
      this.socket.emit(`fullyRegistered#${accessData.account}`);
    }

    done();
    if (!registrationCompleted) {
      // console.log('No fully registered');
      // console.log(data);
      this.addToQueue('completeRegistration', data);
    }
    return { success: true, message: 'Worker completed' };
  }

  findUserTableData(database) {
    let userTable = {};
    for (let x = 0; x < database.length; x += 1) {
      const thisTable = database[x];
      if (thisTable.users) {
        userTable = thisTable.users;
      }
    }
    return userTable;
  }
}

// module.exports = RegistrationWorker;

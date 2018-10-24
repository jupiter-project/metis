import { gravity } from '../config/gravity';
import Worker from './_worker';
import User from '../models/user';


class RegistrationWorker extends Worker {
  async checkRegistration(workerData, jobId, done) {
    const data = workerData;
    const accessData = JSON.parse(gravity.decrypt(data.accountData));
    const timeNow = Date.now();
    const timeLimit = 60 * 1000 * 30; // 30 minutes limit
    let registrationCompleted = false;

    if ((timeNow - data.originalTime) > timeLimit) {
      done();
      return { success: false, message: 'Time limit reached. Job terminated.' };
    }

    const response = await gravity.getUser(
      accessData.account,
      accessData.passphrase,
      accessData,
    );

    if (response.error) {
      done();
      this.addToQueue('completeRegistration', data);
      console.log('There was an error retrieving user information');
      console.log(response);
      return { error: true, message: 'Error retrieving user information' };
    }

    if (response.noUserTables) {
      let res;
      let usersExists = false;
      let channelsExists = false;
      let invitesExists = false;


      response.tables.forEach((table) => {
        if (table.users) {
          usersExists = true;
        }
        if (table.channels) {
          channelsExists = true;
        }
        if (table.invites) {
          invitesExists = true;
        }
      });

      if (!usersExists && !data.usersExists) {
        console.log('Users table does not exist');
        try {
          res = await gravity.attachTable(accessData, 'users');
          res = { success: true };
          data.usersExists = true;
        } catch (e) {
          res = { error: true, fullError: e };
        }

        if (res.error) {
          done();
          console.log(res.error);
          this.addToQueue('completeRegistration', data);
          return { error: true, message: 'There was an error', fullError: res };
        }
      }

      if (!channelsExists && !data.channelsExists) {
        console.log('Channels table does not exist');
        try {
          res = await gravity.attachTable(accessData, 'channels');
          res = { success: true };
          data.channelsExists = true;
        } catch (e) {
          res = { error: true, fullError: e };
        }

        if (res.error) {
          done();
          console.log(res.error);
          this.addToQueue('completeRegistration', data);
          return { error: true, message: 'There was an error', fullError: res };
        }
      }

      if (!invitesExists && !data.invitesExists) {
        console.log('Invites table does not exist');
        try {
          res = await gravity.attachTable(accessData, 'invites');
          res = { success: true };
          data.invitesExists = true;
        } catch (e) {
          res = { error: true, fullError: e };
        }

        if (res.error) {
          done();
          console.log(res.error);
          this.addToQueue('completeRegistration', data);
          return { error: true, message: 'There was an error', fullError: res };
        }
      }
    }

    if (response.userNeedsSave && !data.userDataBacked) {
      console.log('User needs user information to be saved');
      const userData = response.user;
      const userTableData = this.findUserTableData(response.database);
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
        console.log('Seems to work now');
        this.socket.emit(`fullyRegistered#${accessData.account}`);
      }
    }

    if (!data.waitingForFullConfirmation
      && response.databaseFound
      && !response.noUserTables) {
      registrationCompleted = true;
      // console.log('Seems to work now');
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

module.exports = RegistrationWorker;

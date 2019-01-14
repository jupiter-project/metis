import controller from '../config/controller';
import { gravity } from '../config/gravity';
import metis from '../config/metis';

module.exports = (app) => {
  app.get('/data/members', controller.isLoggedIn, async (req, res) => {
    const tableData = {
      account: req.headers.channeladdress,
      password: req.headers.channelkey,
    };

    const memberList = await metis.getMember({
      channel: tableData.account,
      account: req.user.record.account,
      password: tableData.password,
    });

    res.send(memberList);
  });

  app.post('/data/members', controller.isLoggedIn, async (req, res) => {
    console.log(req.body);
    const tableData = {
      account: req.body.channeladdress,
      password: req.body.channelkey,
    };

    console.log(tableData);

    const response = await metis.addToMemberList({
      channel: tableData.account,
      account: req.user.record.account,
      password: tableData.password,
      alias: req.user.record.alias,
    });

    res.send(response);
  });
};

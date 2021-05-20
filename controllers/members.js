import controller from '../config/controller';
import metis from '../config/metis';

const _ = require('lodash');
const device = require('express-device');

module.exports = (app) => {
  app.use(device.capture());
  app.get('/data/members', controller.isLoggedIn, async (req, res) => {
    const tableData = {
      account: req.headers.channeladdress,
      password: req.headers.channelkey,
    };

    const memberList = await metis.getMember({
      channel: tableData.account,
      account: req.device.type === 'phone' ? req.headers.channelpublic : req.user.record.account,
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
      account: _.get(req, 'user.record.account', req.headers.account),
      password: tableData.password,
      alias: _.get(req, 'user.record.alias', req.headers.alias),
    });

    res.send(response);
  });
};

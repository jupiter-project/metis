const querystring = require('querystring');
const config = require('../config');
const axios = require('axios');
const crypto = require('crypto');

/**
 *
 * @param jupiterAccount
 * @returns {boolean}
 */
function isWellFormedJupiterAccount(jupiterAccount) {

    if (isEmpty(jupiterAccount)) {
        return false;
    }

    const jAccount = jupiterAccount.toLowerCase();

    if (jAccount.includes('jup-')) {
        return true;
    }

    return false;
}


/**
 *
 * @param str
 * @returns {boolean}
 */
function isEmpty(str) {
    return (!str || str.length === 0);
}


/**
 *
 * @param alias
 * @returns {Promise<string|*>}
 */
async function getJupiterAccountFromAlias(alias) {

    if (isEmpty(alias)) {
        throw new Error('alias string cannot be empty');
    }

    try {
        const aliasResponse = await this.getAlias(alias);
        return aliasResponse.accountRS;

    } catch (error) {
        logger.info("Error getting jupiter account from alias", error);
        throw error;
    }
}

/**
 *
 * @param data
 * @param password
 * @returns {string}
 */
function encrypt(data, password= null) {
    const pwd = (password) ? password : config.encryptPassword;
    const algorithm = config.encryptAlgorithm;
    const cipher = crypto.createCipher(algorithm, pwd);
    const inputEncoding = 'utf8';
    const outputEncoding = 'hex';

    let encryptedData = cipher.update(data, inputEncoding, outputEncoding);
    encryptedData += cipher.final(outputEncoding);

    return encryptedData;
}


/**
 *
 * @type {{sendMessage(*, *, *=, *=): Promise<*>, encryptAndSendMessage(*=, *=, *=, *=, *=): Promise<*>}}
 */
module.exports = {

    async encryptAndSendMessage(data, passphrase, recipientRS, recipientPublicKey=null, encryptionPassword=null) {
        const encryptedData = encrypt(data, encryptionPassword);
        return this.sendMessage(encryptedData,passphrase,recipientRS,recipientPublicKey);
    },

    async sendMessage(data, passphrase, recipientRS, recipientPublicKey = null) {
        let urlParameters = {requestType: 'sendMessage'};

        urlParameters.passPhrase = passphrase;
        urlParameters.messageToEncrypt = data;
        urlParameters.compressMessageToEncrypt = true;
        urlParameters.recipient = recipientRS;
        if (!isWellFormedJupiterAccount(recipientRS)) {
            urlParameters.recipient = getJupiterAccountFromAlias(recipientRS);
        }

        if (recipientPublicKey) {
            urlParameters.recipientPublicKey = recipientPublicKey;
        } else {
            urlParameters.messageIsPrunable = true;
        }

        urlParameters.feeNQT = config.jupiter.feeNqt;
        urlParameters.deadline = config.jupiter.deadline;

        const urlQueryString = querystring.stringify(urlParameters);
        const sendMessageUrl = config.jupiter.server + '/nxt?' + urlQueryString;
        return axios.post(sendMessageUrl).then((response) => {
            if (response.data.broadcasted && response.data.broadcasted === true) {
                return response.data;
            } else {
                return Promise.reject(response);
            }
        }).catch((error) => {
            return Promise.reject('sendMessage Error:  ' + error);
        });
    }

}

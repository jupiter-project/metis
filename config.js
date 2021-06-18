// config.js
const dotenv = require('dotenv');
// dotenv.config();
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}
module.exports = {
    version : process.env.VERSION,
    environment : process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'Development' || process.env.NODE_ENV === undefined,
    jupiter: {
        feeNqt : process.env.JUPITER_FEE_NQT,
        deadline: process.env.JUPITER_DEADLINE,
        minimumTableBalance: process.env.JUPITER_MININUM_TABLE_BALANCE,
        minimumAppBalance: process.env.JUPITER_MINIMUM_APP_BALANCE,
        moneyDecimals: process.env.JUPITER_MONEY_DECIMALS,
        server : process.env.JUPITER_SERVER
    },
    certFileName : process.env.CERTFILE,
    keyFileName : process.env.KEYFILE,
    app : {
        name : process.env.APP_NAME,
        owner: {
            firstName: '',
            lastName: '',
            email: process.env.EMAIL,
            isAdmin: true,
            secretKey:'',
            twofa_enabled: false,
            twofa_completed: false,
        },
        apiKey: process.env.APP_API_KEY,
        passPhrase : process.env.APP_ACCOUNT,
        accountId: process.env.APP_ACCOUNT_ID,
        accountAddress : process.env.APP_ACCOUNT_ADDRESS,
        fundingProperty: generateFundingProperty(process.env.APP_ACCOUNT_ADDRESS),
        publicKey : process.env.APP_PUBLIC_KEY,
        port : process.env.APP_PORT
    },
    encryptAlgorithm : process.env.ENCRYPT_ALGORITHM,
    encryptPassword : process.env.ENCRYPT_PASSWORD,
    sessionSecret: process.env.SESSION_SECRET,

    refreshToken: process.env.REFRESH_TOKEN,
    clientSecret: process.env.CLIENT_SECRET,
    clientId: process.env.CLIENT_ID,
    apnPassPhrase: process.env.APN_PASSPHRASE,
    socketServer: process.env.SOCKET_SERVER,
    logFilePath: process.env.LOG_FILE_PATH,

    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },

    mongo : {
        host: process.env.MONGO_HOST,
        port: process.env.MONGO_PORT,
        dbName: process.env.MONGO_DB_NAME,
        connectionFormat: process.env.MONGO_CONNECTION_FORMAT,
        user: process.env.MONGO_USER,
        password: process.env.MONGO_PASSWORD,
        queryString: process.env.MONGO_QUERY_STRING,
        url:`${process.env.MONGO_CONNECTION_FORMAT}${process.env.MONGO_HOST}/${process.env.MONGO_DB_NAME}:${process.env.MONGO_PORT}`,
        url2:`${process.env.MONGO_CONNECTION_FORMAT}${process.env.MONGO_USER}@${process.env.MONGO_HOST}/${process.env.MONGO_DB_NAME}${process.env.MONGO_QUERY_STRING}`,
        options : { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true }
    },
    jobQueue : {
        port : process.env.JOB_QUEUE_PORT
    }
};

function generateFundingProperty(appAccountAddress){
    const addressBreakdown = appAccountAddress ? appAccountAddress.split('-') : [];
    const fundingProperty = `funding-${addressBreakdown[addressBreakdown.length - 1]}`;

    return fundingProperty;
}

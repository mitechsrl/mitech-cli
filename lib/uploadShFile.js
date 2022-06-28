
module.exports.uploadShfile = async (session, srcFile, dstFile) => {
    // carico il file setup-redis.sh che contiene tutti i comandi bash da eseguire sul server
    await session.uploadFile(srcFile, dstFile);
    // passo dos2unix per evitare problemi coding windows
    await session.command('dos2unix ' + dstFile);
    // eseguo setup.sh sul server
    await session.command('sudo chmod +x ' + dstFile);
};

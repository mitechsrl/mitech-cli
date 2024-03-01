const { readFileSync } = require('fs');

const crypto = require('crypto');
const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', async () => {
    
    async function shell(onOpen){
        await new Promise((resolve,reject) => {
            conn.shell({ term: 'xterm-256color', height: process.stdout.height, width: process.stdout.width }, (err, stream) => {
                if (err) return reject(err);
                
                const resizeEvent = () => stream.setWindow(process.stdout.rows, process.stdout.columns);
                process.stdout.on('resize', resizeEvent);

                const onCloseEvent = (code, signal) => {
                    stream.removeAllListeners();
                    process.stdout.removeListener('resize', resizeEvent);
                    resolve();
                };
                stream.on('close', onCloseEvent );    
                
                function end(){
                    stream.close();
                }

                function exec(command) {
                    return new Promise(resolve => {
                        // Trucco: con ".shell" non si sa bene quando le cose finiscono perchè 
                        // si interagisce solo tramite uno stream senza eventi ne comandi. PErsapere 
                        // quando un comando finisce, accodo sempre un "echo QUALCOSA"
                        // e poi processo lo stream in ingresso alla ricerca di quell'echo.
                        // Quando lo trovo significa che il comando è finito e posso proseguire.
                        // Ulteriore trucco: ci accodo il codice di uscita per sapere come è andato il comando.
                        const endCommandTag = 'COMMAND-COMPLETED-'+crypto.createHash('md5').update(command).digest('hex');
                        const endCommandTagMatchRegex = new RegExp(endCommandTag+'-([a-f0-1]+)$', 'm');

                        const matchEndCommand =(data) => {
                            const match = data.toString().match(endCommandTagMatchRegex);
                            if (match){
                                stream.stdout.removeListener('data', onData);
                                stream.stderr.removeListener('data', onError);
                                process.stdout.write('\n');
                                resolve({ exitCode: parseInt(match[1]) });
                            }
                        };
                        const onData = (data) => {
                            process.stdout.write(data);
                            matchEndCommand(data);
                        };
                        const onError = (data) => {
                            process.stderr.write(data);
                            matchEndCommand(data);
                        };
                        stream.stdout.on('data', onData);
                        stream.stderr.on('data',onError);

                        stream.write(command+`; echo ${endCommandTag}-$?\n`);
                    });
                }

                const sudoSu = async (user) => {
                    stream.write('sudo su '+user+'\n');
                    await new Promise(resolve => setTimeout(resolve, 1000));    
                };

                onOpen({
                    exec: exec,
                    end: end,
                    sudoSu: sudoSu,
                });
                
            });
        });
    }

    await shell(async session => {
        const result = await session.sudoSu('onit');
        //console.log(result);
        // const result3 = await session.exec('docker pull homeassistant/home-assistant');
        // console.log(result3);
        const result2 = await session.exec('docker pull redis');
        //console.log(result2);
        await session.end();
        conn.end();
    });
   
    console.log('Shell closed');
});

conn.connect({
    host: '192.168.0.187',
    port: 22,
    username: 'ivan',
    password: 'ivan'
});
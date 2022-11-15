# Mitech-cli
Mitech S.r.l. utility CLI

Questo pacchetto fornisce il comando **mitech**, utility ad uso interno di Mitech S.r.L.

## Prerequisiti
E' richiesto l'uso di Node 12 o superiore

## Installazione
```shell
git clone https://github.com/mitechsrl/mitech-cli.git
npm install
npm link
```
## Run
Digita **mitech** in console per vedere l'help.

## Comandi

**Nota help**: Aggiungendo in **qualsiasi** comando il parametro **-h**, la cli mostra l'help per quel comando, saltando l'esecuzione dello stesso. Vengono anche mostrati eventuali sottocomandi con loro descrizioni.

### mitech pm2
Proxy verso PM2 remoto. Digita un qualsiasi comando dopo *pm2* ed esso viene eseguito su un target remoto.
Vedi [documentazione pm2](https://pm2.io/docs/runtime/reference/pm2-cli/) su comandi utilizzabili.

**esempio**
```mitech pm2 logs``` esegue il comando ```pm2 logs``` su un target remoto via ssh e ne mostra il risultato

### mitech cscli
Proxy verso cscli remoto. Digita un qualsiasi comando dopo *cscli* ed esso viene eseguito su un target remoto.
Vedi [documentazione cscli](https://docs.crowdsec.net/docs/cscli/cscli/#see-also) su comandi utilizzabili.

**esempio**
```mitech cscli alerts``` esegue il comando ```cscli alerts``` su un target remoto via ssh e ne mostra il risultato


### mitech git merged
Verifica lo stato di merge di una branch specifica all'interno del repository locale

### mitech git unmerged
Visualizza la lista di branch non ancora mergiate nel repository locale

### mitech git updated
Visualizza la lista di commit eseguite dall'ultimo tag. Se non vi sono commit, signigica che la build corrispondente al tag selezionato contiene tutte le modifiche e non è necessario rieseguire una ulteriore build

### mitech workspace create
Crea un workspace npm alla directory corrente.

### mitech ssh connect
Avvia una sessione ssh interattiva verso un [target](#concetto-del-target) selezionato. E' neessario eseguire questo comando all'interno di una directory contenente un file [.mitechcli](#file-mitechcli)

### mitech ssh targets add
Crea un target nel file [.mitechcli](#file-mitechcli) alla directory corrente


## Concetto del target

Gran parte dell'ecosistema si basa su controllo remoto tramite ssh. Target identifica quindi il server remoto verso il quale eseguire la connessione ssh e i comandi stessi.

La cli gestisce i targets tramite un file [.mitechcli](#file-mitechcli) che può essere creato in una qualsiasi cartella. All'interno di questo file la cli va a inseire una struttura come segue:

```
{
    targets:[{                 
        name: string,
        host: string,
        ...
    },{                 
        name: string,
        host: string,
        ...
    }]
}
```

ogni qualvolta si lancia la cli in una directory contenente un file simile, viene mostrata la selezione del target voluto tra quelli listati nel file. Nel caso esista un solo target, la cli usa in automatico quello.

La lista dei targets usabili può essere visualizzata con **mitech ssh targets**

Per aggiungere un target oppure creare un file ex-novo, usa **mitech ssh targets add**

## Encrypt locale password
La cli memorizza le password in modo criptato all'interno dei file [.mitechcli](#file-mitechcli), in modo da non avere password in chiaro su filesystem.
La password per il crypt/decrypt viene gestita tramite vaiabili di ambiente, in modo da facilitare l'utente nell'esecuzione dei comandi.

Inserire nelle variabili di ambiente dell'utente corrente (tramite utility dedicata del proprio OS) la chiave **MitechCliEncryptionKey** valorizzata con una propria password.

NOTA 1: se si presentano problematiche di case sensitivity, **process.env.MITECHCLIENCRYPTIONKEY** e **process.env.mitechcliencryptionkey** vengono altresi riconosciute.

NOTA 2: Se si vuole utilizzare la password custom, crearla il prima posibile poichè se cambiata DOPO averla già utilizzata per codificare valori, si perde l'abilità di decodifica su credenziali vecchie.

## File .mitechcli
Il file .mitchcli permette la configurazione di alcuni comandi.

La cli accetta diversi formati e filenames per questo file:
- **.mitechcli.json**: file testuale contenente un oggetto json
- **.mitechcli**: come mitechcli.json
- **.mitechcli.js**: file javascript, deve esportare come unico elemento un oggetto json ```module.exports = {...}```.

La cli verifica la presenza del file nelle directory (rispettivamente, in ordine di precedenza) di esecuzione, padre e nonno.

Il file può essere creato in automatico (ad esempio tramite mitech ssh targets add), e presenta una struttura simile a

```json
{   
    "projects": [], // vedi sotto
    "targets": [] // vedi sotto
}
```
### Nota su staging/commit

Tale file potrebbe contenere valori dipendenti dall'environment locale (come ad esempio path di chiavi ssh) pertanto è pressochè proibito il commit di tale file eccetto il caso in cui non vi siano tali dipendenze (in caso contrario chi fa pull riceverebbe files con path molto probabilmente invalidi sul proprio pc).

Prestare attenzione caso per caso alla fatibilità o meno della cosa.
### targets
Array di oggetti, ognuno dei quali definisce un [target](#concetto-del-target) configurato in questa directory. Ogni target segue la struttura definita come:
```json
{
    "name": "ferroli-db-server", // stringa generica
    "host": "name.server.com", // hostname del server remoto 
    "port": 22, // porta ssh
    "username": "server-username", // server username. Deve supportare sudo senza password.
    "accessType": "sshKey", // sshKey oppure password
    "sshKey": "file.pem", // necessario solo se accessType = "sshKey"
    "password":{
        // oggetto definizione password, necessario solo se accessType="password". E' oggetto criptato, vedi "#Encrypt locale password". Non si specifica come creare l'oggetto manualmente, crearlo tramite "mitech ssh tragets add"
    },
    "nodeUser": "onit", // user processi onit
    "activate": false // Non ricordo a cosa serve?????
},
```

#### projects

Projects permette di configurare il comando *mitech deploy project*

TODO

## Aggiungere comandi
La cli è fatta in modo da caricare dinamicamente come comandi i nomi delle cartelle presenti in bin/

esempio:
- **mitech publish** esegue la configurazione definita in **/bin/publish/commandConfig.ts**
- **mitech publish test** esegue la configurazione definita in  **/bin/publish/test/commandConfig.ts**
- **mitech publish test -p 1 -c 3 -d 4** esegue la configurazione definita in  **/bin/publish/test/commandConfig.ts** passando alla funzione di **exec** l'oggetto **argv** pari a ```{p:1,c:3, d:4}```

Per creare un nuovo comando è quindi necessario creare una cartella in **/bin/path/del/comando** e inserire in esso un file **commandConfig.ts** che abbia la seguente struttura:

```js
import { Command } from '../../types';

// src\types\command.ts
const config: Command = {
    description: 'Utility gestione target remoti pm2',
    exec: './exec', // file da eseguire al lancio del comando. Corrisponde a exec.ts
    longHelp:'Mostrami come body du quando l\'utente usa -h',
    params: [] // Array di parametri CMD da gestire. Vedi command.ts per info
};

export default config;
```

Aggiungere quindi il file definito alla proprietà **exec** del file **commandConfig.ts** (exec.ts in questo caso)

```js
import yargs from 'yargs';
import { logger } from '../../lib/logger';
import { CommandExecFunction } from '../../types';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<unknown>) => {
    // argv contiene i parametri processati.
    // Inserire qui la propria implementazione 
    logger.warn('Sono stato eseguito');
};

//export funzione come default per essere chiamata dal gestore dei comandi.
export default exec;
```

Una volta aggiunto i comando, esegui ```npm run build``` per eseguire la build typescript.

## Howto's

### Da server nuovo, senza nulla di installato, ad app deploy
Presupposti:

- Si ha a disposizione un file di pm2 ecosystem.config.json e una app node, nella struttura:
    ```
    - ecosystem.config.json
    - hello-world-app
       - package.json
       - index.json
    ```
    e si è posizionati, con la cli locale, nella cartella contenente *ecosystem.config.json*. Si suppone che il file ecosystem.config.pm2 sia opportunamente valorizzato

- Si ha a disposizione hostname e credenziali di root del server in questione

Digitare quindi i seguenti comandi per installare l'ambiente node ed eseguire il deploy di una app node:

```
mitech ssh targets add // aggiungi target rispondendo alle domande del cli
mitech vm pre-setup // verifica eventuali problemi da risolvere manualmente prima di eseguire il setup 
mitech vm setup node // installa ambiente node su server. Seguire le domande a prompt
mitech vm setup crowdsec // installa crowdsec sul server. 
mitech vm setup mongodb // installa mongodb su server. Seguire le domande a prompt
mitech deploy pm2 // carica il file ecosystem.config.js senza fare nient'altro
cd hello-world-app
mitech deploy app // carica l'app hello-world-app e la avvia (o riavvia se già presente)
```


## Licenza
Questo pacchetto è distribuito sotto licenza [WFTPL](./LICENSE), [http://www.wtfpl.net/](http://www.wtfpl.net/). 
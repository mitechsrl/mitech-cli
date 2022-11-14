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

### Comandi help
Aggiungendo in **qualsiasi** comando il parametro **-h**, la cli mostra l'help per quel comando, saltando l'esecuzione dello stesso


### Aggiungere comandi
La cli è fatta in modo da caricare dinamicamente come comandi i nomi delle cartelle presenti in bin/

esempio:
- **mitech publish** esegue lo script configurato in **/bin/publish**
- **mitech publish test** esegue lo script configurato in **/bin/publish/test**
- **mitech publish test -p 1 -c 3 -d 4** esegue lo script configurato in **/bin/publish/test** passando i parametri **-p 1 -c 3 -d 4**

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

Aggiungere quindi il file di **exec** (exec.ts in questo caso)
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

### Concetto del 'target'

Gran parte dell'ecosistema si basa su controllo remoto tramite ssh. Target identifica quindi il server remoto verso il quale eseguire la connessione ssh e i comandi stessi.

La cli gestisce i targets tramite un file **.mitechcli.json** che può essere creato in una qualsiasi cartella. All'interno di questo file la cli va a inseire una struttura come segue:

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

## Comandi disponibili

Digita **mitech -h** per la lista dei comandi di primo livello. Puoi usare poi **mitech comando -h** per ottenere ricorsivamente la lista dei comandi di secondo livello e così via.

## Encrypt locale password
La cli memorizza le password in modo criptato all'interno dei file .mitechcli, ma la password per il crypt/decrypt viene gestita tramite vaiabili di ambiente, in modo da facilitare l'utente nell'esecuzione dei comandi.

Inserire nelle variabili di ambiente dell'utente corrente (tramite utility dedicata del proprio OS) la chiave **MitechCliEncryptionKey** valorizzata con una propria password

NOTA: se si presentano problematiche di case sensitivity, process.env.MITECHCLIENCRYPTIONKEY e  process.env.mitechcliencryptionkey vengono altresi riconosciute

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
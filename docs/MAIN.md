# mitech-cli
Experimental mitech command line interface. Digita **mitech** in console per vedere l'help

### Installazione

 - Clona questo repository

 - npm install && npm link

NOTA: npm link aggiunge la definizione di 'mitech' come comando nel path di sistema, rendendolo disponibile in qualsiasi directory da cmd

### Comandi help

Aggiungendo in **qualsiasi** comando il parametro **-h**, la cli mostra l'help per quel comando, saltando l'esecuzione dello stesso


### Aggiungere comandi
La cli è fatta in modo da caricare dinamicamente come comandi i nomi delle cartelle presenti in bin/

esempio:

**mitech publish** esegue lo script index.js in /bin/publish

**mitech publish test** esegue lo script index.js in /bin/publish/test

**mitech publish test -p 1 -c 3 -d 4** esegue lo script index.js in /bin/publish/test passandogli i parametri **-p 1 -c 3 -d 4**

Per creare un nuovo comando è quindi sufficiente creare una cartella nominata come il comando e inserire in esso un file index.js che abbia la seguente definizione minima:

```
module.exports.info = "descrizione breve comando, compare in head ";
module.exports.help = [
    "Una qualche stringa singola qui da stampare singolarmente non formattata in colonna",
    ['-h', "Descrizione comando, stampa con formattazione uniforme in due colonne"]
]
module.exports.catchUnimplementedParams = boolean; // se true, i comandi non trovati sottoforma di dir vengono gestiti da questo script
module.exports.cmd = async function (basepath, params) {
   // basepath: path di questo script
   // params: parametri passati dalla CLI

   // esegui js del comando
}

```

# Concetto del 'target'

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

# Comandi disponibili

#### deploy
Utility deploy su VM

**mitech deploy pm2** Carica il file ecosystem.config.json della cartella corrente al server. Se **-reload** è specificato, al termine del caricamento viene ricaricato pm2. Se si spacifica anche **-only appname** si ricarica solo l'app **appname**

**mitech deploy app** Carica il progetto node della cartella corrente sul server remoto e lo avvia

NOTA: per il deploy è possibile escludere alcuni files dal caricamento specificando il file **.mitechcliignore**, avente la stessa sintassi di **.gitignore**.
Per default, le cartelle *node_modules* e .*git*  non vengono caricate

**mitech deploy files -s somethingIn -d somewhereOut** Carica il file (o l'intera cartella) somewhereIn sulla cartella apps/somewhereOut sul server remoto.
NOTA: somewhere out può essere omesso ed equivale a copiare il file voluto nella cartella apps/ del server remoto

**mitech deploy backups list** Mostra la lista di backup disponibili (eseguiti in fase di deploy delle apps)

**mitech deploy backups restore -p appName -a archivePath** Esegue restore dell'archivio specificato come app specificata


#### eslint 
Utility gestione eslint

**mitech eslint init** installa nel progetto alla cartella corrente tutte le dipendenze e i files di configurazione necessari alla gestione di eslint.

#### npm 
Utility gestione registry NPM privato. Per registry privato si intende un registry alternativo a **npmjs.com** il quale richiede autenticazione per l'accesso.

**mitech npm registry** Visualizza la lista di registry disponibili

**mitech npm registry add** Aggiunge un nuovo registry. La procedura richiede l'uso di scope e di due account, uno dedicato all'amministratore con permessi di caricamento, uno dedicato ad un utente readonly, con soli permessi di lettura. Resta obbligatoro l'inserimento del doppio account, tuttavia non è obbligatorio che essi siano diversi. In questo ultimo caso tenere a mente che chiunque richieda accesso al registry disporrà di un account in grado di pushare/eliminare pacchetti.

**mitech npm registry delete** Avvia la procedura per rimuove un regstry npm

**mitech npm authorize** Aggiunge nella cartella corrente il file **.npmrc** con le credenziali necessarie ad accedere al registry mitech

**mitech npm delete -p packageName** Rimuove dal registry mitech il pacchetto **packageName**

**mitech npm publish** Pubblica sul registry mitech la directory corrente come pacchetto npm. Accetta due parametri: **-y** conferma in automatico ogni richiesta senza bloccare il processo, **-r ID** definisce l'id del registry da selezionare automaticamente nel caso ve ne siano piu di uno. Questi due parametri risultano fondamentali per automatizzare la procedura di push.

NOTA 1: i dettagli/credenziali dei registry sono memorizzati in *%appdata%/mitech-cli/npm/config.json* (windows).
NOTA 2: Nel caso siano listati piu registry, la cli chiede quale registry usare nel momento opportuno. 


#### pm2 
Utility gestione pm2 remoto

**mitech pm2 <command>** Esegue **pm2 <command>** sul target remoto correntemente selezionato

#### ssh 
Utility gestione ssh e targets

**mitech ssh** mostra il target corrente

**mitech ssh targets** Mostra la lista dei targets disponibili

**mitech ssh targets add** Esegue un prompt per la creazione di un target. Vedi 'encrypt locale password' per info aggiuntive

**mitech ssh connect** Lancia una sessione ssh interattiva verso il target seleionato


#### vm 
Utility gestione VM. 

**NOTA: Tutti i comandi elencati sono targetizzati per una vm remota basata su ubuntu 20.04**



**mitech vm pre-setup** Avvia una serie di verifiche sul server remoto con lo scopo di informare l'utente se sono necessarie operazioni manuali prima dell'esecuzione del setup vero e proprio

**mitech vm setup node** Avvia il setup dell'environment node sul target corrente. Questo comando in particolare esegue i seguenti passi: 

- carica sul server il file *bin\vm\setup\_node\setup.sh* e lo esegue
    
- sostituisce alcune variabili di ambiente nel file di configurazione di nginx *bin\vm\setup\_node\nginx-default.conf*

- carica sul server il sudddetto file e lo applica a nginx

**mitech vm setup mongodb** Esegue il setup di mongodb sul server remoto. Esegue:

- richiesta e set password admin

- richiesta username e password account dedicato all'uso in app esterne

- creazone account per app esterne con permessi su un db dedicato(db name = username in questo caso)

- creazione certificato ssl self-signed per connessione ssl/tls e setup ssl/tls in mongodb-server 

NOTA: onit-next (Versione basata su LB4) richiede una configurazione specifica dei permessi degli utenti- Utilizzare una versione compatibile tra quelle proposte.

**mitech vm os** mostra info su OS vm remota

**mitech vm reboot** esegue reboot del vm remota

**mitech vm shutdown** esegue shutdown del vm remota

**mitech vm uptime** mostra uptime vm remota

**mitech vm download -s path -d path** Esegue il download di un generico fle dalla vm remota. Usa -s per specificare il path del file sul server remoto, -d (opzionale) indica la directory di download di destinazione. Se omessa il file viene scaricato in cwd.

**mitech vm ssl** DA COMPLETARE IMPLEMENTAZIONE: installa certificato ssl sulla macchina remota

**mitech vm maintenance enable** Abilita modalità maintenance. Richiede previa configurazione corretta di nginx, non necessaria su nuove instllazioni. Il sistema remoto sarà raggiungibile solo dall'ip che ha richiesto il maintenance mode oppure da vpn mitech.

**mitech vm maintenance disable** Disabilita modalità maintenance.

# Encrypt locale password
La cli memorizza le password in modo criptato all'interno dei file .mitechcli, ma la password per il crypt/decrypt viene gestita tramite vaiabili di ambiente, in modo da facilitare l'utente nell'esecuzione dei comandi.

Inserire nelle variabili di ambiente dell'utente corrente (tramite utility dedicata del proprio OS) la chiave **MitechCliEncryptionKey** valorizzata con una propria password

NOTA: se si presentano problematiche di case sensitivity, process.env.MITECHCLIENCRYPTIONKEY e  process.env.mitechcliencryptionkey vengono altresi riconosciute
# Howto's

### Da server nuovo, senza nulla di installato, ad app deploy
Presupposti:

1) Si ha a disposizione un file di pm2 ecosystem.config.json e una app node, nella struttura:
```
- ecosystem.config.json
- hello-world-app
  - package.json
  - index.json
```
e si è posizionati, con la cli locale, nella cartella contenente *ecosystem.config.json*. Si suppone che il file ecosystem.config.pm2 sia ooprtunamente valorizzato

2) Si ha a disposizione hostname e credenziali di root del server in questione


Digitare quindi i seguenti comandi per installare l'ambiente node ed eseguire il deploy di una app node:

```
mitech ssh targets add // aggiungi target rispondendo alle domande del cli
mitech vm pre-setup // verifica eventuali problemi da risolvere manualmente prima di eseguire il setup 
mitech vm setup node // installa ambiente node su server. Seguire le domande a prompt
mitech vm setup mongodb // installa mongodb su server. Seguire le domande a prompt
mitech deploy pm2 // carica il file ecosystem.config.js senza fare nient'altro
cd hello-world-app
mitech deploy app // carica l'app hello-world-app e la avvia (o riavvia se già presente)
```




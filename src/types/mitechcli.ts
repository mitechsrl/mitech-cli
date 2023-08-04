
export type EncryptedPassword = {
    algo: string,
    iv: string,
    encryptedData: string
};

export type SshTarget = {
    // target name
    name: string,
    // Targte host
    host: string,
    // targte ssh port
    port: number,
    // default sh username
    username: string,
    // access type
    accessType: 'sshKey' | 'password',
    // Path of the ssh file. Defined only if accessType = sshKey
    sshKey?: string,
    // Password for ssh access. Defined only if accessType = password
    password?: EncryptedPassword | string,
    // User for node processes
    // UPDATE IV 20-07-2023: this value may refer to a generic user to run app, not just node! 
    nodeUser: string,
    // Whick environment expect on remote server.
    // This will run different commands for different environments
    environment: 'pm2'|'docker'
};

export type MitechCliFileContentProjectDeployment = {
    name: string,
    path: string,
    target: string,
};
export type MitechCliFileContentProject = {
    name?: string,
    uptimeCheck?: string,
    commonDependencies?: { [k:string]:string },
    deployments: { [k:string]: MitechCliFileContentProjectDeployment }
};

export type MitechCliFileContentDb = {
    type?: string,
    name?: string,
    host?: string,
    port?: string, // defaults 27017
    username?: string,
    password?: string|EncryptedPassword,
    tls?: boolean,
    databaseNames?: string[],
    dst?: string
};

export type MitechCliFileContent = {
    targets: SshTarget[],
    projects: MitechCliFileContentProject[],
    dbs: MitechCliFileContentDb[]
};

export type MitechCliFile = {
    file: string,
    content: MitechCliFileContent
}; 
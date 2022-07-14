module.exports.throwOnFatalError = (result) => {
    // search and match the generic fatal erro tag error tag
    const fatalErrorMatch = '[FATAL-ERROR]';
    const fatalErrorLine = result.split('\n').find(line => line.indexOf(fatalErrorMatch) >= 0);
    if (fatalErrorLine) {
        throw new Error('Deploy fallito');
    }
};

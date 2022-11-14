import inquirer from 'inquirer';
import { StringError } from '../../../types';

export async function presetupCheckConfirm(){
    const answers = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: 'Hai verificato la compatibilità del setup con <mitech vm pre-setup>?'
    }]);
    if (answers.confirm !== true) {
        throw new StringError('Verifica prima la compatibilità.');
    }
}